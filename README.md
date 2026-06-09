# Kilifi Hospital IT Helpdesk

A lightweight IT support ticketing system built for Kilifi County Referral Hospital.
Staff submit IT requests without logging in. The IT team manages and resolves them via a protected dashboard.

---

## Tech stack

- **React** (Vite) — frontend
- **Supabase** — database, auth, realtime updates
- **React Router** — staff portal vs IT dashboard routing
- **Vercel** — hosting (free tier)

---

## Project structure

```
src/
├── components/
│   ├── staff/
│   │   ├── SubmitForm.jsx     # Staff ticket submission form
│   │   └── TrackTicket.jsx    # Staff ticket status tracker
│   ├── dashboard/
│   │   ├── Login.jsx          # IT staff login
│   │   ├── Dashboard.jsx      # Main IT dashboard
│   │   └── TicketDetail.jsx   # Ticket update panel
│   └── shared/
│       └── index.jsx          # Reusable UI components
├── hooks/
│   └── useTickets.js          # All Supabase data logic
├── lib/
│   ├── supabase.js            # Supabase client + DB schema SQL
│   └── constants.js           # Categories, departments, styles
└── pages/
    └── StaffPortal.jsx        # Staff-facing layout
```

**Routes:**
- `/`           → Staff portal (public — no login required)
- `/dashboard`  → IT dashboard (requires IT staff login)

---

## Setup guide

### Step 1 — Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (name it `kilifi-helpdesk`)
3. Wait for it to provision (~1 minute)

### Step 2 — Run the database SQL

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Copy the entire SQL block from `src/lib/supabase.js` (between the `===` lines)
3. Paste it and click **Run**

This creates:
- `tickets` table with auto-generated ticket numbers (`KH-0001`, `KH-0002`...)
- Row Level Security (staff can submit and read; only IT can update)
- `it_users` table for IT staff roles
- Auto-updating `updated_at` trigger

### Step 3 — Create IT staff accounts

1. Supabase dashboard → **Authentication** → **Users** → **Add user**
2. Enter the IT staff email and a password
3. Copy the UUID shown for that user
4. In SQL Editor, run:
   ```sql
   insert into public.it_users (id, name, role)
   values ('<paste-uuid-here>', 'Your Name', 'admin');
   ```
5. Repeat for each IT team member (use `'technician'` role for non-admins)

### Step 4 — Local development

```bash
# Clone / download the project
cd kilifi-helpdesk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase → **Settings** → **API**.

```bash
# Start dev server
npm run dev
```

Open http://localhost:5173

### Step 5 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts, then add environment variables:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Usage

### For hospital staff
- Visit the deployed URL (or set a browser shortcut on their desktop)
- Fill in their name, department, issue type, and description
- Get a ticket number on confirmation — they can write it down
- Visit the "Track my ticket" tab anytime to check status

### For IT team (you)
- Visit `/dashboard`
- Log in with your Supabase credentials
- See all tickets with live updates (no refresh needed)
- Click any ticket to update status and add resolution notes
- Staff see the resolution note when they track their ticket

---

## Adding WhatsApp notifications (optional Phase 2)

When a ticket is submitted, notify the IT team via WhatsApp using CallMeBot (free):

1. Add your number to CallMeBot: https://www.callmebot.com/blog/free-api-whatsapp-messages/
2. In `useSubmitTicket` hook, after the Supabase insert succeeds, add:

```js
const apiKey = 'your-callmebot-api-key'
const phone  = '254XXXXXXXXX'   // IT team number with country code
const msg    = encodeURIComponent(
  `New IT ticket ${data.ticket_number}\nCategory: ${formData.category}\nDept: ${formData.department}\nPriority: ${formData.priority}`
)
await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${msg}&apikey=${apiKey}`)
```

---

## What to build next (Phase 2 & 3)

- [ ] Analytics page — charts of issue trends by category/department
- [ ] Email notifications on ticket update (Supabase has built-in email)
- [ ] Ticket assignment to specific technicians
- [ ] Knowledge base — self-service fixes for common issues
- [ ] AI assistant — embed Claude API to suggest solutions before escalating
- [ ] SMS fallback via Africa's Talking API (great for low-smartphone staff)
