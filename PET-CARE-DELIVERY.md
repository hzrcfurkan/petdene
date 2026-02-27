## Pet Care App Delivery Plan

### Architecture Snapshot

- **Users & Roles**: `User` model already stores `role` values (`SUPER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`). Enforce RBAC via backend middleware (`lib/auth/rbac.ts`) and React guards for navigation/views.
- **Domain Models**: Prisma schema covers pets, services, appointments, invoices, payments, medical records, prescriptions. Honor one-to-one links (`Invoice` ↔ `Appointment`, `Payment` ↔ `Invoice`) plus cascading deletes for referential safety.
- **APIs**: Organize backend surface areas into Auth, User Management, Pets, Services, Scheduling, Billing, Medical Records. Each module gets DTO validation, Prisma repositories, and integration tests.
- **Frontends**: Marketing landing page (public) + role-specific dashboards (admin, staff, customer, super admin). Shared design system under `components/ui`.
- **Infrastructure**: PostgreSQL + Prisma migrations, Next.js API routes, TanStack Query client data layer, CI pipeline (lint, test, `prisma validate`) ahead of deploy (Vercel/Render + managed Postgres).

### Step-by-Step Roadmap

1. **Stabilize Foundations**

   - Review existing auth stack (NextAuth) and confirm seed users for each role.
   - Run `npx prisma migrate dev` after schema tweaks; add seed script populating roles, services, demo pets.
   - Configure ESLint/Prettier, Vitest/Jest, and GitHub Actions (lint → test → prisma validate).

2. **Role & Access Control**

   - Map permissions matrix (crud rights per model by role).
   - Implement API guards/middleware, propagate role context to React.
   - Add integration tests for unauthorized access attempts.

3. **Pet & Service Management**

   - CRUD endpoints for `Pet`, `PetService`; expose via React Query hooks.
   - Customer dashboard to manage pets (profile + medical history timeline).
   - Admin UI to curate services catalog (price, duration, availability).
   - See “Pet Module Deep Dive” for detailed API/component/import steps.

4. **Scheduling & Appointments**

   - Booking wizard: select pet + service + time slot → create `Appointment`.
   - Staff dashboard for schedule view, status updates (`PENDING` → `CONFIRMED` → `COMPLETED`).
   - Notification hooks (email/SMS) for reminders and status changes.

5. **Billing & Payments**

   - Auto-generate `Invoice` after appointment confirmation; ensure 1:1 constraint (`appointmentId @unique`).
   - Payment capture module writing to `Payment`; integrate mock gateway first, swap to real provider later.
   - Admin reporting for outstanding invoices, revenue stats.

6. **Medical Records & Prescriptions**

   - Staff create `MedicalRecord` entries per visit; attach documents/photos.
   - Prescription issuance UI referencing `Prescription` model; printable/shareable output.

7. **Landing Page & Marketing Funnel**

   - Build hero, services showcase, testimonials, FAQs, CTA to sign up/book.
   - Hook CTA into auth onboarding; highlight role-based value props.
   - Add analytics (Plausible/GA) for conversion tracking.

8. **Polish, QA, Deployment**
   - Expand test coverage (unit + e2e booking/payments/admin flows).
   - Add error boundaries, loading skeletons, accessibility pass.
   - Promote migrations to staging/prod, seed baseline data, smoke-test dashboards and landing.

### Deliverables Checklist

- [ ] Prisma migrations + seeds up-to-date with pet care schema.
- [ ] RBAC enforced across API routes and UI navigation.
- [ ] CRUD + workflow UIs for pets, services, appointments, billing, medical records.
- [ ] Responsive landing page with marketing content and CTA wiring.
- [ ] CI/CD pipeline validating lint/tests/prisma and deploying to chosen targets.

### Pet Module Deep Dive (schema `Pet` + `PetService`, lines 68-104)

**Prisma Layer**

- `Pet` carries ownership (`ownerId -> User`), metadata (species, age, weight, notes), and relations to vaccinations, medical logs, prescriptions, appointments. `PetService` stores catalog data (title, type, price, duration, active flag) and links to appointments.
- Create Prisma helpers in `lib/db/pets.ts` & `lib/db/pet-services.ts`:
  - `listPetsByOwner(userId, includeRelations = false)`
  - `createPet(data)` with validated payload and optional nested medical history.
  - `bulkUpsertPetServices(services)` for catalog management/import.

**API Surface (Next.js Route Handlers)**

- `app/api/v1/pets/route.ts`
  - `GET` (by role): customers get own pets; staff/admin can filter by owner; support pagination, `species` filter.
  - `POST`: create pet; only CUSTOMER (self), STAFF/ADMIN (on behalf). Validate required fields (name, species, ownerId).
- `app/api/v1/pets/[id]/route.ts`
  - `GET`: fetch pet + relations (vaccinations, medical logs, upcoming appointments).
  - `PATCH`: edit metadata, optionally append medical note stub.
  - `DELETE`: soft delete (set `active=false`) if pet has history; hard delete allowed for admins when no records.
- `app/api/v1/pet-services/...` similar CRUD, plus toggle `active`.
- Attach role guard using `requireRole(['CUSTOMER'])` etc. from `lib/auth/rbac.ts`.

**React Components & Pages**

- Shared data hooks: `lib/react-query/hooks/user/pets.ts` with `usePets`, `useCreatePet`, `useUpdatePet`.
- UI building blocks inside `components/features/pets/`:
  - `PetList.tsx` (cards/table with species tags, status, actions).
  - `PetForm.tsx` (controlled form w/ validation, image upload).
  - `MedicalTimeline.tsx` (uses `Accordion` component for logs).
- Customer dashboard integration (`app/(dashboard)/client/page.tsx`):
  - Summary cards (pets count, upcoming appointments).
  - Pet list + CTA to add new pet.
- Staff dashboard (`app/(dashboard)/staff/page.tsx`):
  - Searchable pet directory, quick links to medical records, filter by service type.
- Admin dashboard (`app/(dashboard)/admin/page.tsx` + `components/features/admin/AdminDashboard.tsx`):
  - Pet statistics, service catalog management, approval queue for imported pets.

**Import Page & Workflow**

- Purpose: allow admins to batch import pets/services (e.g., from legacy data).
- Page: `app/(dashboard)/admin/import/page.tsx`
  - Upload widget (CSV/XLSX). Use `papaparse` or `xlsx` lib client-side; send normalized payload to `POST /api/v1/pets/import`.
  - Show preview table, mapping columns to schema fields (name, species, owner email, etc.).
  - Validate owners exist; provide option to auto-create customers with invite email.
- Backend route `app/api/v1/pets/import/route.ts`:
  - Accept array, run zod validation, chunk writes via Prisma transaction.
  - Emit activity log entries for auditing.

**Role-Based Dashboard Management**

- Permission matrix:
  - `CUSTOMER`: CRUD only on owned pets; read-only service catalog; see own appointments.
  - `STAFF`: Read all pets, edit medical logs, create prescriptions, cannot delete owners’ pets.
  - `ADMIN`: Full CRUD on pets/services, run imports, view billing for related appointments.
  - `SUPER_ADMIN`: Admin privileges + manage role assignments, global settings.
- Enforcement:
  - Server-side: wrap route handlers with `withRoleGuard`.
  - Client-side: `useCurrentUser` to gate buttons/sections; supply fallback components.
  - Navigation: extend `components/layout/admin/sidebar-items.tsx` with import page & pet management links based on role arrays.
  - Dashboard widgets: compose from shared pet components but feed role-scoped data (e.g., admin view includes owner info columns).

**Testing & Verification**

- Unit tests for Prisma helpers (mock DB).
- API route tests covering role restrictions and validation errors.
- Component tests for form validation, conditional rendering per role.
- E2E scenario: customer adds pet → staff records visit → admin imports new services → super admin audits statistics.
