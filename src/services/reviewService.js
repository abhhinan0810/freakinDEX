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
import { storageService } from './storageService';

const LOCAL_REVIEWS_KEY = 'freakindex_reviews_store';
const LOCAL_MEDIA_KEY = 'freakindex_media_store';

const INITIAL_DEMO_REVIEWS = [
  {
    reviewId: 'rev_1_1',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Incredible energy and chemistry. Absolutely legendary session!',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: [
      {
        mediaId: 'med_1',
        clientId: 'client_1',
        reviewId: 'rev_1_1',
        fileName: 'session_vibe.jpg',
        fileType: 'image',
        downloadUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
      }
    ]
  },
  {
    reviewId: 'rev_1_2',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Round two was even better. 10/10 would repeat!',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
  },
  {
    reviewId: 'rev_1_3',
    clientId: 'client_1',
    rating: 4,
    reviewText: 'Late arrival but totally made up for it.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
  },
  {
    reviewId: 'rev_1_4',
    clientId: 'client_1',
    rating: 5,
    reviewText: 'Sensational as always! Smashed again effortlessly.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
  },
  {
    reviewId: 'rev_2_1',
    clientId: 'client_2',
    rating: 4,
    reviewText: 'Great vibes, elegant ambiance and top notch conversation.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
  },
  {
    reviewId: 'rev_2_2',
    clientId: 'client_2',
    rating: 5,
    reviewText: 'Another unforgettable night. Unmatched aura.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
  },
  {
    reviewId: 'rev_3_1',
    clientId: 'client_3',
    rating: 5,
    reviewText: 'Absolute perfection. A true masterclass.',
    reviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    createdBy: 'demo_admin_uid_777',
    media: []
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

function getLocalMedia() {
  const data = localStorage.getItem(LOCAL_MEDIA_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalMedia(media) {
  localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(media));
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

      // Fetch associated media for these reviews
      const mediaQ = query(
        collection(db, 'media'),
        where('clientId', '==', clientId)
      );
      const mediaSnap = await getDocs(mediaQ);
      const allClientMedia = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Attach media to reviews
      const reviewsWithMedia = reviews.map(rev => ({
        ...rev,
        media: allClientMedia.filter(m => m.reviewId === rev.reviewId)
      }));

      // Sort newest to oldest
      return reviewsWithMedia.sort((a, b) => {
        const dateA = new Date(a.reviewDate || a.createdAt?.toDate?.() || a.createdAt || 0).getTime();
        const dateB = new Date(b.reviewDate || b.createdAt?.toDate?.() || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else {
      const reviews = getLocalReviews().filter(r => r.clientId === clientId);
      const localMedia = getLocalMedia().filter(m => m.clientId === clientId);

      const reviewsWithMedia = reviews.map(rev => ({
        ...rev,
        media: rev.media?.length ? rev.media : localMedia.filter(m => m.reviewId === rev.reviewId)
      }));

      return reviewsWithMedia.sort((a, b) => {
        const dateA = new Date(a.reviewDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.reviewDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }
  },

  /**
   * Get all media for a client across all reviews and profile
   */
  async getMediaForClient(clientId) {
    if (isFirebaseConfigured && db) {
      const mediaQ = query(
        collection(db, 'media'),
        where('clientId', '==', clientId)
      );
      const mediaSnap = await getDocs(mediaQ);
      const list = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    } else {
      const reviews = getLocalReviews().filter(r => r.clientId === clientId);
      let mediaList = getLocalMedia().filter(m => m.clientId === clientId);
      
      // Also grab embedded media in reviews
      reviews.forEach(r => {
        if (r.media && Array.isArray(r.media)) {
          r.media.forEach(m => {
            if (!mediaList.some(item => item.mediaId === m.mediaId)) {
              mediaList.push(m);
            }
          });
        }
      });

      return mediaList.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    }
  },

  /**
   * Create a new review and associated media
   */
  async createReview({ clientId, rating, reviewText, reviewDate, mediaFiles = [] }, userId) {
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveDate = reviewDate || new Date().toISOString().split('T')[0];
    const uploadedMediaList = [];

    // 1. Upload media files if any
    for (const item of mediaFiles) {
      const isVideo = item.file.type.startsWith('video/');
      const category = isVideo ? 'videos' : 'photos';
      const uploadResult = await storageService.uploadReviewMedia(
        userId,
        clientId,
        reviewId,
        item.file,
        category
      );

      if (uploadResult) {
        const mediaRecord = {
          mediaId: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          clientId,
          reviewId,
          fileName: uploadResult.fileName,
          fileType: uploadResult.fileType,
          storagePath: uploadResult.storagePath,
          downloadUrl: uploadResult.downloadUrl,
          uploadedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
          uploadedBy: userId,
        };
        uploadedMediaList.push(mediaRecord);
      }
    }

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
      // Save review document
      await setDoc(doc(db, 'reviews', reviewId), reviewDocData);

      // Save each media document in 'media' collection
      for (const mediaDoc of uploadedMediaList) {
        await setDoc(doc(db, 'media', mediaDoc.mediaId), mediaDoc);
      }

      // Concurrency safe recalculation of client's average rating & total reviews
      await clientService.recalculateClientRating(clientId);

      return {
        ...reviewDocData,
        media: uploadedMediaList
      };
    } else {
      // Local fallback
      const reviews = getLocalReviews();
      const localReview = {
        ...reviewDocData,
        createdAt: new Date().toISOString(),
        media: uploadedMediaList
      };
      reviews.unshift(localReview);
      saveLocalReviews(reviews);

      if (uploadedMediaList.length > 0) {
        const existingMedia = getLocalMedia();
        saveLocalMedia([...uploadedMediaList, ...existingMedia]);
      }

      // Recalculate local client aggregate
      await clientService.recalculateClientRating(clientId);

      return localReview;
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId, clientId) {
    if (isFirebaseConfigured && db) {
      // Find media to delete from storage
      const mediaQ = query(collection(db, 'media'), where('reviewId', '==', reviewId));
      const mediaSnap = await getDocs(mediaQ);
      for (const mDoc of mediaSnap.docs) {
        const data = mDoc.data();
        if (data.storagePath) {
          await storageService.deleteFile(data.storagePath);
        }
        await deleteDoc(mDoc.ref);
      }

      await deleteDoc(doc(db, 'reviews', reviewId));
      await clientService.recalculateClientRating(clientId);
      return true;
    } else {
      let reviews = getLocalReviews();
      reviews = reviews.filter(r => r.reviewId !== reviewId);
      saveLocalReviews(reviews);

      let mediaList = getLocalMedia();
      mediaList = mediaList.filter(m => m.reviewId !== reviewId);
      saveLocalMedia(mediaList);

      await clientService.recalculateClientRating(clientId);
      return true;
    }
  }
};
