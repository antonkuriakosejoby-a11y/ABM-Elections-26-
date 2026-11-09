# ABM Elections 2026-2027

A voting website. Hosted on **GitHub Pages**; votes stored in **Firebase Firestore**.

## 1. Set up Firebase (once)
1. Go to https://console.firebase.google.com → **Add project** (e.g. `abm-elections`).
2. **Build → Firestore Database → Create database** → choose a location near you (e.g. `asia-south1`) → start in **production mode**.
3. Open the **Rules** tab, delete everything, paste the contents of `firestore.rules`, click **Publish**.
4. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app (no hosting needed).
5. Copy the `firebaseConfig` values into `js/firebase-config.js`.

## 2. Put it on GitHub Pages
1. Create a new **public** repository on https://github.com (e.g. `abm-elections`).
2. Click **Add file → Upload files**, drag in everything in this folder (`index.html`, the other `.html` files, and the `css`, `js`, `images` folders) → **Commit**.
3. **Settings → Pages → Source: Deploy from a branch → Branch: main / (root)** → Save.
4. After a minute the site is live at `https://<your-username>.github.io/abm-elections/`.

## Changing things
- Voting deadline: `VOTING_END` and `VOTING_END_LABEL` in `js/app.js`, **and** the date in `firestore.rules` (republish rules).
- Reset all votes (for testing): Firestore console → `votes` collection → delete the documents.

## Users
| Name | Role | User ID |
|---|---|---|
| Joby Joseph | Candidate | ABMelections2026user1047 |
| Anna Maria | Voting person | ABMelections2026user2318 |
| Asha Joby | Candidate | ABMelections2026user3592 |
| Aaron Joseph | Candidate | ABMelections2026user4765 |
| Anton Kuriakose | Voting person | ABMelections2026user5821 |
