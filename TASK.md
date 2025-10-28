# Pet Medication Reminder - Development Roadmap

## ✅ Completed

- [x] Next.js 15 + Supabase project setup
- [x] Authentication system (login, signup, password reset)
- [x] Database schema design
- [x] TypeScript types defined
- [x] Basic dashboard layout
- [x] RLS policies configured

---

## 🚀 Phase 1: Core Owner Features (Week 1-2)

### 1.1 Pet Management

- [ ] Create pet addition form (`app/(dashboard)/pets/new/page.tsx`)
  - Form fields: name, species, breed, age, weight, notes
  - Image upload to Supabase Storage
  - Form validation with react-hook-form or native
  - Server action to insert pet into database
- [ ] Pet detail page (`app/(dashboard)/pets/[id]/page.tsx`)

  - Display pet information
  - Edit pet button
  - List all medications for this pet
  - Delete pet functionality

- [ ] Pet list/grid view improvements
  - Add search/filter functionality
  - Show pet photos in cards
  - Quick stats (upcoming doses, active meds)

**Files to create:**

```
app/(dashboard)/pets/
  ├── new/page.tsx
  ├── [id]/
  │   ├── page.tsx
  │   └── edit/page.tsx
lib/actions/pets.ts
components/forms/pet-form.tsx
```

### 1.2 Medication Management

- [ ] Add medication form (`app/(dashboard)/pets/[id]/medications/new/page.tsx`)

  - Medication name, dosage, instructions
  - Frequency selector (daily, twice daily, custom)
  - Time picker for dose times (support multiple times)
  - Start/end date pickers
  - Server action to create medication

- [ ] Medication detail/edit page

  - View medication details
  - Edit functionality
  - Pause/resume medication
  - Delete medication with confirmation

- [ ] Dose schedule generator
  - Function to generate dose_logs based on medication schedule
  - Run on medication creation
  - Handle recurring schedules (daily, weekly, etc.)

**Files to create:**

```
app/(dashboard)/pets/[id]/medications/
  ├── new/page.tsx
  └── [medId]/
      ├── page.tsx
      └── edit/page.tsx
lib/actions/medications.ts
lib/utils/schedule-generator.ts
components/forms/medication-form.tsx
```

### 1.3 Profile & Role Setup

- [ ] Create profile setup flow (after signup)

  - Prompt user to select role (owner/sitter)
  - Collect phone number for SMS
  - Full name
  - Auto-create profile record on signup

- [ ] Profile settings page
  - Edit profile information
  - Change phone number
  - Notification preferences (future)

**Files to create:**

```
app/(dashboard)/profile/
  ├── page.tsx
  └── setup/page.tsx
lib/actions/profile.ts
components/forms/profile-form.tsx
```

---

## 🔔 Phase 2: Sitter Features & Reminders (Week 3)

### 2.1 Sitter Assignment System

- [ ] Sitter invitation flow

  - Owner can add sitter by email
  - Set date range for sitting period
  - Sitter receives email invitation
  - Sitter accepts/declines

- [ ] Sitter management page for owners
  - View all sitters
  - Active/inactive assignments
  - Revoke access

**Files to create:**

```
app/(dashboard)/sitters/
  ├── page.tsx
  ├── invite/page.tsx
  └── [id]/page.tsx
lib/actions/sitter-assignments.ts
components/forms/sitter-invite-form.tsx
```

### 2.2 Sitter Dashboard

- [ ] Today's dose list view (`app/(dashboard)/sitters/page.tsx`)

  - Show all pending doses for today
  - Group by pet
  - Show medication details
  - "Mark as given" button
  - Photo upload option
  - Notes field

- [ ] Dose confirmation flow

  - One-tap "given" button
  - Optional: Add timestamp, photo, notes
  - Update dose_log status to 'administered'
  - Show success feedback

- [ ] Dose history view
  - Past doses
  - Filter by pet, date range
  - Export functionality

**Files to create:**

```
app/(dashboard)/sitters/page.tsx
app/(dashboard)/doses/[id]/confirm/page.tsx
lib/actions/doses.ts
components/dose-card.tsx
components/forms/dose-confirmation-form.tsx
```

### 2.3 SMS Reminders with Twilio

- [ ] Set up Twilio account

  - Get account SID, auth token
  - Get phone number
  - Add credentials to `.env.local`

- [ ] Create SMS sending utility

  - Function to send SMS via Twilio API
  - Generate unique confirmation link
  - SMS template with pet name, medication, time

- [ ] One-tap confirmation endpoint

  - API route: `app/api/doses/[id]/confirm/route.ts`
  - Token validation
  - Update dose_log status
  - Return confirmation page

- [ ] Scheduled reminder cron job
  - Vercel Cron or similar
  - API route: `app/api/cron/send-reminders/route.ts`
  - Query upcoming doses (30 min before scheduled time)
  - Send SMS to assigned sitter
  - Mark reminder as sent (add sent_at field to dose_logs)

**Environment variables needed:**

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_BASE_URL=
```

**Files to create:**

```
app/api/doses/[id]/confirm/route.ts
app/api/cron/send-reminders/route.ts
lib/twilio/send-sms.ts
lib/utils/generate-confirmation-token.ts
```

**Vercel cron config (vercel.json):**

```json
{
	"crons": [
		{
			"path": "/api/cron/send-reminders",
			"schedule": "*/15 * * * *"
		}
	]
}
```

---

## 📸 Phase 3: Photo Uploads & Proof (Week 4)

### 3.1 Supabase Storage Setup

- [ ] Create storage bucket for photos

  - Bucket name: `dose-photos` or `pet-photos`
  - Set RLS policies for uploads
  - Configure public access for images

- [ ] Photo upload component

  - Drag-and-drop or file picker
  - Image preview before upload
  - Compression/resizing (optional)
  - Upload progress indicator

- [ ] Store photo URLs
  - Link to dose_logs.photo_url
  - Link to pets.photo_url

**Files to create:**

```
lib/storage/upload-photo.ts
components/ui/photo-upload.tsx
```

### 3.2 Photo Gallery

- [ ] Dose photo gallery for owners

  - View all dose confirmation photos
  - Filter by pet, date
  - Lightbox/modal view

- [ ] Pet photo updates
  - Owner can update pet photo
  - Crop/resize functionality (optional)

---

## 📊 Phase 4: Reports & Export (Week 4-5)

### 4.1 Health Log Export

- [ ] CSV export functionality

  - Server action to generate CSV
  - Include: pet name, medication, dose time, status, sitter, notes
  - Filter by date range
  - Download button on owner dashboard

- [ ] Weekly summary email (optional)
  - Email digest of week's doses
  - Compliance rate
  - Missed doses alert
  - Use Resend or Sendgrid

**Files to create:**

```
app/api/export/health-logs/route.ts
lib/utils/generate-csv.ts
lib/email/send-weekly-summary.ts
```

**Packages to install:**

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

### 4.2 Analytics Dashboard (Stretch Goal)

- [ ] Compliance tracking

  - % of doses given on time
  - Missed doses
  - Charts with recharts

- [ ] Pet health timeline
  - Visual timeline of medications
  - Treatment history

---

## 🎨 Phase 5: Polish & UX (Week 5-6)

### 5.1 UI Improvements

- [ ] Add loading states everywhere

  - Skeletons for data loading
  - Button loading spinners
  - Optimistic UI updates

- [ ] Error handling

  - User-friendly error messages
  - Toast notifications (sonner or shadcn toast)
  - Retry mechanisms

- [ ] Mobile responsiveness
  - Test all views on mobile
  - Touch-friendly buttons
  - Simplified mobile navigation

### 5.2 Demo Mode

- [ ] Seed demo data

  - Create demo pets, medications, doses
  - "Try Demo" button on landing page
  - Auto-populate for first-time users

- [ ] Onboarding tour
  - Highlight key features
  - Step-by-step walkthrough
  - Use react-joyride or similar

**Packages to install:**

```bash
npm install sonner  # Toast notifications
npm install react-joyride  # Onboarding tour
```

---

## 🚀 Phase 6: Deployment & Documentation

### 6.1 Deployment

- [ ] Environment variables in Vercel

  - Add all Supabase keys
  - Add Twilio credentials
  - Set NEXT_PUBLIC_BASE_URL

- [ ] Set up Vercel Cron

  - Configure cron job for SMS reminders
  - Test cron execution

- [ ] Domain setup (optional)
  - Custom domain
  - SSL certificate

### 6.2 Documentation

- [ ] Write comprehensive README.md

  - Project overview
  - Problem statement
  - Tech stack
  - Setup instructions
  - Environment variables
  - Screenshots/demo GIF

- [ ] Architecture diagram

  - Draw.io or Excalidraw
  - Show data flow
  - SMS reminder flow

- [ ] API documentation (optional)
  - Document key endpoints
  - Request/response examples

---

## 📦 Additional Packages Needed

```bash
# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns

# SMS
npm install twilio

# CSV export
npm install papaparse
npm install --save-dev @types/papaparse

# Toast notifications
npm install sonner

# Icons (already have lucide-react)
# Already installed ✓

# Image upload/compression (optional)
npm install react-dropzone sharp
```

---

## 🎯 MVP Priority Order

**Must Have (Week 1-3):**

1. Pet CRUD
2. Medication CRUD
3. Sitter dashboard with today's doses
4. Manual dose confirmation
5. SMS reminders (basic)

**Should Have (Week 4):** 6. Photo uploads 7. CSV export 8. Sitter invitations

**Nice to Have (Week 5-6):** 9. Analytics 10. Weekly email summaries 11. Demo mode 12. Onboarding tour

---

## 📝 Testing Checklist

Before final deployment, test:

- [ ] User signup/login flow
- [ ] Owner: Add pet → Add medication → Invite sitter
- [ ] Sitter: Receive SMS → Click link → Confirm dose
- [ ] Photo upload on dose confirmation
- [ ] CSV export downloads correctly
- [ ] Cron job runs and sends SMS
- [ ] Mobile responsiveness
- [ ] Edge cases: deleted pets, expired medications
- [ ] RLS: Can sitters only see assigned pets?
- [ ] RLS: Can owners only see their own data?

---

## 🐛 Known Issues to Handle

- [ ] Timezone handling (scheduled times vs user timezone)
- [ ] What happens when sitter doesn't confirm? Auto-mark as missed?
- [ ] Notification preferences (some sitters may not want SMS)
- [ ] Multiple sitters for same pet - who gets the reminder?
- [ ] Medication end date - stop generating doses automatically

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Twilio SMS Quickstart:** https://www.twilio.com/docs/sms/quickstart/node
- **shadcn/ui Components:** https://ui.shadcn.com
- **Vercel Cron:** https://vercel.com/docs/cron-jobs

---

## 🎓 Portfolio Tips

**Highlight in your README:**

- Problem-solving approach (real user pain point)
- Full-stack capabilities (Next.js, Supabase, Twilio)
- Authentication & authorization (RLS policies)
- Scheduled tasks (cron jobs)
- Third-party API integration (Twilio)
- File uploads (Supabase Storage)
- Data export functionality
- Mobile-first design

**Demo Video Should Show:**

1. Owner adds pet + medication
2. Owner invites sitter
3. Sitter receives SMS (show phone screen)
4. Sitter clicks link, marks dose as given
5. Sitter uploads photo proof
6. Owner views history and exports CSV

Good luck! 🚀
