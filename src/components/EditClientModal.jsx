import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { validateClientForm, validateMediaFile } from '../utils/validation';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

export default function EditClientModal({ isOpen, client, onClose, onSave }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(client?.name || '');
  const [age, setAge] = useState(client?.age || '');
  const [place, setPlace] = useState(client?.place || '');
  const [avatarId, setAvatarId] = useState(client?.avatarId || 'fire');
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(client?.profileImageUrl || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !client) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, profileFile: validation.error }));
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, profileFile: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateClientForm({ name, age, place });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      let profileImageUrl = client.profileImageUrl;
      let profileImagePath = client.profileImagePath;

      if (profileFile && currentUser) {
        const uploadRes = await storageService.uploadProfilePicture(
          currentUser.uid,
          client.clientId,
          profileFile
        );
        if (uploadRes) {
          profileImageUrl = uploadRes.downloadUrl;
          profileImagePath = uploadRes.storagePath;
        }
      }

      await onSave({
        name: name.trim(),
        age: Number(age),
        place: place.trim(),
        avatarId,
        profileImageUrl,
        profileImagePath,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to update client' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#17171F] border border-[#2A2A35] rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A35]">
          <h2 className="text-lg font-bold text-white">Edit Client Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#92929E] hover:text-white hover:bg-[#20202A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {errors.submit && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {errors.submit}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
              Client Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0B0F] border border-[#2A2A35] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. Vanessa V."
            />
            {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Age & Place Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Age (18+) *
              </label>
              <input
                type="number"
                min="18"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. 24"
              />
              {errors.age && <p className="text-rose-400 text-xs mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. Downtown"
              />
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
              Update Profile Picture
            </label>
            <div className="flex items-center gap-3">
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover border border-purple-500/40"
                />
              )}
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#20202A] border border-[#2A2A35] hover:border-purple-500/40 text-xs font-semibold text-gray-200 transition-colors">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {errors.profileFile && (
              <p className="text-rose-400 text-xs mt-1">{errors.profileFile}</p>
            )}
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
              Or Choose Default Avatar
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setAvatarId(av.id)}
                  className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    avatarId === av.id
                      ? 'border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20'
                      : 'border-[#2A2A35] bg-[#20202A] hover:border-[#3a3a4a]'
                  }`}
                >
                  <span className="text-xl">{av.emoji}</span>
                  {avatarId === av.id && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#2A2A35] bg-[#20202A] hover:bg-[#282836] text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
