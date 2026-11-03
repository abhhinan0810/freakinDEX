# freakinDEX 🍆💦

A private, secure, mobile-first client directory and interaction tracking application featuring client management, dynamic average ratings, chronological review history, and secure Cloud Firestore storage.

> **100% Free Plan (No Credit Card / No Blaze Required)**  
> This version operates entirely on **Firebase Authentication** and **Cloud Firestore Database**, which are 100% free forever on Firebase's Spark Plan. You never need to enter a credit card or upgrade to the Blaze plan.

---

## 📱 Features

- **Mobile-First UX & Dark Theme**: Designed specifically for fluid mobile gestures and dark aesthetics (`#0B0B0F` base, `#17171F` card backgrounds, purple/pink neon accents, gold star ratings).
- **Body Count Hero Metric**: Prominent live counter tracking total client profiles secured in your vault.
- **Dynamic Star Ratings**: Reliable 5-star scoring system recalculating cumulative averages dynamically on every session.
- **Smashed Again Quick-Log**: Instant dedicated interaction logging page with star selector, session notes, and date picker.
- **Review History & Expansion**: Complete chronological history of reviews with collapsible older sessions.
- **Edgy Avatar Profiles**: High-style customizable gradient avatars (🔥, 🍒, 😈, 💋, 💎, 🐆, 🐰, ✨, 🍑) for private client identity.
- **Strict Access Control**: Route guards, disabled public registrations, and authenticated Firestore permissions.
- **Zero-Config Preview Sandbox**: Operates right out of the box with preloaded sample data even before connecting your Firebase project.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Canvas Confetti & CSS Shimmer transitions
- **Authentication**: Firebase Authentication (Free Spark Plan)
- **Database**: Cloud Firestore (Free Spark Plan)
- **Deployment**: Vercel (`vercel.json` SPA rewrite configured)

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build
```

When started without a `.env` file, **freakinDEX** runs in **Local Preview Mode** with pre-seeded demo profiles and an auto-fill admin login button (`admin@freakindex.com` / `admin123`).

---

## 🔒 Connecting Your Firebase Project (100% Free — No Card Needed)

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `freakindex-vault`) and follow the prompt.
4. Click **Create project**.

### Step 2: Register Web App & Get Credentials
1. In your project overview, click the **Web icon `</>`** to add an app.
2. Enter an app nickname (e.g. `freakinDEX Web`).
3. Click **Register app**.
4. Copy the keys shown in `firebaseConfig`.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values from your Firebase console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```

### Step 4: Enable Firebase Authentication
1. In Firebase Console, go to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Turn on the **Email/Password** toggle and click **Save**.

### Step 5: Create Your Administrator Account
1. Under **Authentication > Users** tab, click **Add user**.
2. Enter your desired administrator email (e.g. `admin@yourdomain.com`) and password.
3. Click **Add user**.

### Step 6: Create Cloud Firestore Database
1. In Firebase Console, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location.
4. Start in **Production mode**.

### Step 7: Deploy Firestore Security Rules
Go to **Firestore Database > Rules** tab, paste the rules below, and click **Publish**:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false;
    }

    match /clients/{clientId} {
      allow read: if isAuthenticated() && (resource.data.createdBy == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
    }

    match /reviews/{reviewId} {
      allow read: if isAuthenticated() && (resource.data.createdBy == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

---

## 🌐 Deploying to GitHub & Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: streamline freakinDEX without storage requirement"
git remote add origin https://github.com/your-username/freakinDEX.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New... > Project** and select your GitHub repository.
3. Under **Environment Variables**, paste the keys from your `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Click **Deploy**.
5. The included `vercel.json` rewrite ensures that nested routes like `/client/:id` and `/client/:id/review` reload seamlessly without 404 errors.
