<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MidtransService;
use App\Support\AdminNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function checkout(Request $request, MidtransService $midtrans): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'payment_method' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $course = Course::findOrFail($validated['course_id']);

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'invoice_number' => sprintf('INV-%s-%04d', now()->format('YmdHis'), random_int(0, 9999)),
            'amount' => $course->price,
            'payment_method' => $validated['payment_method'] ?? 'midtrans',
            'payment_status' => 'pending',
        ]);

        try {
            $snap = $midtrans->createSnapTransaction($transaction);
        } catch (\Throwable $exception) {
            $transaction->update(['payment_status' => 'failed']);

            throw ValidationException::withMessages([
                'payment' => $exception->getMessage(),
            ]);
        }

        $transaction->update([
            'payment_gateway_ref' => $snap['token'] ?? null,
        ]);

        AdminNotifier::transactionPending($user, $course->title, $transaction->invoice_number);

        return redirect()->route('payment.status', $transaction);
    }

    public function status(Request $request, Transaction $transaction, MidtransService $midtrans): Response
    {
        $this->authorizeTransactionAccess($request, $transaction);

        $transaction->load('course.category');

        return Inertia::render('PaymentStatus', [
            'transaction' => $transaction,
            'midtrans' => [
                'clientKey' => $midtrans->clientKey(),
                'snapToken' => $transaction->payment_gateway_ref,
                'snapJsUrl' => $midtrans->snapJsUrl(),
            ],
        ]);
    }

    public function notification(Request $request, MidtransService $midtrans): JsonResponse
    {
        $payload = $request->all();

        if (! $midtrans->isValidSignature($payload)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transaction = Transaction::where('invoice_number', $payload['order_id'] ?? null)->first();

        if (! $transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $this->applyMidtransStatus($transaction, $payload);

        return response()->json(['message' => 'OK']);
    }

    public function refresh(Transaction $transaction, MidtransService $midtrans): RedirectResponse
    {
        $this->authorizeTransactionAccess(request(), $transaction);

        try {
            $payload = $midtrans->transactionStatus($transaction->invoice_number);
            $this->applyMidtransStatus($transaction, $payload);
        } catch (\Throwable) {
            return back()->withErrors([
                'payment' => 'Status pembayaran belum bisa diperbarui. Coba lagi beberapa saat.',
            ]);
        }

        return back();
    }

    private function applyMidtransStatus(Transaction $transaction, array $payload): void
    {
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? $transaction->payment_method;
        $previousStatus = $transaction->payment_status;

        $newStatus = match ($transactionStatus) {
            'capture' => $fraudStatus === 'challenge' ? 'pending' : 'success',
            'settlement' => 'success',
            'pending' => 'pending',
            'deny', 'cancel', 'expire', 'failure' => 'failed',
            default => $transaction->payment_status,
        };

        DB::transaction(function () use ($transaction, $newStatus, $paymentType, $previousStatus) {
            $transaction->update([
                'payment_method' => $paymentType,
                'payment_status' => $newStatus,
                'paid_at' => $newStatus === 'success' ? ($transaction->paid_at ?? now()) : $transaction->paid_at,
            ]);

            if ($newStatus === 'success') {
                $enrollment = Enrollment::updateOrCreate(
                    [
                        'user_id' => $transaction->user_id,
                        'course_id' => $transaction->course_id,
                    ],
                    [
                        'status' => 'active',
                        'enrolled_at' => now(),
                    ]
                );

                $transaction->update(['enrollment_id' => $enrollment->id]);
            }
        });

        if ($newStatus === 'success' && ! in_array($previousStatus, ['paid', 'success'], true)) {
            $transaction->loadMissing(['course', 'user']);
            $student = $transaction->user ?? User::find($transaction->user_id);

            if ($student) {
                AdminNotifier::transactionSucceeded(
                    $student,
                    $transaction->course?->title ?? 'course terkait',
                    $transaction->invoice_number
                );
            }
        }

        if ($newStatus === 'failed' && $previousStatus !== 'failed') {
            $transaction->loadMissing(['course', 'user']);
            $student = $transaction->user ?? User::find($transaction->user_id);

            if ($student) {
                AdminNotifier::transactionFailed(
                    $student,
                    $transaction->course?->title ?? 'course terkait',
                    $transaction->invoice_number
                );
            }
        }
    }

    private function authorizeTransactionAccess(Request $request, Transaction $transaction): void
    {
        $user = $request->user();

        abort_unless($user && ((int) $transaction->user_id === (int) $user->id || $user->isAdmin()), 403);
    }
}
