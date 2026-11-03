import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const LOCAL_CLIENTS_KEY = 'freakindex_clients_store';

// Default starter mock clients for preview / demonstration mode
const INITIAL_DEMO_CLIENTS = [
  {
    clientId: 'client_1',
    name: 'Sasha V.',
    age: 23,
    place: 'Downtown Loft',
    avatarId: 'fire',
    averageRating: 4.8,
    totalReviews: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdBy: 'demo_admin_uid_777'
  },
  {
    clientId: 'client_2',
    name: 'Elena Rostova',
    age: 26,
    place: 'Midtown Rooftop',
    avatarId: 'cherries',
    averageRating: 4.5,
    totalReviews: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdBy: 'demo_admin_uid_777'
  },
  {
    clientId: 'client_3',
    name: 'Chloe Monet',
    age: 21,
    place: 'Westside Penthouse',
    avatarId: 'lips',
    averageRating: 5.0,
    totalReviews: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    createdBy: 'demo_admin_uid_777'
  }
];

function getLocalClients() {
  const data = localStorage.getItem(LOCAL_CLIENTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(INITIAL_DEMO_CLIENTS));
    return INITIAL_DEMO_CLIENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_CLIENTS;
  }
}

function saveLocalClients(clients) {
  localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
}

export const clientService = {
  /**
   * Get all clients created by current user
   */
  async getClients(userId) {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'clients'),
        where('createdBy', '==', userId)
      );
      const snapshot = await getDocs(q);
      const clients = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      return clients.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } else {
      return getLocalClients();
    }
  },

  /**
   * Get single client by ID
   */
  async getClientById(clientId) {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'clients', clientId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } else {
      const clients = getLocalClients();
      return clients.find(c => c.clientId === clientId) || null;
    }
  },

  /**
   * Create a new client
   */
  async createClient(clientData, userId) {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newClient = {
      clientId,
      name: clientData.name.trim(),
      age: Number(clientData.age),
      place: clientData.place ? clientData.place.trim() : '',
      avatarId: clientData.avatarId || 'fire',
      averageRating: clientData.initialRating ? Number(clientData.initialRating) : 0,
      totalReviews: clientData.initialRating ? 1 : 0,
      createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      createdBy: userId,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'clients', clientId);
      await setDoc(docRef, newClient);
      return { id: clientId, ...newClient };
    } else {
      const clients = getLocalClients();
      const clientWithLocalTime = {
        ...newClient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clients.unshift(clientWithLocalTime);
      saveLocalClients(clients);
      return clientWithLocalTime;
    }
  },

  /**
   * Update client details
   */
  async updateClient(clientId, updates) {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'clients', clientId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { clientId, ...updates };
    } else {
      const clients = getLocalClients();
      const index = clients.findIndex(c => c.clientId === clientId);
      if (index !== -1) {
        clients[index] = {
          ...clients[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        saveLocalClients(clients);
        return clients[index];
      }
      return null;
    }
  },

  /**
   * Delete client and cascade delete related reviews
   */
  async deleteClient(clientId, userId) {
    if (isFirebaseConfigured && db) {
      // 1. Delete associated reviews
      const reviewsQ = query(collection(db, 'reviews'), where('clientId', '==', clientId));
      const reviewsSnap = await getDocs(reviewsQ);
      for (const reviewDoc of reviewsSnap.docs) {
        await deleteDoc(reviewDoc.ref);
      }

      // 2. Delete client document
      const clientRef = doc(db, 'clients', clientId);
      await deleteDoc(clientRef);
      return true;
    } else {
      // Local fallback mode cascade deletion
      let clients = getLocalClients();
      clients = clients.filter(c => c.clientId !== clientId);
      saveLocalClients(clients);

      // Clean local reviews
      const reviewsKey = 'freakindex_reviews_store';
      const storedReviews = localStorage.getItem(reviewsKey);
      if (storedReviews) {
        try {
          const revs = JSON.parse(storedReviews).filter(r => r.clientId !== clientId);
          localStorage.setItem(reviewsKey, JSON.stringify(revs));
        } catch (e) {
          console.warn('Error cleaning local reviews:', e);
        }
      }
      return true;
    }
  },

  /**
   * Concurrency-safe recalculation of client's average rating and total reviews
   */
  async recalculateClientRating(clientId) {
    if (isFirebaseConfigured && db) {
      const reviewsQ = query(collection(db, 'reviews'), where('clientId', '==', clientId));
      const reviewsSnap = await getDocs(reviewsQ);

      const ratings = reviewsSnap.docs
        .map(d => Number(d.data().rating))
        .filter(r => !isNaN(r) && r >= 1 && r <= 5);

      const totalReviews = ratings.length;
      let averageRating = 0;
      if (totalReviews > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr, 0);
        averageRating = Math.round((sum / totalReviews) * 10) / 10;
      }

      const clientRef = doc(db, 'clients', clientId);
      await runTransaction(db, async (transaction) => {
        const clientDoc = await transaction.get(clientRef);
        if (!clientDoc.exists()) {
          throw new Error('Client does not exist!');
        }
        transaction.update(clientRef, {
          averageRating,
          totalReviews,
          updatedAt: serverTimestamp()
        });
      });

      return { averageRating, totalReviews };
    } else {
      const reviewsKey = 'freakindex_reviews_store';
      const storedReviews = localStorage.getItem(reviewsKey);
      let reviews = [];
      if (storedReviews) {
        try {
          reviews = JSON.parse(storedReviews).filter(r => r.clientId === clientId);
        } catch (e) {
          console.warn(e);
        }
      }
      const ratings = reviews.map(r => Number(r.rating)).filter(r => !isNaN(r) && r >= 1);
      const totalReviews = ratings.length;
      let averageRating = 0;
      if (totalReviews > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        averageRating = Math.round((sum / totalReviews) * 10) / 10;
      }

      const clients = getLocalClients();
      const c = clients.find(cl => cl.clientId === clientId);
      if (c) {
        c.averageRating = averageRating;
        c.totalReviews = totalReviews;
        c.updatedAt = new Date().toISOString();
        saveLocalClients(clients);
      }
      return { averageRating, totalReviews };
    }
  }
};
