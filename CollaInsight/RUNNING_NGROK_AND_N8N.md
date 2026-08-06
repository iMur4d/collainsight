# Running the Live Demo — ngrok + n8n Cloud

This is the practical runbook for getting the live pipeline working:

```
Telegram → n8n Cloud → ngrok tunnel → local backend (FastAPI + LangGraph) → Gemini → Supabase → back to Telegram
```

n8n runs on n8n Cloud (not locally), but the backend runs on **your machine**. Since n8n Cloud can't reach `localhost`, ngrok gives your local backend a public HTTPS URL n8n can call. Follow this every time you want to demo; the troubleshooting section at the bottom covers every issue actually hit while building this.

---

## One-time setup (do this once, not every demo)

1. **Create a free ngrok account** at [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) (skip if you already have one).
2. **Copy your authtoken** from [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken).
3. **Reserve a free static domain** at [dashboard.ngrok.com/domains](https://dashboard.ngrok.com/domains) → "+ New Domain". Looks like `<random-words>.ngrok-free.app`. Free plan gives you **one** static domain — if you already used yours for local n8n's own Telegram webhook, this needs a second one (or reuse if you've moved to n8n Cloud and don't need the first anymore).
4. **Install the ngrok CLI:**
   ```bash
   winget install ngrok -s msstore
   ```
   Open a **new** terminal window afterward — Store-installed apps sometimes need a fresh session for PATH to update.
5. **Add your authtoken** (one-time, saved to ngrok's config):
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
6. **Set up the backend** if you haven't — see `backend/README.md` for `pip install`, `.env`, and the `poc_ideas` table DDL.

---

## Every time you want to demo

You need **two terminal windows** running simultaneously for the whole session. Closing either one breaks the chain.

### Terminal 1 — the backend

```bash
cd CollaInsight/backend
.venv/Scripts/activate
uvicorn api.main:app --port 8000
```

Verify: open `http://localhost:8000/health` in a browser — should show `{"status":"ok"}`.

### Terminal 2 — the tunnel

```bash
ngrok http --url=your-reserved-domain.ngrok-free.app 8000
```

Replace `your-reserved-domain.ngrok-free.app` with your actual reserved domain from setup step 3. Leave this running.

Verify: visit `https://your-reserved-domain.ngrok-free.app/health` (note: **https**, not http) — should show the same `{"status":"ok"}`. If this fails but the localhost check passed, the tunnel isn't actually forwarding — check Terminal 2 for errors.

### Point n8n Cloud at the tunnel (only needed when the URL changes)

Since you're using a **reserved static domain**, this URL doesn't change between sessions — you only need to set it once, not every time you restart. In your n8n Cloud workflow, open the **Call Idea Agent (POST /api/idea)** node and set its URL to:

```
https://your-reserved-domain.ngrok-free.app/api/idea
```

Make sure the workflow is **active** in n8n Cloud.

### Test it

Send `/idea <something>` to your Telegram bot. You should get a structured reply within a few seconds. If you want to check the dashboard too, also run the frontend (`npm --prefix CollaInsight/frontend run dev`, needs `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000`) — the dashboard talks to `localhost:8000` directly, it does **not** need the tunnel, since your browser and the backend are both on your machine.

### Shutting down

Ctrl+C in both terminals. Don't leave the tunnel running unattended — `/api/idea` and `/api/ideas` have no authentication yet (PoC-only), so anyone with the URL can hit them, and every hit costs a real Gemini call.

---

## Troubleshooting — things that actually went wrong building this

### "Internal Server Error" from `/api/idea`, backend log mentions a Gemini model error
The model name in `backend/.env`'s `GEMINI_MODEL` doesn't exist. Check what's actually available with your key:
```bash
python -c "
import os, urllib.request, json
key = os.environ['GEMINI_API_KEY']
url = f'https://generativelanguage.googleapis.com/v1beta/models?key={key}'
print([m['name'] for m in json.load(urllib.request.urlopen(url))['models'] if 'flash' in m['name']])
"
```
`gemini-3.1-flash-lite` and `gemini-3-flash-preview` are both known-good as of this project.

### "row violates row-level security policy" when saving an idea
The key in `backend/.env`'s `SUPABASE_KEY` is the wrong type. Supabase has two key systems:
- **Legacy JWT keys**: `anon` (client-safe, RLS-restricted) vs `service_role` (bypasses RLS) — decode the JWT to check which:
  ```bash
  python -c "
  import base64, json
  key = 'PASTE_KEY_HERE'
  payload = key.split('.')[1]; payload += '=' * (-len(payload) % 4)
  print(json.loads(base64.urlsafe_b64decode(payload))['role'])
  "
  ```
- **New-format keys**: `sb_publishable_...` (client-safe, same as old `anon`) vs `sb_secret_...` (bypasses RLS, same as old `service_role`).

You want **`service_role`** or **`sb_secret_...`** — this backend is a pure server-to-server caller, never exposed to a browser, so there's no reason to use the restricted key. Get it from Supabase dashboard → Project Settings → API.

### `.env` values don't seem to take effect after editing
Confirm the file actually has content (`wc -l backend/.env` — 0 lines means it's empty, a common mistake if you copied the path but didn't save). Also confirm `backend/api/main.py` still calls `load_dotenv()` near the top, before any other backend module is imported.

### Backend still behaves like the old `.env` values after you fixed them and restarted
On Windows + Git Bash, `kill`/`pkill` often target the **wrong PID** — Git Bash's MSYS layer virtualizes PIDs separately from real Windows PIDs, so a `kill` can silently do nothing while the real process (and its stale in-memory Supabase client) keeps running on the port. Find the real PID and kill it via PowerShell instead:
```powershell
netstat -ano | Select-String ":8000"
Stop-Process -Id <the_PID_from_netstat> -Force
```

### `/health` works but `/api/idea` never responds, or n8n shows a connection error
- Confirm the tunnel is actually running (Terminal 2) and the URL in n8n's HTTP Request node matches your **reserved domain exactly**, `https://`, path `/api/idea`.
- If you're testing with **local Docker n8n** instead of n8n Cloud, `localhost` inside the n8n container means the container itself, not your machine — use `http://host.docker.internal:8000/api/idea` in that case instead of a tunnel at all.

### Duplicate detection doesn't seem to trigger for an idea that's clearly similar to an existing one
`search_similar_ideas` does a keyword-tokenized match, not semantic search — very differently-worded duplicates can legitimately be missed. This is a known, accepted PoC limitation, not a bug to chase during a demo.

---

## Quick reference

| Thing | Value |
|---|---|
| Backend health check | `http://localhost:8000/health` |
| Tunnel health check | `https://your-domain.ngrok-free.app/health` |
| n8n's target URL | `https://your-domain.ngrok-free.app/api/idea` |
| Frontend's backend URL | `http://localhost:8000` (direct, no tunnel needed) |
| Kill a stuck backend (Windows) | `netstat -ano \| Select-String ":8000"` then PowerShell `Stop-Process -Id <PID> -Force` |
