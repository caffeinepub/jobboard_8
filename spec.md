# Job Application Platform

## Current State
New project with empty backend actor and no frontend pages.

## Requested Changes (Diff)

### Add
- Job listings page: browse all open jobs with title, company, location, salary range, description
- Job application form: name, email, resume summary, cover letter, relevant experience
- Application tracking dashboard: logged-in users see their submitted applications and statuses
- Admin panel: add, edit, delete job listings; view and update application statuses
- Role-based access: regular users (applicants) and admins

### Modify
- Empty backend actor to include full job + application data model

### Remove
- Nothing

## Implementation Plan
1. Select `authorization` component for role-based access (admin vs applicant)
2. Generate Motoko backend with:
   - Job listings CRUD (admin only for create/update/delete)
   - Application submission (any user)
   - Application status updates (admin only)
   - Fetch own applications (user)
   - Fetch all applications (admin)
3. Frontend pages:
   - `/` — Job listings browseable page
   - `/jobs/:id` — Job detail + Apply button
   - `/apply/:id` — Application form
   - `/dashboard` — Applicant's application tracking dashboard
   - `/admin` — Admin panel for job listings and application management
4. Auth-gated routes for dashboard (logged-in users) and admin panel (admin role only)
