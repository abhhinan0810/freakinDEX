import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const LOCAL_STORAGE_USER_KEY = 'freakindex_auth_user';

// Mock user for local preview mode when Firebase isn't hooked up yet
const DEFAULT_DEMO_USER = {
  uid: 'demo_admin_uid_777',
  email: 'admin@freakindex.com',
  displayName: 'DEX Master',
  role: 'admin',
  isDemo: true
};

export const authService = {
  /**
   * Sign in using Firebase or local demo fallback
   */
  async login(email, password) {
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ensure user record in Firestore 'users' collection exists
      try {
        if (db) {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (err) {
        console.warn('Could not ensure user record in Firestore:', err);
      }

      return user;
    } else {
      // Local fallback mode
      // Accept demo login or any valid email/password in preview mode
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const mockUser = {
        ...DEFAULT_DEMO_USER,
        email: email,
        displayName: email.split('@')[0]
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    }
  },

  /**
   * Log out
   */
  async logout() {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    if (!email) {
      throw new Error('Please provide an email address.');
    }
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Demo preview mode notification
      await new Promise(r => setTimeout(r, 600));
      return true;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Fetch role from Firestore if exists
          let role = 'admin';
          try {
            if (db) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                role = userDoc.data().role || 'admin';
              }
            }
          } catch (e) {
            console.warn('Error reading user role:', e);
          }
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role,
            isDemo: false
          });
        } else {
          callback(null);
        }
      });
    } else {
      // Local demo mode listener
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) {
        try {
          callback(JSON.parse(stored));
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
      // Return unsubscription dummy
      return () => {};
    }
  }
};
