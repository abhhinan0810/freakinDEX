# freakinDEX 🍆💦

A private, secure, mobile-first client profile and interaction tracking application featuring client management, dynamic average ratings, review history, private media galleries (photos and videos), and authenticated cloud storage.

---

## 📱 Features

- **Mobile-First UX & Dark Theme**: Designed specifically for fluid mobile gestures and dark aesthetics (`#0B0B0F` base, `#17171F` card backgrounds, purple/pink neon accents, gold star ratings).
- **Body Count Hero Metric**: Prominent live counter tracking total client profiles secured in your vault.
- **Dynamic Star Ratings**: Reliable 5-star scoring system recalculating cumulative averages dynamically on every session.
- **Smashed Again Quick-Log**: Instant dedicated interaction logging page with star selector, session notes, date picker, and media attachments.
- **Review History & Expansion**: Complete chronological history of reviews with collapsible older sessions.
- **Private Media Vault**: High-speed photo and video gallery with full playback and image preview modals.
- **Strict Access Control**: Route guards, disabled public registrations, and authenticated storage permissions.
- **Zero-Config Preview Sandbox**: Operates right out of the box with preloaded sample data even before connecting your Firebase project.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Canvas Confetti & CSS Shimmer transitions
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Media Storage**: Firebase Cloud Storage
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

## 🔒 Connecting Your Firebase Project (Step-by-Step)

Follow these steps to connect your own live Firebase backend:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `freakindex-vault`) and follow the prompt (Google Analytics is optional).
4. Click **Create project**.

### Step 2: Register Web App & Get Credentials
1. In your project overview, click the **Web icon `</>`** to add an app.
2. Enter an app nickname (e.g., `freakinDEX Web`).
3. Click **Register app**.
4. Firebase will show your `firebaseConfig` keys:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

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
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```

### Step 4: Enable Firebase Authentication
1. In Firebase Console, go to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable **Email/Password** and click **Save**.
5. *Security Recommendation*: Keep **Email link (passwordless sign-in)** disabled. Since public registration is disabled in freakinDEX, only administrators created via console or authorized scripts can sign in.

### Step 5: Create Your First Administrator Account
1. Under **Authentication > Users** tab, click **Add user**.
2. Enter your desired administrator email (e.g. `admin@yourdomain.com`) and a strong password.
3. Click **Add user**.

### Step 6: Create Cloud Firestore Database
1. In Firebase Console, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select one close to your region).
4. Start in **Production mode** (rules will be applied in Step 8).

### Step 7: Enable Firebase Cloud Storage
1. Navigate to **Build > Storage**.
2. Click **Get Started**.
3. Select **Start in production mode**.
4. Choose the storage location and click **Done**.

### Step 8: Deploy Firebase Security Rules
Deploy using the Firebase CLI or copy-paste directly into the Firebase Console:

#### Firestore Rules (`firestore.rules`):
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

    match /media/{mediaId} {
      allow read: if isAuthenticated() && (resource.data.uploadedBy == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.uploadedBy == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.uploadedBy == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.uploadedBy == request.auth.uid;
    }
  }
}
```

#### Storage Rules (`storage.rules`):
```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /private/users/{userId}/clients/{clientId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && (
                     (request.resource.contentType.matches('image/.*') && request.resource.size < 15 * 1024 * 1024)
                     ||
                     (request.resource.contentType.matches('video/.*') && request.resource.size < 100 * 1024 * 1024)
                   );
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🌐 Deploying to GitHub & Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial freakinDEX release"
git branch -M main
git remote add origin https://github.com/your-username/freakinDEX.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New... > Project** and select your GitHub repository.
3. Framework Preset: **Vite** (auto-detected).
4. Under **Environment Variables**, paste the keys from your `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Click **Deploy**.
6. The included `vercel.json` rewrite ensures that nested routes like `/client/:id` and `/client/:id/review` reload seamlessly without 404 errors.

---

## 📂 Project Structure

```
freakinDEX/
├── .env.example
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── storage.rules
├── tailwind.config.js
├── vercel.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── ClientCard.jsx
    │   ├── ConfirmDialog.jsx
    │   ├── EditClientModal.jsx
    │   ├── Loading.jsx
    │   ├── MediaGallery.jsx
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── ReviewCard.jsx
    │   └── StarRating.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ToastContext.jsx
    ├── hooks/
    │   ├── useAuth.js
    │   └── useClients.js
    ├── pages/
    │   ├── AddClient.jsx
    │   ├── AddReview.jsx
    │   ├── ClientProfile.jsx
    │   ├── Dashboard.jsx
    │   └── Login.jsx
    ├── services/
    │   ├── authService.js
    │   ├── clientService.js
    │   ├── firebase.js
    │   ├── reviewService.js
    │   └── storageService.js
    └── utils/
        ├── avatars.js
        ├── ratingUtils.js
        └── validation.js
```

---

## 🔒 Security & Privacy Notice

- This application is strictly for personal/authorized administrator usage.
- Never commit live API secrets or real `.env` files to public git repositories.
- All media files are stored within scoped `private/users/{uid}/...` paths enforced by Firebase Storage security rules.
