import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

/**
 * Storage Service for handling private client media files
 */
export const storageService = {
  /**
   * Upload client profile picture
   * Path: private/users/{uid}/clients/{clientId}/profile/{fileName}
   */
  async uploadProfilePicture(userId, clientId, file) {
    if (!file) return null;

    const extension = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `profile_${Date.now()}.${extension}`;
    const storagePath = `private/users/${userId}/clients/${clientId}/profile/${cleanFileName}`;

    if (isFirebaseConfigured && storage) {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          clientId: clientId,
          category: 'profile',
        }
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        storagePath,
        downloadUrl,
        fileName: file.name,
        fileType: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size
      };
    } else {
      // Local fallback mode: convert to Object URL / Base64 Data URL
      const dataUrl = await this.fileToDataUrl(file);
      return {
        storagePath,
        downloadUrl: dataUrl,
        fileName: file.name,
        fileType: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size
      };
    }
  },

  /**
   * Upload review media (photos and videos)
   * Path: private/users/{uid}/clients/{clientId}/reviews/{reviewId}/{category}/{fileName}
   */
  async uploadReviewMedia(userId, clientId, reviewId, file, category = 'photos') {
    if (!file) return null;

    const extension = file.name.split('.').pop() || 'media';
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const storagePath = `private/users/${userId}/clients/${clientId}/reviews/${reviewId}/${category}/${cleanFileName}`;
    const isVideo = file.type.startsWith('video/');

    if (isFirebaseConfigured && storage) {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          clientId: clientId,
          reviewId: reviewId,
          category: isVideo ? 'videos' : 'photos',
        }
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        storagePath,
        downloadUrl,
        fileName: file.name,
        fileType: isVideo ? 'video' : 'image',
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
    } else {
      // Local demo preview fallback
      const dataUrl = await this.fileToDataUrl(file);
      return {
        storagePath,
        downloadUrl: dataUrl,
        fileName: file.name,
        fileType: isVideo ? 'video' : 'image',
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Delete file from storage
   */
  async deleteFile(storagePath) {
    if (!storagePath) return;

    if (isFirebaseConfigured && storage) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Failed to delete file from Firebase Storage:', err);
      }
    }
  },

  /**
   * Helper to convert File to Data URL for preview & local storage
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
