import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { clientService } from './clientService';

const LOCAL_REVIEWS_KEY = 'freakindex_reviews_store';

const INITIAL_DEMO_REVIEWS = [
  {
    reviewId: 'rev_1_1',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Incredible energy and chemistry. Absolutely legendary session!',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_1_2',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Round two was even better. 10/10 would repeat!',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_1_3',
    clientId: 'client_1',
    rating: 4,
    reviewText: 'Late arrival but totally made up for it.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_1_4',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Sensational as always! Smashed again effortlessly.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_2_1',
    clientId: 'client_2',
    rating: 4,
    reviewText: 'Great vibes, elegant ambiance and top notch conversation.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_2_2',
    clientId: 'client_2',
    rating: 5,
    reviewText: 'Another unforgettable night. Unmatched aura.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdBy: 'demo_admin_uid_777',
  },
  {
    reviewId: 'rev_3_1',
    clientId: 'client_3',
    rating: 5,
    reviewText: 'Absolute perfection. A true masterclass.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    createdBy: 'demo_admin_uid_777',
  }
];

function getLocalReviews() {
  const data = localStorage.getItem(LOCAL_REVIEWS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(INITIAL_DEMO_REVIEWS));
    return INITIAL_DEMO_REVIEWS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_REVIEWS;
  }
}

function saveLocalReviews(reviews) {
  localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
}

export const reviewService = {
  /**
   * Get all reviews for a specific client, sorted newest first
   */
  async getReviewsForClient(clientId) {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'reviews'),
        where('clientId', '==', clientId)
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      return reviews.sort((a, b) => {
        const dateA = new Date(a.reviewDate || a.createdAt?.toDate?.() || a.createdAt || 0).getTime();
        const dateB = new Date(b.reviewDate || b.createdAt?.toDate?.() || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else {
      const reviews = getLocalReviews().filter(r => r.clientId === clientId);
      return reviews.sort((a, b) => {
        const dateA = new Date(a.reviewDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.reviewDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }
  },

  /**
   * Create a new review
   */
  async createReview({ clientId, rating, reviewText, reviewDate }, userId) {
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveDate = reviewDate || new Date().toISOString().split('T')[0];

    const reviewDocData = {
      reviewId,
      clientId,
      rating: Number(rating),
      reviewText: reviewText ? reviewText.trim() : '',
      reviewDate: effectiveDate,
      createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      createdBy: userId,
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'reviews', reviewId), reviewDocData);
      await clientService.recalculateClientRating(clientId);
      return reviewDocData;
    } else {
      const reviews = getLocalReviews();
      const localReview = {
        ...reviewDocData,
        createdAt: new Date().toISOString(),
      };
      reviews.unshift(localReview);
      saveLocalReviews(reviews);

      await clientService.recalculateClientRating(clientId);
      return localReview;
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId, clientId) {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'reviews', reviewId));
      await clientService.recalculateClientRating(clientId);
      return true;
    } else {
      let reviews = getLocalReviews();
      reviews = reviews.filter(r => r.reviewId !== reviewId);
      saveLocalReviews(reviews);

      await clientService.recalculateClientRating(clientId);
      return true;
    }
  }
};
