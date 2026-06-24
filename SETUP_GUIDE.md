# 🚀 AURORAHUB — COMPLETE SETUP GUIDE

---

## STEP 1 — MONGODB ATLAS (Database)

1. Go to https://cloud.mongodb.com and create a free account
2. Click "Build a Database" → choose "M0 Free"
3. Choose a region close to Spain (e.g. EU West)
4. Create a username and password → SAVE THEM
5. In "Network Access" → Add IP → "Allow access from anywhere" (0.0.0.0/0)
6. Click "Connect" → "Drivers" → copy the connection string
   It looks like: mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/
7. Replace <password> with your password and add "aurorahub" at the end:
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/aurorahub
8. Paste this into your .env as MONGODB_URI

---

## STEP 2 — DISCORD APPLICATION

1. Go to https://discord.com/developers/applications
2. Click "New Application" → name it "aurorahub"
3. Go to "OAuth2" → copy CLIENT ID and CLIENT SECRET
   → paste into .env as DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET
4. In "Redirects" → Add:
   https://aurorahub-server.onrender.com/auth/discord/callback
5. Go to "Bot" → click "Add Bot"
   → click "Reset Token" → copy the token
   → paste into .env as DISCORD_BOT_TOKEN
6. Under "Privileged Gateway Intents" → enable:
   - Server Members Intent
   - Message Content Intent
7. To invite the bot to your server:
   Go to OAuth2 → URL Generator → check: bot, applications.commands
   Bot permissions: Send Messages, Embed Links, Use Slash Commands, Read Member List
   Copy the URL → open it → invite bot to your server
8. Right-click your server icon → "Copy Server ID"
   → paste into .env as DISCORD_GUILD_ID

---

## STEP 3 — KO-FI WEBHOOK

1. Go to https://ko-fi.com → Settings → API (bottom of page)
2. Copy your verification token → paste as KOFI_VERIFICATION_TOKEN
3. Set the webhook URL to:
   https://aurorahub-server.onrender.com/webhooks/kofi
4. In your Ko-fi shop settings, make sure your shop products match what you create in the admin panel

---

## STEP 4 — GENERATE SECRETS

Generate two random 64-character strings for SESSION_SECRET and JWT_SECRET.
You can use: https://generate-secret.vercel.app/64
Or run in terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

---

## STEP 5 — CREATE YOUR .env FILE

Copy server/.env.example to server/.env and fill in all values:

```
PORT=4000
NODE_ENV=production
CLIENT_URL=https://aurorahub.vercel.app   ← your Vercel URL

MONGODB_URI=mongodb+srv://...

SESSION_SECRET=your_64_char_secret_here
JWT_SECRET=your_other_64_char_secret_here

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=https://aurorahub-server.onrender.com/auth/discord/callback
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_server_id
DISCORD_ADMIN_ROLE_ID=1518750056361234452
DISCORD_SERVER_INVITE=https://discord.gg/8dUzp5WGd9

KOFI_VERIFICATION_TOKEN=your_kofi_token
UPLOADS_DIR=./uploads
```

---

## STEP 6 — CREATE REACT .env FILE

Create client/.env with:
```
REACT_APP_API_URL=https://aurorahub-server.onrender.com
```

---

## STEP 7 — PUSH TO GITHUB

Run these commands in your terminal inside the aurorahub folder:

```bash
git init
git add .
git commit -m "Initial commit: aurorahub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aurorahub.git
git push -u origin main
```

(Create the repo first on https://github.com/new → name it "aurorahub" → don't add README)

---

## STEP 8 — DEPLOY SERVER ON RENDER

1. Go to https://render.com → sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your aurorahub repo
4. Settings:
   - Name: aurorahub-server
   - Root Directory: server
   - Build Command: npm install
   - Start Command: node index.js
   - Instance type: Free
5. Add Environment Variables (click "Add from .env" or add them one by one)
   Copy all values from your server/.env file
6. Click "Create Web Service"
7. Wait for deploy → copy the URL (e.g. https://aurorahub-server.onrender.com)

---

## STEP 9 — DEPLOY CLIENT ON VERCEL

1. Go to https://vercel.com → sign in with GitHub
2. Click "Add New Project" → import aurorahub repo
3. Settings:
   - Framework: Create React App
   - Root Directory: client
   - Build Command: npm run build
   - Output Directory: build
4. Add environment variable:
   REACT_APP_API_URL = https://aurorahub-server.onrender.com
5. Click "Deploy"
6. Copy your Vercel URL (e.g. https://aurorahub.vercel.app)
7. Go back to Render → add environment variable:
   CLIENT_URL = https://aurorahub.vercel.app
8. Redeploy the server on Render (click "Manual Deploy")

---

## STEP 10 — UPDATE DISCORD OAUTH2 CALLBACK

After you have your Render URL, go to:
https://discord.com/developers/applications → your app → OAuth2 → Redirects
Make sure it says: https://aurorahub-server.onrender.com/auth/discord/callback

---

## STEP 11 — FIRST LOGIN AND ADMIN SETUP

1. Open your Vercel URL
2. Click "Log in with Discord" → authorize
3. In your Discord server, give yourself the admin role (ID: 1518750056361234452)
   Or in MongoDB Atlas → Browse Collections → users → find your user → set isAdmin: true
4. Now you'll see the admin panel in your dashboard

---

## STEP 12 — ADD LOGO IMAGE

Put your black logo (for PDFs) in:
server/assets/logo-black.png

Push to GitHub and redeploy Render.

---

## FREQUENTLY ASKED

Q: The server sleeps after 15 minutes on Render free plan — how to fix?
A: Use UptimeRobot (free) → create a monitor for https://aurorahub-server.onrender.com/health → ping every 5 minutes

Q: How do I update the site after making changes?
A: git add . && git commit -m "update" && git push
   Render and Vercel auto-deploy on push.

Q: How to add the admin role to a Discord user?
A: In your Discord server → Server Settings → Roles → create a role → right-click the role → Copy ID → it should match DISCORD_ADMIN_ROLE_ID in .env

Q: Ko-fi webhook not working?
A: Make sure your Render server is awake (visit /health) before testing. Ko-fi sends real webhooks only for real purchases — use the Ko-fi webhook simulator in API settings for testing.

---

© 2026 aurorahub. All rights reserved.
