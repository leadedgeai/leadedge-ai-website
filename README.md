# LeadEdge AI — Website

The official website for LeadEdge AI, featuring the cinematic dark navy/gold landing page with a working waitlist signup form and an admin dashboard for managing subscribers.

## Project Structure

```
leadedge-website/
├── public/
│   ├── index.html          ← Landing page (served at / and /landing)
│   └── admin.html          ← Admin dashboard (served at /admin)
├── api/
│   ├── _db.js              ← Shared MySQL database helper
│   └── waitlist/
│       ├── join.js          ← POST /api/waitlist/join
│       ├── count.js         ← GET  /api/waitlist/count
│       ├── list.js          ← GET  /api/waitlist/list
│       ├── update-status.js ← POST /api/waitlist/update-status
│       └── delete.js        ← POST /api/waitlist/delete
├── server.js               ← Local development server
├── vercel.json             ← Vercel deployment configuration
├── package.json
└── .env.example
```

## URLs

| Page | URL |
|------|-----|
| Landing page | `yourdomain.com` or `yourdomain.com/landing` |
| Admin dashboard | `yourdomain.com/admin` |

**Admin password:** `leadedge2026` (change this in `public/admin.html` before going live)

---

## Deploy to Vercel (Recommended)

### Step 1 — Push to GitHub

```bash
cd leadedge-website
git init
git add .
git commit -m "Initial commit — LeadEdge AI website"
gh repo create leadedge-ai-website --private --push --source=.
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import the `leadedge-ai-website` repository
4. In **Environment Variables**, add:
   - `DATABASE_URL` = `mysql://user:password@host:3306/database_name`
5. Click **Deploy**

Your site will be live at `https://your-project.vercel.app` within 60 seconds.

### Step 3 — Set Up MySQL Database

You need a MySQL database. Free/cheap options:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [PlanetScale](https://planetscale.com) | 1 free database | MySQL-compatible, serverless |
| [Railway](https://railway.app) | $5 free credits | Easy MySQL setup |
| [Aiven](https://aiven.io) | Free tier available | Managed MySQL |
| [TiDB Cloud](https://tidbcloud.com) | Free tier | MySQL-compatible |

The table is auto-created on first API call — no manual migration needed.

### Step 4 — Connect GoDaddy Domain

1. In Vercel, go to **Project Settings → Domains**
2. Add `leadedgeai.com.au`
3. Vercel will show you DNS records to add. Typically:

**Option A — CNAME (if using www subdomain):**
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   1 hour
```

**Option B — A Records (if using root domain):**
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   1 hour
```

4. In GoDaddy:
   - Go to **My Products → DNS → Manage** for `leadedgeai.com.au`
   - Add the DNS records from step 3
   - Wait 15 minutes to a few hours for propagation

5. Back in Vercel, click **Verify** — once DNS propagates, your site is live at `leadedgeai.com.au`

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your database URL
cp .env.example .env
# Edit .env with your DATABASE_URL

# Start local server
node server.js
# → http://localhost:4000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/waitlist/join` | Add email to waitlist |
| GET | `/api/waitlist/count` | Get total signup count |
| GET | `/api/waitlist/list` | List all signups (admin) |
| POST | `/api/waitlist/update-status` | Update signup status (admin) |
| POST | `/api/waitlist/delete` | Delete a signup (admin) |

### Join Waitlist

```bash
curl -X POST https://yourdomain.com/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","name":"John Smith","agencyName":"Smith Realty","phone":"0412345678","plan":"professional"}'
```

---

## Security Notes

- Change the admin password in `public/admin.html` (search for `leadedge2026`)
- The admin dashboard uses client-side password protection — for production, consider adding server-side auth
- All API endpoints are open — add authentication middleware if needed
- Database credentials are stored as environment variables, never in code
