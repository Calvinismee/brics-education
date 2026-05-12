# BRICS Education System Architecture

## 1. Purpose

This document describes the current system architecture of the BRICS Education application as implemented in the codebase.

The goal is to give the team a shared reference for:

- business domain understanding
- module boundaries
- database structure
- business process flows
- current architectural constraints
- recommended extension points for future development

This document reflects the application state in the repository, not an aspirational future design.

---

## 2. System Summary

BRICS Education is a Laravel + Inertia + React web application for managing an education business with three main actor types:

- `student`
- `mentor` or `tutor`
- `admin`

The application currently emphasizes the admin workspace, with the following operational capabilities:

- user management
- package management
- course overview
- content review and approval
- schedule management
- transaction monitoring
- transaction statistics
- export history and reporting
- notification center

The core business model is:

1. A package contains one or more courses.
2. A course can belong to many packages.
3. A mentor is assigned to exactly one course.
4. A course can have many mentors.
5. When a student purchases a package successfully, the student is automatically enrolled into every course that belongs to that package.
6. Content is attached to a course and uploaded by a mentor, while admin only reviews it.

---

## 3. Technology Stack

### Backend

- PHP 8+
- Laravel 12 style bootstrap structure
- Eloquent ORM
- Query Builder for most admin reporting/query composition
- PostgreSQL as the primary database

### Frontend

- React
- Inertia.js
- Tailwind CSS utility classes
- Lucide icons

### Other Application Concerns

- session-based authentication
- role-based admin access
- notification sharing through Inertia middleware
- short-lived cache for admin notifications and dashboard summary

---

## 4. High-Level Architecture

The system is organized into four practical layers.

### 4.1 Presentation Layer

Implemented in:

- `resources/js/Pages/*`
- `resources/js/Layouts/*`

Responsibilities:

- page rendering
- filtering interactions
- modals and admin workflows
- Inertia form submission
- display of analytics, lists, and review actions

### 4.2 HTTP / Application Layer

Implemented in:

- `app/Http/Controllers/*`
- `app/Http/Middleware/*`

Responsibilities:

- route handling
- validation
- orchestration of queries and writes
- business rule enforcement at request time
- access control
- Inertia response composition

### 4.3 Domain / Service Layer

Implemented in:

- `app/Services/PackageEnrollmentService.php`
- model-level helper behavior in `User`, `Package`, `Course`, `Schedule`

Responsibilities:

- enforce package-to-course enrollment propagation
- role mapping helpers
- relationship definitions

### 4.4 Data Layer

Implemented in:

- `database/migrations/*`
- `database/seeders/*`

Responsibilities:

- schema definition
- domain persistence
- test and local development seed data

---

## 5. Main Actors

### 5.1 Student

Student responsibilities in the business domain:

- purchase a package
- receive enrollments to all courses in that package
- consume learning content

Current visible backend representation:

- stored in `users`
- identified by `role_id` linked to role `student`
- linked to `enrollments`
- linked to `transactions`

### 5.2 Mentor / Tutor

Mentor responsibilities:

- teach exactly one assigned course
- upload content for a course
- appear in scheduling as instructor

Current representation:

- stored in `users`
- role uses `mentor` in database role table, but UI/API often uses `tutor`
- linked to a single course through `users.mentor_course_id`
- referenced in `materials.uploaded_by`
- referenced in `schedules.mentor_id`

### 5.3 Admin

Admin responsibilities:

- manage users
- assign tutor course ownership
- manage packages and package-course mapping
- review and approve/reject content
- manage schedules
- monitor transactions and exports
- review notifications and summary metrics

Constraints:

- admin cannot create, edit, or delete learning content directly
- admin access is guarded by middleware alias `admin`

---

## 6. Business Domain Model

### 6.1 Core Concepts

#### User

Represents all authenticated actors.

Important fields:

- `id`
- `name`
- `email`
- `password`
- `role_id`
- `mentor_course_id`

Important note:

- `users.role` string column still exists as legacy data
- canonical role resolution now uses `role_id` and the `roles` table

#### Role

Defines actor classification.

Current seeded roles:

- `student`
- `mentor`
- `admin`

The frontend and tests may refer to `tutor`, but that maps to the `mentor` role internally.

#### Course

Represents a learning subject or teachable unit.

Important properties:

- title
- description
- price
- status

Course is the central node for:

- mentor ownership
- student enrollment
- learning content
- schedule
- package composition

#### Package

Represents a purchasable bundle of courses.

Important properties:

- name
- price
- description
- features
- popular

Business meaning:

- a package is the commercial product
- a course is the academic delivery unit

#### Enrollment

Represents a student-course membership.

Important meaning:

- created automatically when package purchase succeeds
- one student can have many enrollments
- each enrollment points to exactly one course
- enrollments can also remember which package generated them

#### Transaction

Represents payment data.

Important meaning:

- current architecture supports package-based transactions
- `course_id` is now nullable
- `package_id` should be used for current package purchase flow
- `enrollment_id` points to one enrollment record for reference, but one successful package purchase may generate multiple enrollments

#### Material

Represents mentor-uploaded learning content for a course.

Important meaning:

- belongs to one course
- uploaded by one mentor
- reviewed by admin
- approval states drive the content review workflow

#### Schedule

Represents a class session for a course and mentor.

Important meaning:

- belongs to one course
- handled by one mentor
- mentor cannot be scheduled across different courses

#### Notification

Represents operational notifications shown to admin.

#### Report Export

Represents export history metadata only.

It stores:

- who exported
- what was exported
- row count
- filters used
- generated file name

---

## 7. Business Rules and Invariants

The following rules should be treated as core system invariants.

### 7.1 Package and Course Rules

- One package can contain many courses.
- One course can belong to many packages.
- Package-course mapping is stored in `package_course`.

### 7.2 Mentor Assignment Rules

- One mentor can only teach one course at a time.
- One course can have many mentors.
- The mentor-course assignment is stored on `users.mentor_course_id`.
- If a mentor is first scheduled on a course and has no assignment yet, the system assigns that course automatically.
- If a mentor is already assigned to a different course, schedule creation/update must reject the request.

### 7.3 Student Enrollment Rules

- A student does not enroll directly into a package.
- A student enrolls into courses.
- Package purchase is the trigger that creates course enrollments.
- One successful package purchase creates one enrollment per course in the package.
- Enrollments generated from package purchase store the originating `package_id`.

### 7.4 Transaction Rules

- Current commercial flow is package-based.
- `transactions.package_id` is the main product pointer.
- `transactions.course_id` exists for backward compatibility and older assumptions.
- Only successful payment should trigger enrollment propagation.
- Pending or failed transactions must not create active enrollments.

### 7.5 Content Review Rules

- Content belongs to a course.
- Content is uploaded by mentor.
- Admin can approve or reject content.
- Admin cannot create, edit, or delete content directly.
- Rejected content may contain an admin rejection comment.

### 7.6 Admin Access Rules

- Only admin users may access `/admin/*`.
- Non-admin users are redirected to `/` with an unauthorized message.

### 7.7 Student Access Rules

- Only users whose resolved role name is `student` may access student dashboard, learning pages, and student schedules.
- Student route guards must not hardcode numeric role ids because seeded or migrated role ids can vary between databases.

---

## 8. Business Processes

### 8.1 User and Role Lifecycle

1. Admin creates or updates a user.
2. Admin chooses the role: `student`, `tutor`, or `admin`.
3. If role is tutor, admin may assign a course through `mentor_course_id`.
4. The system maps role label to the canonical role id.

Business implication:

- tutor assignment is now part of user administration
- there is no separate tutor-management module

### 8.2 Package Management Process

1. Admin creates a package.
2. Admin selects one or more courses for the package.
3. System stores package data in `packages`.
4. System stores package-course links in `package_course`.

Business implication:

- package is no longer just marketing metadata
- package is now the key product for purchase and enrollment

### 8.3 Package Purchase and Enrollment Process

1. Student pays for a package.
2. Transaction is stored with `package_id`.
3. If payment is successful, `PackageEnrollmentService::enroll()` is invoked.
4. The service reads all courses linked to that package.
5. The service creates or updates one enrollment per course.
6. Enrollment status becomes `active`.

Important note:

- the current repository has the enrollment service and seed-driven usage, but full student-facing checkout orchestration is not yet implemented as a public purchase module

### 8.4 Tutor Teaching Assignment Process

1. Tutor can be assigned a course from user management, or implicitly through first valid schedule assignment.
2. When admin creates a schedule, the selected mentor must either:
   - have no course assignment yet, or
   - already be assigned to the same course
3. Otherwise, validation fails.

### 8.5 Content Review Process

1. Tutor uploads content for a course.
2. Content enters `pending` state.
3. Admin reviews content from the content page.
4. Admin approves or rejects.
5. Rejection may include a comment.
6. Content page and course overview both reflect the review state.

### 8.6 Reporting and Export Process

1. Admin exports a user or transaction dataset.
2. Export response streams CSV.
3. System records export metadata into `report_exports`.
4. Admin can review export history from the reports page.
5. Reports page can filter history by date range.

### 8.7 Notification Process

1. Notifications are stored in `notifications`.
2. Middleware shares the latest notification set with Inertia.
3. Notification cache is stored per admin user.
4. Read actions invalidate the cached notification payload and stats.

---

## 9. Database Architecture

## 9.1 Table Overview

### Identity and Access

#### `users`

Purpose:

- master table for all actors

Important columns:

- `id`
- `name`
- `email`
- `email_verified_at`
- `password`
- `role`
- `role_id`
- `mentor_course_id`
- `remember_token`
- `created_at`
- `updated_at`

Notes:

- `role_id` is the source of truth for authorization
- `role` string is legacy and should not be treated as authoritative

#### `roles`

Purpose:

- lookup table for role ids

Important columns:

- `id`
- `name`

### Learning Domain

#### `categories`

Purpose:

- optional classification table for courses

Current system usage:

- schema exists
- current admin UI and business flow do not actively use category management

#### `courses`

Purpose:

- academic learning unit

Important columns:

- `id`
- `category_id`
- `title`
- `description`
- `price`
- `status`
- `created_at`
- `updated_at`

#### `packages`

Purpose:

- commercial bundle

Important columns:

- `id`
- `name`
- `price`
- `description`
- `features`
- `students`
- `popular`
- `created_at`
- `updated_at`

Note:

- `students` currently exists in schema but is not the source of truth for active enrollment counts
- active enrollment counts should be derived from `enrollments`

#### `package_course`

Purpose:

- many-to-many mapping between packages and courses

Important columns:

- `id`
- `package_id`
- `course_id`
- timestamps

Constraint:

- unique pair on `package_id` and `course_id`

#### `enrollments`

Purpose:

- student membership in a course

Important columns:

- `id`
- `user_id`
- `course_id`
- `package_id`
- `status`
- `enrolled_at`
- `created_at`
- `updated_at`

#### `materials`

Purpose:

- course content uploaded by mentor

Important columns:

- `id`
- `course_id`
- `uploaded_by`
- `title`
- `type`
- `file_url`
- `content`
- `approval_status`
- `rejection_comment`
- `approved_by`
- `approved_at`
- timestamps

#### `schedules`

Purpose:

- calendarized delivery session for one course and one mentor

Important columns:

- `id`
- `course_id`
- `mentor_id`
- `title`
- `start_time`
- `end_time`
- `meeting_link`
- timestamps

### Commerce and Analytics

#### `transactions`

Purpose:

- payment records

Important columns:

- `id`
- `user_id`
- `course_id`
- `package_id`
- `enrollment_id`
- `invoice_number`
- `amount`
- `payment_method`
- `payment_status`
- `payment_gateway_ref`
- `paid_at`
- timestamps

Important interpretation:

- `package_id` is the current product pointer
- `course_id` is legacy-compatible and nullable
- `enrollment_id` is a reference pointer, not a full replacement for all enrollments generated by a package purchase

### Operational Support

#### `notifications`

Purpose:

- admin-facing operational notifications

Important columns:

- `id`
- `user_id`
- `title`
- `message`
- `is_read`
- timestamps

#### `report_exports`

Purpose:

- export audit trail

Important columns:

- `id`
- `user_id`
- `type`
- `title`
- `file_name`
- `row_count`
- `filters`
- timestamps

### Platform Tables

- `password_reset_tokens`
- `sessions`
- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`

---

## 9.2 Relationship Diagram

```text
roles 1 --- * users
courses 1 --- * users (as mentor_course_id for mentors)

packages * --- * courses   through package_course

users 1 --- * enrollments
courses 1 --- * enrollments
packages 1 --- * enrollments

users 1 --- * transactions
packages 1 --- * transactions
courses 1 --- * transactions (legacy-compatible, nullable)
enrollments 1 --- * transactions (reference use)

courses 1 --- * materials
users 1 --- * materials (uploaded_by)
users 1 --- * materials (approved_by)

courses 1 --- * schedules
users 1 --- * schedules (mentor_id)

users 1 --- * notifications
users 1 --- * report_exports
```

---

## 10. Request and Route Architecture

## 10.1 Public Routes

- `/`
  Landing page
- `/login`
  student login
- `/login/tutor`
  tutor login page
- `/login/admin`
  admin login page

## 10.2 Authenticated Admin Routes

All admin routes use:

- `auth`
- `verified`
- `admin`

Admin modules:

- `/admin/dashboard`
- `/admin/users`
- `/admin/packages`
- `/admin/courses`
- `/admin/content`
- `/admin/schedule`
- `/admin/transactions`
- `/admin/transaction-stats`
- `/admin/reports/export`
- `/admin/notifications`
- `/admin/settings`

## 10.3 Authentication Flow

There are two practical login paths:

- generic login
- admin-specific login

Important behavior:

- admin users authenticated through generic login are redirected to admin dashboard
- non-admin users attempting admin login are logged out and rejected

---

## 11. Admin Module Responsibilities

### 11.1 Dashboard

Controller:

- `AdminDashboardController`

Purpose:

- present high-level user metrics and growth data

Notes:

- heavily query-driven
- some metric cards use synthetic placeholders such as random course/progress display for recent users
- should be treated as a dashboard summary layer, not as the source of transactional truth

### 11.2 Users

Controller:

- `Admin\UserController`

Purpose:

- CRUD for users
- assign tutor course ownership
- show student enrolled courses
- export users CSV

### 11.3 Packages

Controller:

- `Admin\PackageController`

Purpose:

- CRUD for packages
- maintain package-course mapping

### 11.4 Courses

Controller:

- `Admin\CourseController`

Purpose:

- course-centric operational overview

Displays:

- number of enrolled students
- mentors assigned to course
- package membership
- content list by course

### 11.5 Content

Controller:

- `Admin\ContentController`

Purpose:

- review-only workflow for mentor content

Constraints:

- store/update/destroy are forbidden for admin

### 11.6 Schedule

Controller:

- `Admin\ScheduleController`

Purpose:

- create, update, delete class schedules
- enforce mentor-course invariant

### 11.7 Transactions

Controller:

- `Admin\TransactionController`

Purpose:

- list transactions
- filter/search/sort
- show transaction detail
- export CSV
- display revenue analytics

### 11.8 Reports

Controller:

- `Admin\ReportController`

Purpose:

- view export history
- filter export records by date range

### 11.9 Notifications

Controller:

- `Admin\NotificationController`

Support:

- `App\Support\AdminNotificationCache`
- `App\Http\Middleware\ShareNotifications`

Purpose:

- list notifications
- mark single notification as read
- mark all notifications as read
- share compact notification feed into admin layout

---

## 12. Frontend Architecture

## 12.1 Layout Strategy

Primary admin shell:

- `resources/js/Layouts/AdminLayout.jsx`

Responsibilities:

- sidebar navigation
- mobile drawer behavior
- top header
- notification dropdown
- shared admin framing

## 12.2 Page Organization

Admin pages are route-oriented:

- one main page per operational module
- page receives fully shaped Inertia props
- page is mostly presentation and interaction logic

Current design style:

- data-heavy panels
- card + table + modal workflows
- minimal client-side domain logic

## 12.3 State Strategy

Most state is local UI state:

- filters
- modal visibility
- form state
- search text
- action loading state

Business data remains server-driven through Inertia page props.

---

## 13. Caching Strategy

### Dashboard Cache

- key: `admin:dashboard:overview:v2`
- TTL: 300 seconds

Purpose:

- reduce repeated expensive dashboard aggregation queries

### Notification Cache

Keys are user-scoped:

- `notifications:shared:{userId}`
- `notifications:stats:{userId}`

TTL:

- 60 seconds

Purpose:

- reduce repeated notification dropdown queries

Invalidation:

- read actions call `AdminNotificationCache::forgetForUser()`

---

## 14. Seeder Architecture

Seeders are designed to reflect the current package-course-enrollment model for a SNBT preparation website.

### Seeded Actors

- 3 students
- 7 tutors mapped one-to-one to SNBT course subjects
- 1 admin

### Seeded Domain Data

- categories for `Tes Potensi Skolastik` and `Tes Literasi`
- 7 active SNBT courses:
  - `Penalaran Umum`
  - `Pengetahuan dan Pemahaman Umum`
  - `Pemahaman Bacaan dan Menulis`
  - `Pengetahuan Kuantitatif`
  - `Literasi dalam Bahasa Indonesia`
  - `Literasi dalam Bahasa Inggris`
  - `Penalaran Matematika`
- one commercial package: `Paket Persiapan SNBT`
- package-course mapping from `Paket Persiapan SNBT` to all 7 SNBT courses
- course content by tutor
- schedules by subject tutor
- package-based transactions
- enrollment propagation from successful transactions
- notifications for admin

Important note:

- local seed data is now aligned with the current architecture
- package purchase is reflected in seeded transactions, not direct course purchase
- successful seeded SNBT transactions enroll students into every course in `Paket Persiapan SNBT`

---

## 15. Known Constraints and Technical Debt

The following are important for the team to know before extending the system.

### 15.1 Legacy `users.role` Column

- `users.role` still exists
- the system should use `role_id` as canonical authorization data
- seeders and admin user writes keep `users.role` synchronized for legacy visibility
- if future cleanup is planned, remove the string role after confirming no remaining runtime dependency

### 15.2 `transactions.course_id` Is Transitional

- course-specific transactions existed earlier
- current business model is package-first
- keep `course_id` nullable until all old logic and reporting assumptions are fully removed

### 15.3 `transactions.enrollment_id` Is Only a Reference

- one package purchase creates many enrollments
- transaction stores only one reference enrollment id
- if the team needs a perfect transaction-to-many-enrollments audit model, introduce a junction table such as `transaction_enrollments`

### 15.4 Categories Are Present but Operationally Unused

- `categories` table exists
- there is no active admin module for category management

### 15.5 Dashboard Includes Synthetic UI Metrics

- some dashboard presentation values are placeholders or derived for display purposes
- do not use dashboard widgets as accounting-grade analytics

### 15.6 Admin Cannot Author Learning Content

- this is a deliberate business constraint in current code
- if admin authoring is needed, it should be introduced as a new workflow rather than by weakening current review endpoints

---

## 16. Recommended Development Rules for the Team

When extending this system, the team should preserve the following architectural conventions.

### 16.1 Treat Course as the Academic Core

- content attaches to course
- mentors attach to course
- schedules attach to course
- student learning access is expressed through enrollments to course

### 16.2 Treat Package as the Commercial Core

- package is what students buy
- package determines which courses are unlocked

### 16.3 Keep Enrollment Derivable and Auditable

- enrollment creation should remain deterministic from successful purchase
- avoid manual enrollment writes unless the feature explicitly represents manual admin intervention

### 16.4 Keep Admin Controllers Thin

- orchestration belongs in services when a workflow becomes reusable or multi-step
- `PackageEnrollmentService` is the current example and should be reused for future purchase completion flows

### 16.5 Prefer `role_id` Over String Role

- new code should not reintroduce business logic based on `users.role`

### 16.6 Preserve Mentor Single-Course Constraint

- if business changes later require multi-course mentors, that is a schema change
- it should not be hacked around in schedules alone

Current schema for the invariant:

- `users.mentor_course_id`

Future multi-course option:

- replace with `mentor_course` pivot table

### 16.7 Keep Content Workflow Explicit

- `pending`
- `approved`
- `rejected`

Do not silently publish content without a clear state change.

### 16.8 Keep Architecture Documentation Current

- Always update `Architecture.md` when adding or changing features, seed data, or migrations.

---

## 17. Suggested Future Enhancements

The following are natural next steps if the system grows.

### 17.1 Student Purchase Module

Implement a real checkout flow that:

- creates package transaction
- processes payment callback
- calls `PackageEnrollmentService` on success

### 17.2 Transaction-to-Enrollment Audit Table

Introduce a dedicated mapping table if finance and learning audit must be exact at many-to-many level.

### 17.3 Tutor Content Authoring Module

Mentor-facing content authoring UI and API should be formalized if not already planned outside this repository slice.

### 17.4 Category Management

If categories are reinstated as a business concept, add:

- admin CRUD
- course filtering by category
- reporting by category

### 17.5 Better Analytics Layer

Move reporting-grade metrics into dedicated read models or materialized reporting queries if the admin analytics surface keeps expanding.

---

## 18. Practical File Map

Important backend files:

- `routes/web.php`
- `app/Http/Controllers/Admin/*`
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- `app/Services/PackageEnrollmentService.php`
- `app/Models/User.php`
- `app/Models/Package.php`
- `app/Models/Course.php`
- `app/Models/Schedule.php`

Important frontend files:

- `resources/js/Layouts/AdminLayout.jsx`
- `resources/js/Pages/Admin/Users.jsx`
- `resources/js/Pages/Admin/Packages.jsx`
- `resources/js/Pages/Admin/Courses.jsx`
- `resources/js/Pages/Admin/Content.jsx`
- `resources/js/Pages/Admin/Schedule.jsx`
- `resources/js/Pages/Admin/Transactions.jsx`
- `resources/js/Pages/Admin/TransactionDetail.jsx`
- `resources/js/Pages/Admin/TransactionStats.jsx`
- `resources/js/Pages/Admin/ReportsExport.jsx`

Important schema files:

- `database/migrations/2026_05_08_000000_create_learning_tables.php`
- `database/migrations/2026_05_08_000001_create_packages_table.php`
- `database/migrations/2026_05_08_000002_create_schedules_table.php`
- `database/migrations/2026_05_10_000001_create_report_exports_table.php`
- `database/migrations/2026_05_12_000001_add_package_course_and_mentor_course_relations.php`

Important seed files:

- `database/seeders/DatabaseSeeder.php`
- `database/seeders/PackageSeeder.php`
- `database/seeders/ContentSeeder.php`
- `database/seeders/ScheduleSeeder.php`
- `database/seeders/TransactionSeeder.php`
- `database/seeders/NotificationSeeder.php`

---

## 19. Final Guidance

If the team uses this document as the base for future development, the safest mental model is:

- package is what is sold
- course is what is taught
- enrollment is what grants access
- mentor belongs to one course
- content belongs to one course
- admin governs operations, not content authorship

Any future feature should first decide which of those five domain anchors it belongs to before implementation begins.
