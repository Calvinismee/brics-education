<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MidtransService
{
    public function createSnapTransaction(Transaction $transaction): array
    {
        $transaction->loadMissing(['course', 'user']);

        $response = Http::withBasicAuth($this->serverKey(), '')
            ->acceptJson()
            ->post($this->snapBaseUrl().'/snap/v1/transactions', [
                'transaction_details' => [
                    'order_id' => $transaction->invoice_number,
                    'gross_amount' => (int) round((float) $transaction->amount),
                ],
                'item_details' => [
                    [
                        'id' => (string) $transaction->course_id,
                        'price' => (int) round((float) $transaction->amount),
                        'quantity' => 1,
                        'name' => mb_substr($transaction->course?->title ?? 'Course Brics Education', 0, 50),
                    ],
                ],
                'customer_details' => [
                    'first_name' => $transaction->user?->name ?? 'Siswa Brics',
                    'email' => $transaction->user?->email,
                ],
                'enabled_payments' => $this->enabledPayments($transaction->payment_method),
                'callbacks' => [
                    'finish' => route('payment.status', $transaction),
                    'unfinish' => route('payment.status', $transaction),
                    'error' => route('payment.status', $transaction),
                ],
                'credit_card' => [
                    'secure' => (bool) config('services.midtrans.is_3ds', true),
                ],
            ]);

        try {
            $response->throw();
        } catch (RequestException $exception) {
            throw new RuntimeException(
                $exception->response?->json('error_messages.0')
                    ?? 'Gagal membuat transaksi Midtrans.',
                previous: $exception
            );
        }

        return $response->json();
    }

    public function transactionStatus(string $orderId): array
    {
        $response = Http::withBasicAuth($this->serverKey(), '')
            ->acceptJson()
            ->get($this->apiBaseUrl().'/v2/'.urlencode($orderId).'/status');

        try {
            $response->throw();
        } catch (RequestException $exception) {
            throw new RuntimeException('Gagal mengambil status transaksi Midtrans.', previous: $exception);
        }

        return $response->json();
    }

    public function isValidSignature(array $payload): bool
    {
        $signature = hash(
            'sha512',
            ($payload['order_id'] ?? '').
            ($payload['status_code'] ?? '').
            ($payload['gross_amount'] ?? '').
            $this->serverKey()
        );

        return hash_equals($signature, (string) ($payload['signature_key'] ?? ''));
    }

    public function clientKey(): ?string
    {
        return config('services.midtrans.client_key');
    }

    public function snapJsUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    private function enabledPayments(?string $paymentMethod): array
    {
        return match ($paymentMethod) {
            'transfer_bank' => ['bank_transfer'],
            'ewallet' => ['gopay', 'shopeepay'],
            'qris' => ['qris'],
            default => [],
        };
    }

    private function snapBaseUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    private function apiBaseUrl(): string
    {
        return $this->isProduction()
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    private function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production', false);
    }

    private function serverKey(): string
    {
        $serverKey = config('services.midtrans.server_key');

        if (! $serverKey) {
            throw new RuntimeException('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
        }

        return $serverKey;
    }
}
