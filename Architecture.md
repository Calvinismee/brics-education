# BRICS Education System Architecture

## 1. Purpose

BRICS Education is a Laravel + Inertia learning platform for SNBT preparation. It supports public course discovery, student package purchases, tutor-managed learning content and schedules, and an admin back office for operations, review, reporting, and account management.

The system is currently organized around three authenticated roles:

- `student`: buys packages, accesses enrolled courses, attends schedules, and consumes materials.
- `mentor`: the tutor role in the database. The UI often calls this role `tutor`.
- `admin`: manages operational data, reviews tutor content, monitors transactions, exports reports, and handles notifications.

`roles.id` and `users.role_id` are the source of truth for authorization. The legacy `users.role` string may still exist in older database states, but runtime code should treat it as read-only compatibility data and should not write to it.

## 2. Technology Stack

- Backend: PHP 8.3, Laravel 13, Laravel Breeze, Inertia Laravel 2, Laravel Sanctum, Ziggy.
- Database: PostgreSQL in development, test, and production-style environments. Local development can use PostgreSQL directly; hosted deployments commonly use Supabase PostgreSQL.
- Frontend: React, Inertia React, Tailwind CSS, Vite, lucide-react, sonner.
- External identity: Google Identity Services for student Google sign-in, with the legacy OAuth authorization-code redirect kept as a fallback path.
- Payment gateway: Midtrans Snap for package checkout and asynchronous payment status notifications.
- Object storage: local `public` disk for development/testing and S3-compatible storage such as Cloudflare R2 for production material uploads.
- Testing: Pest for PHP feature tests, Vitest and Testing Library for React tests.
- Styling: Tailwind with reusable React page/layout components.

## 3. Runtime Layers

The application follows a conventional Laravel monolith structure with an Inertia React frontend.

- HTTP routes live in `routes/web.php` and `routes/auth.php`.
- Controllers coordinate validation, authorization, database writes, and Inertia responses.
- Domain helpers in `app/Support` and services in `app/Services` keep shared behavior out of controllers.
- Eloquent models represent persistent domain objects and selected model events.
- React pages under `resources/js/Pages` render admin, tutor, student, and auth experiences.
- Layouts under `resources/js/Layouts` provide role-specific navigation shells.
- Middleware shares authenticated user data and notification data with Inertia.

Important shared helpers and services:

- `PackageEnrollmentService`: creates package enrollments after successful package purchase.
- `MidtransService`: creates Snap transactions, verifies Midtrans signatures, and fetches transaction status.
- `AdminNotifier`: creates admin-facing notifications for operational events.
- `AdminNotificationCache`: caches notification dropdown and stat payloads per admin.
- `TutorCourseResolver`: resolves tutor-course assignments across the legacy single-course column and the newer pivot table.
- `TutorSettings`: normalizes tutor preference settings.

## 4. Access Model

Authentication uses Laravel session auth. Role-specific login routes exist so users can intentionally switch between tutor and admin sessions.

- Public pages include the landing page, course detail, registration, and login pages.
- Checkout and payment status pages require an authenticated user. The Midtrans notification endpoint is intentionally public but protected by signature verification and CSRF exemption.
- Student pages require `auth` and include dashboard, course learning, schedules, and profile flows.
- Admin pages require `web`, `auth`, `verified`, and `admin` middleware.
- Tutor pages require `web`, `auth`, `verified`, and tutor/mentor middleware.

`POST /login` remains a guest route for the generic login form. `POST /login/admin` and `POST /login/tutor` are intentionally outside the guest group so a user already logged in as another role can submit a role-specific login and get a fresh session for the requested role. Login handlers regenerate the session, clear stale intended URLs, validate the authenticated role, and redirect to the correct dashboard.

Student Google sign-in is a session-auth flow, not a separate API token system. `LoginSiswa.jsx` loads Google Identity Services, renders the Google account chooser in-page, and posts the returned ID token to `POST /auth/google/credential`. `GoogleAuthController` verifies the token with Google, requires the token `aud` to match `services.google.client_id`, and then logs in or creates only a `student` account. The older `GET /auth/google` and `GET /auth/google/callback` OAuth code flow remains available for redirect-based fallback behavior.

## 5. Core Domain Model

### Users and Roles

- `roles`: canonical role records such as `student`, `mentor`, and `admin`.
- `users.role_id`: canonical role reference.
- `users.role`: legacy compatibility field, not the runtime source of truth.
- `users.mentor_course_id`: legacy single-course tutor assignment.
- `users.google_id`: optional Google subject identifier, unique when present, used to link student Google sign-ins.
- `users.google_avatar`: optional Google profile image URL.
- `users.gender`, `users.phone`, and `users.school_origin`: student profile fields editable from student profile surfaces.
- Tutor profile and settings columns support tutor-facing profile, notification, and preference pages.

The `User` model exposes a computed role accessor derived from `role_id`. Code that creates or updates users should set `role_id`; it should not assign `role` directly.

### Courses and Packages

- `courses`: learning courses visible to students and used by materials and schedules.
- `packages`: purchasable course bundles.
- `package_course`: package-to-course pivot.
- `course_tutor`: tutor-to-course pivot for multi-course tutor assignment.

`TutorCourseResolver` provides the compatibility layer for tutor assignments. It reads `users.mentor_course_id`, reads or syncs `course_tutor` when the table exists, and exposes helper methods such as `ids`, `sync`, and `isAssigned`.

### Purchases and Enrollment

- `transactions`: package purchase records. Current normalized payment states are `pending`, `success`, `failed`, and `expired`. Older rows may still contain `paid`.
- `enrollments`: student access to a course. Package purchases create one enrollment per course in the purchased package.

Package purchases should go through `PackageEnrollmentService` so transaction, package, and enrollment behavior stays consistent.

Midtrans status mapping is centralized in `PaymentController::applyMidtransStatus`:

- `settlement` -> `success`
- `capture` with fraud challenge -> `pending`
- `capture` without fraud challenge -> `success`
- `pending` -> `pending`
- `deny`, `cancel`, `failure` -> `failed`
- `expire` -> `expired`

Only `success` activates enrollments. `failed` and `expired` keep access inactive and notify admins.

### Materials and Content Review

- `materials`: tutor-uploaded learning materials. Key fields include `title`, `type`, `course_id`, `uploaded_by`, `file_url`, `storage_disk`, `file_path`, `content`, `approval_status`, `approved_by`, `approved_at`, and `rejection_comment`.
- Approval statuses are normalized to `pending`, `approved`, and `rejected`.

Tutors upload material from the tutor workspace. Admins review content from the admin content module. Admins can approve or reject material, but admin content create/update/delete endpoints intentionally abort because admins are reviewers, not content authors.

Material uploads use `config('filesystems.materials_disk')`. In tests this should normally be forced to `public` with `Storage::fake('public')`; production can point the same abstraction to `s3` for R2. `Material::publicUrlFor` resolves local `/storage/...` URLs and S3/R2 public URLs from `storage_disk` and `file_path`.

The admin content preview supports rich text content, linked files, PDF and office-style file links, video files, and YouTube links detected from material content or file URL. Tutor-facing material lists intentionally show user-friendly file metadata such as `File PDF terlampir` instead of raw storage URLs.

### Schedules

- `schedules`: course sessions with `course_id`, `mentor_id`, `title`, `type`, `meeting_link`, `start_time`, `end_time`, and `started_at`.

Admin schedules select a course, a schedule type, and an optional tutor. The backend validates that the tutor can teach the selected course through `TutorCourseResolver`; if the tutor has no assignment yet, the selected course can be synced as the initial assignment. Meeting links are optional but must be valid URLs when provided.

Tutor schedule routes allow tutors to view classes, create class sessions in their assigned courses, start sessions, and update meeting links.

### Progress

- `progress_records`: per-student course progress data used by `/student/progress`.

The student dashboard fetches progress asynchronously and maps it by `course_id`. Progress is an auxiliary learning signal; access control still comes from active enrollments.

### Notifications

- `notifications`: generic user notifications with `user_id`, `title`, `message`, `is_read`, and timestamps.

Admin notifications are created through `AdminNotifier`. Tutor upload flows aggregate multiple uploaded materials into one admin notification to avoid duplicate "new content needs review" alerts. Direct `Material` creation still has a model hook for pending material notifications, but tutor uploads suppress that hook and send the aggregate notification explicitly.

Content review also notifies the tutor who uploaded the material. Approved material can notify active students enrolled in the related course.

## 6. Main Relationships

```text
roles
  -> users.role_id

users
  -> enrollments.user_id
  -> transactions.user_id
  -> materials.uploaded_by
  -> schedules.mentor_id
  -> notifications.user_id
  -> report_exports.user_id
  -> course_tutor.tutor_id

courses
  -> package_course.course_id
  -> enrollments.course_id
  -> materials.course_id
  -> schedules.course_id
  -> course_tutor.course_id

packages
  -> package_course.package_id
  -> transactions.package_id

transactions
  -> enrollments.id through transactions.enrollment_id

progress_records
  -> users.id through progress_records.user_id
  -> courses.course_id
  -> materials.id through progress_records.material_id when present
```

## 7. Primary Workflows

### Registration and Login

Users register as students by default unless a role is explicitly provided by an admin workflow. Login redirects are role-aware:

- Admin users go to the admin dashboard.
- Tutor/mentor users go to the tutor dashboard.
- Student users go to the student dashboard.

Role-specific login endpoints prevent stale tutor/admin sessions from redirecting to the wrong dashboard after switching accounts.

Student Google login has two supported paths:

- Primary path: Google Identity Services renders an account chooser on `Auth/LoginSiswa`, then posts a `credential` ID token to `auth.google.credential`.
- Fallback path: the legacy OAuth redirect routes `auth.google.redirect` and `auth.google.callback` exchange an authorization code for Google userinfo.

Both paths end in `GoogleAuthController::authenticateGoogleUser`. Existing users are matched by `google_id` or email inside a database transaction with row locks. Existing non-student accounts are rejected from the student login. New Google users are created as students, marked email-verified, assigned a random password, and announced through `AdminNotifier::studentRegistered`.

### Package Purchase

Students choose a package, create a pending transaction, and complete payment through Midtrans Snap. Checkout redirects to `PaymentStatus` with the Snap token and `pay=1`, so the Snap UI opens before the user is redirected to the dashboard. The Midtrans notification endpoint validates `signature_key` before applying payment state changes. Successful payments activate package courses through `PackageEnrollmentService`; failed or expired payments do not activate access. Admin transaction pages expose status filters, details, reports, and CSV exports.

### Student Dashboard, Catalog, and Profile

`/dashboard` renders `StudentDashboard` with the authenticated student, enrollments, transactions, available packages, schedules, materials, and notifications. The React page owns an in-page tab state with these dashboard tabs:

- `beranda`: student overview and active package summary.
- `katalog`: package catalog rendered inside the dashboard through `PackagePurchasePanel`.
- `subtes`: enrolled course/subtest list or package purchase prompt.
- `jadwal`: student schedule view.
- `profil`: profile summary view.

The `?tab=` query parameter can deep-link to a dashboard tab, especially `/dashboard?tab=katalog`. Student catalog navigation should use this in-dashboard catalog tab instead of sending authenticated students back to the public landing page catalog.

When a student has no active package, the dashboard focuses on `PackagePurchasePanel` and hides the student side panel/navigation. The side panel appears only after a package enrollment is active, so unpaid students are not shown inaccessible subtest navigation.

Student profile editing is available inline from the dashboard and course learning side panels. The inline modal submits `PATCH /profile` with name, gender, phone/WhatsApp, and school origin through `ProfileController::update` and `ProfileUpdateRequest`. When the update request has a referer, the controller redirects back so the modal workflow stays on the current Inertia page.

### Tutor Content Upload and Admin Review

Tutors upload materials against assigned courses. Uploaded content starts as `pending`. The tutor upload controller creates materials without triggering duplicate model notifications, then sends one aggregate admin notification for the upload batch.

Admins review pending material from the content page. Approving sets `approved_by` and `approved_at`; rejecting stores an optional rejection comment. Review results create tutor notifications and, for approved materials, student notifications for active enrollments in the course.

### Schedule Management

Admins can manage schedules globally. Tutors can manage their own classes within their course assignments. `TutorCourseResolver` protects schedule creation and update flows from direct assumptions about whether a tutor is assigned through `mentor_course_id`, `course_tutor`, or both.

### Notifications

Authenticated users receive notification data through shared Inertia props. Admin notification dropdown data is cached per user and cleared after new admin notifications are inserted. Tutor pages receive a compact `tutorNotifications` payload with latest items and unread count.

### Error Handling and Loading Feedback

Non-JSON 404 responses render `resources/js/Pages/Errors/NotFound.jsx` through the exception handler in `bootstrap/app.php`.

Inertia navigation progress is handled by the app-level loader in `resources/js/app.jsx` and `resources/js/Components/ui/LoadingStates.jsx`. Loading feedback is staged: no visible loader for very short requests, spinner-style feedback for normal waits, and progress-bar style feedback after longer waits.

## 8. Backend Modules

Admin controllers:

- `AdminDashboardController`: dashboard metrics and summary cards.
- `UserController`: user CRUD, role assignment, tutor course assignment.
- `CourseController`: course CRUD and statistics.
- `PackageController`: package CRUD and package-course composition.
- `ScheduleController`: global schedule management.
- `ContentController`: material review and content statistics.
- `TransactionController`: transaction operations.
- `ReportController`: report export history and generation.
- `NotificationController`: admin notification list, mark read, and stats.
- `SettingController`: admin settings entry points.
- `TutorHistoryController`: tutor teaching history and session summaries.

Tutor controllers:

- `DashboardController`: tutor overview.
- `MaterialController`: tutor material upload, listing, announcements, and deletion.
- `ClassMonitoringController`: tutor class and student monitoring.
- `ScheduleController`: tutor-owned schedules and session state.
- `NotificationController`: tutor notification list and mark-read actions.

Auth controllers:

- `AuthenticatedSessionController`: generic, admin, and tutor login handling.
- `GoogleAuthController`: student Google sign-in through Google Identity Services credentials and legacy OAuth redirect callback.
- `RegisteredUserController`: student registration and role-aware creation.
- `ProfileController`: authenticated user profile display, inline student profile updates, and account deletion.
- Standard Breeze password, verification, and reset controllers.

Other controllers:

- `PaymentController`: payment status, status refresh, and Midtrans callback handling.
- `Student\ProgressController`: student course progress read/write endpoint.

## 9. Frontend Architecture

The frontend is an Inertia React app. Server controllers return page components and serialized props rather than JSON API resources for most page loads.

Main layout shells:

- `AdminLayout`: admin navigation, notification dropdown, and admin page chrome.
- `TutorSidebar`: tutor workspace navigation component.
- Auth and public pages are mostly self-contained page components, supported by shared components such as `LoginPanel` and `BricsLogo`.

Main page groups:

- `resources/js/Pages/Admin`: dashboard, users, courses, packages, schedules, content, transactions, reports, notifications.
- `resources/js/Pages/Tutor`: dashboard, material upload, classes, schedule, history, profile, settings, password, notifications, student profile.
- Root-level student pages: `StudentDashboard.jsx`, `CourseLearn.jsx`, `StudentSchedules.jsx`, `Checkout.jsx`, and `PaymentStatus.jsx`.
- `resources/js/Pages/Profile`: shared authenticated profile edit page and profile partials.
- `resources/js/Pages/Auth`: login, register, password reset, verification.

Admin and tutor pages are mostly form-driven Inertia views. They rely on Ziggy route names, Inertia form helpers, and server-side validation errors. `AdminLayout` preserves the sidebar's own scroll position across Inertia page changes so clicking lower navigation items such as `Jadwal` or `Riwayat Tutor` does not reset the side panel to the top.

Student pages are more self-contained. `StudentDashboard.jsx` includes the dashboard tab shell, package catalog panel, profile summary, notification dropdown, and inline profile editor. The student sidebar is conditional and only shown for active-package users. `CourseLearn.jsx` includes the course learning surface and the same inline profile editor pattern for purchased-package students. `Auth/LoginSiswa.jsx` is responsible for loading the Google Identity Services script and submitting Google credentials through Inertia.

## 10. Database Snapshot

Core identity tables:

- `roles`
- `users`
- `password_reset_tokens`
- `sessions`

Learning and commerce tables:

- `categories`
- `courses`
- `packages`
- `package_course`
- `transactions`
- `enrollments`
- `progress_records`

Tutor and learning operations:

- `course_tutor`
- `materials`
- `schedules`
- `announcements` when present in the active schema

Operational tables:

- `notifications`
- `report_exports`
- `cache`
- `jobs`
- `failed_jobs`

Important compatibility notes:

- `users.mentor_course_id` remains supported for older single-course tutor assignment.
- `course_tutor` is the multi-course assignment path.
- `users.role` can exist in older schemas but should not drive authorization.
- `users.google_id`, `users.google_avatar`, `users.gender`, `users.phone`, and `users.school_origin` are additive user columns. Their migrations guard with `Schema::hasColumn` checks so older or partially migrated databases can be upgraded safely.
- `transactions.course_id` can exist for legacy single-course purchase assumptions, but package-course enrollment is handled through package relationships.
- `materials.storage_disk` and `materials.file_path` are the durable storage metadata. `materials.file_url` is retained for compatibility and public presentation.

## 11. Caching and Shared Props

- Admin dashboard overview data is cached briefly to reduce repeated aggregate queries.
- Admin notification dropdown and stats are cached per user through `AdminNotificationCache`.
- New admin notifications clear the affected admin users' notification cache entries.
- `ShareNotifications` shares general notification data for authenticated users.
- `HandleInertiaRequests` shares `auth.user` globally and shares compact tutor notification data only for tutor/mentor users.
- Inertia's default progress indicator is disabled in favor of the app-level staged loader.

## 12. Architectural Rules

- Use `role_id` and role records for authorization. Do not write to `users.role`.
- Keep Google sign-in server-verified. Do not trust a frontend-decoded Google token; the backend must verify the credential and require the Google token audience to match `services.google.client_id`.
- Student Google login must create or link only `student` accounts. Reject admin, tutor, and mentor accounts from the student Google login route.
- Keep student catalog navigation inside the dashboard with the `katalog` tab or `/dashboard?tab=katalog`; do not send authenticated dashboard users back to the public landing page just to browse packages.
- Student profile updates should flow through `ProfileUpdateRequest` and `ProfileController::update`, including inline modal submissions from dashboard and course-learning pages.
- Use `TutorCourseResolver` for tutor-course assignment checks and syncs.
- Do not eager-load tutor `assignedCourses` in code paths that must work before the `course_tutor` migration has run.
- Use `PackageEnrollmentService` for package purchase enrollment writes.
- Keep Midtrans status mapping centralized. Store `expire` callbacks as `expired`, not as generic `failed`.
- Use `AdminNotifier` for admin-facing notification creation so cache invalidation stays centralized.
- Keep material review status changes explicit: `pending`, `approved`, or `rejected`.
- Admins review tutor content; they do not author learning material through the admin content controller.
- Store material files through `config('filesystems.materials_disk')` and keep `storage_disk` plus `file_path` populated for delete and public URL resolution.
- Keep meeting links nullable, but validate them as URLs when provided.
- New admin schedule tests and request payloads should include `type`; schedule types are required.
- Prefer Inertia page props and server validation for admin and tutor forms unless an interaction genuinely needs an API endpoint.

## 13. Known Constraints

- The project still carries compatibility with older database states, especially around `users.role`, `users.mentor_course_id`, and `course_tutor`.
- Some older flows may still assume a transaction maps to one course, while the current package model can enroll a student into many courses.
- Dashboard statistics are operational summaries and may mix live aggregate queries with cached payloads.
- Notification data is stored in a generic table, so title/message conventions matter for consistent UI behavior.
- The tutor role is named `mentor` in the database and `tutor` in much of the product UI.
- Production storage may produce fully qualified R2/S3 URLs, while local tests usually expect `/storage/...`; tests should explicitly configure `filesystems.materials_disk` when storage behavior matters.
- Midtrans callbacks are asynchronous. The UI supports manual refresh and redirects to the dashboard after successful payment, but payment activation still depends on callback or status refresh reaching the backend.

## 14. Practical File Map

```text
app/Http/Controllers/Admin/
  AdminDashboardController.php
  ContentController.php
  CourseController.php
  NotificationController.php
  PackageController.php
  ReportController.php
  ScheduleController.php
  SettingController.php
  TransactionController.php
  TutorHistoryController.php
  UserController.php

app/Http/Controllers/Tutor/
  ClassMonitoringController.php
  DashboardController.php
  MaterialController.php
  NotificationController.php
  ScheduleController.php

app/Http/Controllers/Auth/
  AuthenticatedSessionController.php
  GoogleAuthController.php
  RegisteredUserController.php

app/Http/Controllers/
  PaymentController.php
  ProfileController.php

app/Http/Controllers/Student/
  ProgressController.php

app/Services/
  MidtransService.php
  PackageEnrollmentService.php

app/Support/
  AdminNotifier.php
  AdminNotificationCache.php
  TutorCourseResolver.php
  TutorSettings.php

resources/js/Layouts/
  AdminLayout.jsx

resources/js/Components/
  BricsLogo.jsx
  LoginPanel.jsx
  TutorSidebar.jsx
  TutorMobileNavigation.jsx
  TutorNotificationBell.jsx
resources/js/Components/ui/
  LoadingStates.jsx

resources/js/Pages/Admin/
resources/js/Pages/Tutor/
resources/js/Pages/
  StudentDashboard.jsx
  CourseLearn.jsx
  StudentSchedules.jsx
  Checkout.jsx
  PaymentStatus.jsx
resources/js/Pages/Auth/
resources/js/Pages/Errors/
  NotFound.jsx
resources/js/Pages/Profile/

routes/
  web.php
  auth.php
```

## 15. Guidance for Future Changes

Prefer small, role-aware changes that keep business rules close to the backend. When a feature touches assignments, purchases, review status, or notifications, update the relevant support service rather than duplicating logic in a controller or React page. When database compatibility matters, keep the compatibility layer in one place and document the eventual migration path here.
