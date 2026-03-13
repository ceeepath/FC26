# EA26 Tournament Manager · TNC

FIFA PS5 Tournament management app for the TNC WhatsApp community.

---

## 🚀 How to Deploy on Netlify (Step by Step)

You have **two options**. Option A is easier if you're not a developer.

---

### ✅ Option A — Deploy via Netlify Drop (Easiest, No Account Needed)

This option builds the app on your computer and uploads the result to Netlify.

**Step 1 — Install Node.js**

Go to https://nodejs.org and download the **LTS version** (the recommended one).
Install it like any normal program.

To confirm it worked, open your Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
```
You should see something like `v20.x.x`. If you do, you're good.

---

**Step 2 — Install the app dependencies**

Open Terminal / Command Prompt, navigate to the project folder, then run:
```
cd ea26-tournament
npm install
```
This downloads everything the app needs. Wait for it to finish (1-2 mins).

---

**Step 3 — Build the app**

Still in the same folder, run:
```
npm run build
```
This creates a new folder called **`dist`** inside the project folder.
That `dist` folder is your ready-to-deploy app.

---

**Step 4 — Upload to Netlify Drop**

1. Go to **https://app.netlify.com/drop**
2. Drag and drop the entire **`dist`** folder onto the page
3. Netlify will give you a live URL immediately — something like `https://random-name-123.netlify.app`
4. Share that link with your WhatsApp group! 🎉

> ⚠️ Note: With Netlify Drop (no account), sites are deleted after 1 hour unless you create a free account and claim the site. Creating an account is free and takes 30 seconds.

---

### ✅ Option B — Deploy via GitHub + Netlify (Best for future updates)

Use this if you want to easily push updates to the app over time.

**Step 1** — Create a free account at https://github.com

**Step 2** — Create a new repository (click the `+` icon → New repository)
- Name it `ea26-tournament`
- Make it **Public**
- Click **Create repository**

**Step 3** — Upload all the project files to that repository
(Use the GitHub web interface "uploading an existing file" option, or use Git if you know how)

**Step 4** — Go to https://netlify.com → Sign up (free) → Click **"Add new site"** → **"Import an existing project"**

**Step 5** — Connect your GitHub account and select the `ea26-tournament` repo

**Step 6** — Set these build settings:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

**Step 7** — Click **Deploy**. Done! 🏆

After this, every time you push changes to GitHub, Netlify auto-deploys the update.

---

## 🔐 Default Admin Password

```
ea26admin
```

**Change this immediately after first login!** Go to ⚙️ Settings → Change Admin Password.

---

## 📱 How to Use the App

### Part 1 (Current) — Player Registration

1. Open the app → click **"Admin Login"** in the top right
2. Enter the password: `ea26admin`
3. Under **⚽ Players**, add each competitor's name
4. Use ✏️ Edit to fix names, 🗑️ to remove players
5. Under **⚙️ Settings**, you can:
   - Change the admin password
   - Toggle "Open Result Entry" so anyone (not just admins) can enter scores later

---

## 🗺️ What's Coming Next

- **Part 2** — Group Stage Setup (assign players to groups manually)
- **Part 3** — Fixture Generator (auto-generate match fixtures per group)
- **Part 4** — Result Entry + Live Standings Table
- **Part 5** — Top Scorers Tracker
- **Part 6** — Knockout Bracket (Quarters → Semis → Final)
- **Part 7** — WhatsApp Export (copy standings to clipboard)

---

## 🛠 Tech Stack

- React 18
- Vite
- Tailwind CSS
- localStorage (no backend needed)
