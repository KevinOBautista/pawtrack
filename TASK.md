# PawTrack - Pet Medication Reminder

## Development Task Checklist

---

## Phase 0: Project Setup ✅

### Database Setup

- [x] Install SQLite3
- [x] Configure knexfile.js for SQLite
- [x] Update .env file
- [x] Create .gitignore
- [ ] Create all migrations
  - [ ] `create_users_table`
  - [ ] `create_pets_table`
  - [ ] `create_pet_sitters_table`
  - [ ] `create_medications_table`
  - [ ] `create_medication_schedules_table`
  - [ ] `create_dosing_records_table`
  - [ ] `create_sms_log_table`
- [ ] Run all migrations successfully
- [ ] Create seed data for testing

**Git Commit:** `git commit -m "feat: setup SQLite database and migrations"`

---

## Phase 1: Backend - Authentication (Week 1)

### User Model & Routes

- [ ] Create `src/models/User.ts`
  - [ ] `create(userData)` - Create new user
  - [ ] `findByEmail(email)` - Find user by email
  - [ ] `findById(id)` - Find user by ID
  - [ ] `update(id, userData)` - Update user
- [ ] Create `src/services/authService.ts`
  - [ ] Hash passwords with bcrypt
  - [ ] Generate JWT tokens
  - [ ] Verify JWT tokens
- [ ] Create `src/controllers/authController.ts`
  - [ ] `register` - Handle user registration
  - [ ] `login` - Handle user login
  - [ ] `logout` - Handle user logout (clear token)
- [ ] Create `src/routes/auth.ts`
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
- [ ] Create `src/middleware/auth.ts`
  - [ ] Verify JWT token middleware
  - [ ] Attach user to request object
- [ ] Create `src/app.ts` (Express app setup)
  - [ ] Configure CORS
  - [ ] Add body parser
  - [ ] Add routes
  - [ ] Add error handler
- [ ] Create `src/server.ts` (Server entry point)
- [ ] Test all auth endpoints in Postman/Thunder Client
  - [ ] Register new user
  - [ ] Login with credentials
  - [ ] Access protected route with token
  - [ ] Verify invalid token is rejected

**Git Commit:** `git commit -m "feat: implement user authentication with JWT"`

---

## Phase 2: Backend - Core Models (Week 2)

### Pet Management

- [ ] Create `src/models/Pet.ts`
  - [ ] `create(petData)` - Create new pet
  - [ ] `findById(id)` - Find pet by ID
  - [ ] `findByOwnerId(ownerId)` - Get all pets for an owner
  - [ ] `update(id, petData)` - Update pet
  - [ ] `delete(id)` - Delete pet
- [ ] Create `src/controllers/petController.ts`
  - [ ] `createPet` - Create new pet
  - [ ] `getPets` - Get all user's pets
  - [ ] `getPetById` - Get single pet
  - [ ] `updatePet` - Update pet
  - [ ] `deletePet` - Delete pet
- [ ] Create `src/routes/pets.ts`
  - [ ] `POST /api/pets` - Create pet
  - [ ] `GET /api/pets` - Get all user's pets
  - [ ] `GET /api/pets/:id` - Get single pet
  - [ ] `PUT /api/pets/:id` - Update pet
  - [ ] `DELETE /api/pets/:id` - Delete pet
- [ ] Add input validation middleware
- [ ] Test all pet endpoints

**Git Commit:** `git commit -m "feat: implement pet CRUD operations"`

### Medication Management

- [ ] Create `src/models/Medication.ts`
  - [ ] `create(medicationData)` - Create medication
  - [ ] `findById(id)` - Find medication
  - [ ] `findByPetId(petId)` - Get all meds for a pet
  - [ ] `update(id, medicationData)` - Update medication
  - [ ] `delete(id)` - Delete medication
- [ ] Create `src/models/MedicationSchedule.ts`
  - [ ] `create(scheduleData)` - Create schedule
  - [ ] `findByMedicationId(medId)` - Get schedules for medication
  - [ ] `update(id, scheduleData)` - Update schedule
  - [ ] `delete(id)` - Delete schedule
- [ ] Create `src/controllers/medicationController.ts`
  - [ ] `createMedication` - Create med + schedules
  - [ ] `getMedications` - Get all meds for a pet
  - [ ] `getMedicationById` - Get single med with schedules
  - [ ] `updateMedication` - Update med
  - [ ] `deleteMedication` - Delete med
- [ ] Create `src/routes/medications.ts`
  - [ ] `POST /api/medications` - Create medication
  - [ ] `GET /api/medications?petId=X` - Get meds for pet
  - [ ] `GET /api/medications/:id` - Get single medication
  - [ ] `PUT /api/medications/:id` - Update medication
  - [ ] `DELETE /api/medications/:id` - Delete medication
- [ ] Test all medication endpoints

**Git Commit:** `git commit -m "feat: implement medication and schedule management"`

### Pet Sitter Assignment

- [ ] Create `src/models/PetSitter.ts`
  - [ ] `assign(petId, sitterId, dates)` - Assign sitter
  - [ ] `findByPetId(petId)` - Get sitters for pet
  - [ ] `findActiveSitter(petId)` - Get current active sitter
  - [ ] `deactivate(id)` - End assignment
- [ ] Create `src/controllers/sitterController.ts`
  - [ ] `assignSitter` - Assign sitter to pet
  - [ ] `getSitters` - Get sitters for pet
  - [ ] `removeSitter` - End assignment
- [ ] Create `src/routes/sitters.ts`
  - [ ] `POST /api/sitters` - Assign sitter
  - [ ] `GET /api/sitters?petId=X` - Get sitters for pet
  - [ ] `DELETE /api/sitters/:id` - Remove assignment
- [ ] Test sitter endpoints

**Git Commit:** `git commit -m "feat: implement pet sitter assignment"`

---

## Phase 3: Backend - Dosing & Scheduling (Week 3)

### Dosing Records

- [ ] Create `src/models/DosingRecord.ts`
  - [ ] `create(recordData)` - Create dosing record
  - [ ] `findById(id)` - Find record by ID
  - [ ] `findByPetId(petId, dateRange)` - Get history
  - [ ] `findPending()` - Get pending doses
  - [ ] `findUpcoming(minutes)` - Get doses due soon
  - [ ] `markAdministered(id, data)` - Mark as given
  - [ ] `markMissed(id)` - Mark as missed
- [ ] Create `src/services/dosingService.ts`
  - [ ] `generateFutureDoses(medicationId, days)` - Generate records
  - [ ] `calculateNextDose(schedule)` - Calculate next time
- [ ] Create `src/controllers/dosingController.ts`
  - [ ] `getDosingHistory` - Get history for pet/owner
  - [ ] `confirmDose` - Mark dose as given (for sitter)
  - [ ] `getDoseByToken` - Get dose by reminder token
- [ ] Create `src/routes/dosing.ts`
  - [ ] `GET /api/dosing?petId=X` - Get dosing history
  - [ ] `GET /api/dosing/confirm/:token` - Get dose by token
  - [ ] `POST /api/dosing/:id/confirm` - Confirm dose administered
  - [ ] `POST /api/dosing/:id/skip` - Skip dose
- [ ] Create daily job to generate future dosing records
- [ ] Test dosing endpoints

**Git Commit:** `git commit -m "feat: implement dosing records and history"`

### SMS Integration (Twilio)

- [ ] Sign up for Twilio account
- [ ] Get Twilio credentials (SID, Auth Token, Phone Number)
- [ ] Add Twilio credentials to `.env`
- [ ] Install Twilio SDK: `npm install twilio`
- [ ] Create `src/services/smsService.ts`
  - [ ] `sendReminder(phone, message, token)` - Send SMS
  - [ ] `formatReminderMessage(dose)` - Format message
  - [ ] Log SMS to `sms_log` table
- [ ] Create `src/jobs/reminderScheduler.ts`
  - [ ] Check for upcoming doses every 5 minutes
  - [ ] Send SMS to active sitter
  - [ ] Generate unique confirmation token
  - [ ] Update `dosing_records` with SMS sent status
- [ ] Create `src/routes/webhooks.ts`
  - [ ] `POST /api/webhooks/twilio` - Receive SMS responses
  - [ ] Parse "YES", "DONE", etc. responses
  - [ ] Update dosing record status
- [ ] Setup node-cron for scheduler
- [ ] Test SMS flow end-to-end
  - [ ] Send test SMS
  - [ ] Confirm dose via SMS link
  - [ ] Verify database updates

**Git Commit:** `git commit -m "feat: implement SMS reminders with Twilio"`

---

## Phase 4: Backend - Photo Upload & Reports (Week 4)

### Photo Upload (Cloudinary)

- [ ] Sign up for Cloudinary account
- [ ] Get Cloudinary credentials
- [ ] Add credentials to `.env`
- [ ] Install Cloudinary SDK: `npm install cloudinary`
- [ ] Create `src/services/uploadService.ts`
  - [ ] `uploadPhoto(file)` - Upload to Cloudinary
  - [ ] `deletePhoto(publicId)` - Delete from Cloudinary
- [ ] Create `src/controllers/uploadController.ts`
  - [ ] `uploadDosePhoto` - Handle photo upload
- [ ] Add photo upload to dosing confirmation
- [ ] Update `src/routes/dosing.ts`
  - [ ] `POST /api/dosing/:id/photo` - Upload photo
- [ ] Test photo upload flow

**Git Commit:** `git commit -m "feat: implement photo upload for dose confirmation"`

### CSV Export

- [ ] Install csv-writer: `npm install csv-writer`
- [ ] Create `src/services/csvService.ts`
  - [ ] `generateDosingReport(ownerId, dateRange)` - Generate CSV
  - [ ] Format data for export
- [ ] Create `src/controllers/reportController.ts`
  - [ ] `exportDosingHistory` - Generate and download CSV
- [ ] Create `src/routes/reports.ts`
  - [ ] `GET /api/reports/dosing?startDate=X&endDate=Y` - Export CSV
- [ ] Test CSV export

**Git Commit:** `git commit -m "feat: implement CSV export for dosing history"`

### Missed Dose Notifications

- [ ] Create `src/jobs/missedDoseChecker.ts`
  - [ ] Run every 15 minutes
  - [ ] Find doses 15+ minutes late
  - [ ] Mark as "missed"
  - [ ] Send notification to owner (email or SMS)
- [ ] Setup cron job for missed dose checker
- [ ] Test missed dose detection

**Git Commit:** `git commit -m "feat: implement missed dose detection and alerts"`

---

## Phase 5: Frontend - Authentication (Week 5)

### Setup & Layout

- [ ] Create `src/lib/api.ts` - Axios instance with interceptors
- [ ] Create `src/hooks/useAuth.ts` - Auth state management
- [ ] Create `src/types/` - TypeScript interfaces
  - [ ] `user.ts`
  - [ ] `pet.ts`
  - [ ] `medication.ts`
  - [ ] `dosing.ts`
- [ ] Create `src/components/layout/Navbar.tsx`
- [ ] Create `src/components/layout/Sidebar.tsx`
- [ ] Create `src/components/layout/Layout.tsx`

**Git Commit:** `git commit -m "feat: setup frontend base structure and types"`

### Auth Pages

- [ ] Create `src/pages/Login.tsx`
  - [ ] Login form with validation
  - [ ] Call login API
  - [ ] Store JWT token
  - [ ] Redirect to dashboard
- [ ] Create `src/pages/Register.tsx`
  - [ ] Registration form (owner/sitter role)
  - [ ] Form validation
  - [ ] Call register API
  - [ ] Auto-login after registration
- [ ] Update `src/App.tsx` with protected routes
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Add loading states
- [ ] Add error handling and display
- [ ] Test auth flow
  - [ ] Register new user
  - [ ] Login
  - [ ] Protected routes redirect to login
  - [ ] Logout

**Git Commit:** `git commit -m "feat: implement authentication UI"`

---

## Phase 6: Frontend - Pet Management (Week 6)

### Pet Pages

- [ ] Create `src/pages/Dashboard.tsx`
  - [ ] Display welcome message
  - [ ] Show pet count
  - [ ] Show upcoming doses today
  - [ ] Quick action buttons
- [ ] Create `src/pages/Pets/index.tsx` (Pet List)
  - [ ] Fetch and display all pets
  - [ ] Pet cards with photo, name, species
  - [ ] "Add Pet" button
- [ ] Create `src/pages/Pets/NewPet.tsx`
  - [ ] Pet form (name, species, breed, age, weight)
  - [ ] Photo upload (optional)
  - [ ] Submit and redirect
- [ ] Create `src/pages/Pets/PetDetail.tsx`
  - [ ] Display pet info
  - [ ] Show medications for this pet
  - [ ] Edit/Delete buttons
- [ ] Create `src/pages/Pets/EditPet.tsx`
  - [ ] Pre-filled form
  - [ ] Update pet info
- [ ] Create `src/components/pets/PetCard.tsx`
- [ ] Create `src/components/pets/PetForm.tsx` (reusable)
- [ ] Add loading states and error handling
- [ ] Test pet CRUD operations

**Git Commit:** `git commit -m "feat: implement pet management UI"`

---

## Phase 7: Frontend - Medication Management (Week 7)

### Medication Pages

- [ ] Create `src/pages/Medications/index.tsx`
  - [ ] List all medications
  - [ ] Filter by pet
  - [ ] "Add Medication" button
- [ ] Create `src/pages/Medications/NewMedication.tsx`
  - [ ] Medication form (name, dosage, instructions)
  - [ ] Schedule builder component
  - [ ] Submit and create dosing records
- [ ] Create `src/components/forms/ScheduleBuilder.tsx`
  - [ ] Time picker for dose times
  - [ ] Frequency selector (daily, twice daily, etc.)
  - [ ] Days of week selector
  - [ ] Add multiple times
  - [ ] Preview schedule
- [ ] Create `src/pages/Medications/MedicationDetail.tsx`
  - [ ] Show medication info
  - [ ] Show schedule
  - [ ] Show dosing history
  - [ ] Edit/Delete buttons
- [ ] Create `src/pages/Medications/EditMedication.tsx`
  - [ ] Pre-filled form
  - [ ] Update medication + schedule
- [ ] Create `src/components/medications/MedCard.tsx`
- [ ] Create `src/components/medications/ScheduleDisplay.tsx`
- [ ] Test medication CRUD operations

**Git Commit:** `git commit -m "feat: implement medication management UI"`

### Sitter Assignment

- [ ] Create `src/pages/Sitters/index.tsx`
  - [ ] List assigned sitters
  - [ ] Assign new sitter form
  - [ ] Search for sitters by phone
  - [ ] Set start/end dates
- [ ] Create `src/components/forms/SitterAssignment.tsx`
- [ ] Test sitter assignment

**Git Commit:** `git commit -m "feat: implement sitter assignment UI"`

---

## Phase 8: Frontend - Dosing & Confirmation (Week 8)

### Dosing History

- [ ] Create `src/pages/DosingHistory/index.tsx`
  - [ ] List all dosing records
  - [ ] Filter by pet, date range, status
  - [ ] Show photos if available
  - [ ] Color-coded status badges
- [ ] Create `src/components/dosing/DosingRecord.tsx`
- [ ] Create `src/components/dosing/StatusBadge.tsx`
  - [ ] Pending (yellow)
  - [ ] Administered (green)
  - [ ] Missed (red)
  - [ ] Skipped (gray)

**Git Commit:** `git commit -m "feat: implement dosing history view"`

### Sitter Confirmation Page

- [ ] Create `src/pages/Confirm/[token].tsx`
  - [ ] Fetch dose by token
  - [ ] Display pet name, medication, dosage
  - [ ] "Mark as Given" button
  - [ ] Photo upload option
  - [ ] Success confirmation
  - [ ] Mobile-responsive design
- [ ] Test confirmation flow
  - [ ] Click SMS link
  - [ ] Confirm dose
  - [ ] Upload photo
  - [ ] Verify database updates

**Git Commit:** `git commit -m "feat: implement sitter dose confirmation page"`

---

## Phase 9: Frontend - Reports & Polish (Week 9)

### CSV Export

- [ ] Create `src/pages/Reports/index.tsx`
  - [ ] Date range picker
  - [ ] Pet selector
  - [ ] "Export CSV" button
  - [ ] Download CSV file
- [ ] Create `src/components/reports/ExportForm.tsx`
- [ ] Test CSV export

**Git Commit:** `git commit -m "feat: implement CSV export UI"`

### UI Polish

- [ ] Add loading spinners everywhere
- [ ] Improve error messages
- [ ] Add success notifications (toast messages)
- [ ] Add confirmation dialogs for delete actions
- [ ] Improve mobile responsiveness
- [ ] Add empty states (no pets, no medications)
- [ ] Add help text/tooltips
- [ ] Test on different screen sizes

**Git Commit:** `git commit -m "style: improve UI/UX and responsiveness"`

### Testing & Bug Fixes

- [ ] Test entire app flow end-to-end
- [ ] Fix any bugs found
- [ ] Test edge cases
- [ ] Ensure all forms validate properly
- [ ] Test with multiple users/pets/medications

**Git Commit:** `git commit -m "fix: resolve bugs and improve stability"`

---

## Phase 10: Testing (Week 10)

### Backend Tests

- [ ] Write tests for auth endpoints
- [ ] Write tests for pet endpoints
- [ ] Write tests for medication endpoints
- [ ] Write tests for dosing endpoints
- [ ] Test SMS service (mocked)
- [ ] Test photo upload (mocked)
- [ ] Run all tests: `npm test`

**Git Commit:** `git commit -m "test: add comprehensive backend tests"`

### Integration Testing

- [ ] Test auth flow
- [ ] Test pet creation → medication → dosing flow
- [ ] Test SMS reminder → confirmation flow
- [ ] Test photo upload flow
- [ ] Test CSV export

**Git Commit:** `git commit -m "test: add integration tests"`

---

## Phase 11: Deployment (Week 11)

### Prepare for Production

- [ ] Review all environment variables
- [ ] Update README.md with setup instructions
- [ ] Create production .env.example
- [ ] Ensure .gitignore is complete
- [ ] Remove console.logs
- [ ] Add error logging (optional: Sentry)

**Git Commit:** `git commit -m "chore: prepare for production deployment"`

### Deploy Backend

- [ ] Sign up for Railway/Render
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Add PostgreSQL database
- [ ] Deploy backend
- [ ] Run migrations on production database
- [ ] Test API endpoints in production

**Git Commit:** `git commit -m "deploy: backend to Railway/Render"`

### Deploy Frontend

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Build frontend: `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Add environment variables
- [ ] Test production frontend
- [ ] Verify SMS links work with production URL

**Git Commit:** `git commit -m "deploy: frontend to Vercel/Netlify"`

### Production Testing

- [ ] Register real user account
- [ ] Create test pet
- [ ] Create test medication
- [ ] Test SMS reminder (use real phone)
- [ ] Confirm dose via SMS link
- [ ] Upload photo
- [ ] Export CSV
- [ ] Test on mobile device

---

## Phase 12: Launch & Iterate

### Soft Launch

- [ ] Share with 2-3 beta users (friends/family)
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Monitor error logs
- [ ] Check SMS delivery rates

### Documentation

- [ ] Write user guide
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Add screenshots to README

### Future Enhancements (Post-Launch)

- [ ] Email notifications for missed doses
- [ ] Weekly summary emails to owners
- [ ] Mobile app (React Native)
- [ ] Multiple languages (Spanish)
- [ ] Integration with vet records
- [ ] Medication refill reminders
- [ ] Analytics dashboard for owners
- [ ] Payment system for professional sitters

---

## Notes

- **Commit often!** Commit after completing each major task
- **Test as you go** - Don't wait until the end
- **Take breaks** - Step away if stuck for 30+ minutes
- **Ask for help** - Use Stack Overflow, documentation, AI
- **Celebrate wins** - You're building something real!

---

## Quick Reference

### Useful Commands

```bash
# Run migrations
npm run migrate:latest

# Rollback migration
npm run migrate:rollback

# Create new migration
npx knex migrate:make migration_name

# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Run tests
cd server && npm test

# Build for production
npm run build
```

### Git Workflow

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: your message here"

# Push to GitHub
git push origin main
```

---

**Current Phase:** Phase 0 - Project Setup
**Started:** [Today's Date]
**Target Launch:** 12 weeks from start

Good luck! 🚀🐕💊
