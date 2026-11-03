import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clientService } from '../services/clientService';
import { reviewService } from '../services/reviewService';
import { storageService } from '../services/storageService';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { validateClientForm, validateMediaFile } from '../utils/validation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Upload,
  Camera,
  Film,
  X,
  Check,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AddClient() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  // Basic Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [place, setPlace] = useState('');
  const [avatarId, setAvatarId] = useState('fire');

  // Profile Picture File
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Initial Review (Optional)
  const [initialRating, setInitialRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);

  // Media files (photos/videos) for initial review
  const [mediaFiles, setMediaFiles] = useState([]); // [{ file, preview, isVideo }]

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, profile: validation.error }));
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, profile: null }));
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newMedia = [];
    let err = null;

    for (const f of files) {
      const v = validateMediaFile(f);
      if (!v.isValid) {
        err = v.error;
        break;
      }
      newMedia.push({
        file: f,
        preview: URL.createObjectURL(f),
        isVideo: v.fileType === 'video'
      });
    }

    if (err) {
      setErrors(prev => ({ ...prev, media: err }));
    } else {
      setMediaFiles(prev => [...prev, ...newMedia]);
      setErrors(prev => ({ ...prev, media: null }));
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 1. Validation
    const validation = validateClientForm({ name, age, place });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    let createdClientId = null;

    try {
      // 2. Upload profile picture if provided
      let profileImageUrl = null;
      let profileImagePath = null;

      // Temporary ID for path structuring
      const tempClientId = `client_${Date.now()}`;

      if (profileFile && currentUser) {
        const uploadRes = await storageService.uploadProfilePicture(
          currentUser.uid,
          tempClientId,
          profileFile
        );
        if (uploadRes) {
          profileImageUrl = uploadRes.downloadUrl;
          profileImagePath = uploadRes.storagePath;
        }
      }

      // 3. Create client record
      const clientDoc = await clientService.createClient(
        {
          name,
          age,
          place,
          avatarId,
          profileImageUrl,
          profileImagePath,
          initialRating: initialRating > 0 ? initialRating : 0,
        },
        currentUser.uid
      );

      createdClientId = clientDoc.clientId || clientDoc.id;

      // 4. If initial rating/review or media provided, create review
      if (initialRating > 0 || reviewText.trim() || mediaFiles.length > 0) {
        await reviewService.createReview(
          {
            clientId: createdClientId,
            rating: initialRating > 0 ? initialRating : 5,
            reviewText,
            reviewDate,
            mediaFiles,
          },
          currentUser.uid
        );
      }

      // 5. Celebration & redirect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#A855F7', '#EC4899', '#FFC857']
        });
      } catch {
        // Confetti fallback safe
      }

      success(`Successfully registered ${name} to your freakinDEX!`);
      navigate('/');
    } catch (err) {
      console.error('Submission failed:', err);
      // Clean up in case of catastrophic failure
      if (createdClientId) {
        try {
          await clientService.deleteClient(createdClientId, currentUser?.uid);
        } catch (cleanupErr) {
          console.warn('Failed to cleanup partial client:', cleanupErr);
        }
      }
      setErrors({ form: err.message || 'Failed to create client. Please try again.' });
      error('Error registering client: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] pb-24 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 text-[#92929E] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Add New Client</h1>
            <p className="text-xs text-[#92929E]">Register a profile in your private registry</p>
          </div>
        </div>

        {errors.form && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: PRIMARY PROFILE INFORMATION */}
          <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              1. Profile Information
            </h2>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vanessa Monroe"
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Age & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                  Age (18+) *
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 23"
                  className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none"
                />
                {errors.age && <p className="text-rose-400 text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                  Location / Place
                </label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. Downtown Penthouse"
                  className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-3">
                {profilePreview ? (
                  <div className="relative">
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileFile(null);
                        setProfilePreview(null);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}

                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#20202A] border border-[#2A2A35] hover:border-purple-500/50 text-xs font-semibold text-gray-200 transition-colors">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>{profilePreview ? 'Change Photo' : 'Upload Profile Picture'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.profile && (
                <p className="text-rose-400 text-xs mt-1">{errors.profile}</p>
              )}
            </div>

            {/* Default Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Or Select Default Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatarId(av.id)}
                    className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      avatarId === av.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20'
                        : 'border-[#2A2A35] bg-[#20202A] hover:border-[#3a3a4a]'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[10px] text-[#92929E] mt-0.5">{av.label}</span>
                    {avatarId === av.id && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: INITIAL REVIEW / FIRST ENCOUNTER (OPTIONAL) */}
          <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                2. Initial Rating &amp; Review (Optional)
              </h2>
              <span className="text-[10px] text-[#92929E]">Can log later</span>
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Initial Rating
              </label>
              <div className="flex items-center gap-3 bg-[#0B0B0F] border border-[#2A2A35] rounded-xl p-3">
                <StarRating
                  rating={initialRating}
                  interactive={true}
                  onChange={(val) => setInitialRating(val)}
                  size="lg"
                />
                <span className="text-xs font-bold text-white ml-2">
                  {initialRating > 0 ? `${initialRating} Stars` : 'Tap to rate'}
                </span>
                {initialRating > 0 && (
                  <button
                    type="button"
                    onClick={() => setInitialRating(0)}
                    className="text-[11px] text-[#92929E] hover:text-white ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Review Date */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Encounter Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Session Notes / Review
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Log details, chemistry, memorable moments..."
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none resize-none"
              />
            </div>

            {/* Photos & Videos Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Attach Private Photos &amp; Videos
              </label>
              <label className="cursor-pointer border-2 border-dashed border-[#2A2A35] hover:border-purple-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 bg-[#0B0B0F] transition-colors">
                <Upload className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-semibold text-gray-200">
                  Select Photos or Videos
                </span>
                <span className="text-[10px] text-[#92929E]">
                  JPG, PNG, WEBP, MP4, MOV (Max 15MB img / 100MB vid)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
              {errors.media && (
                <p className="text-rose-400 text-xs mt-1">{errors.media}</p>
              )}

              {/* Selected Media Previews */}
              {mediaFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {mediaFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-[#20202A] border border-[#2A2A35]"
                    >
                      {item.isVideo ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/60">
                          <Film className="w-5 h-5 text-pink-400" />
                        </div>
                      ) : (
                        <img
                          src={item.preview}
                          alt="upload thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-600/30 hover:shadow-pink-600/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Creating Client Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>SUBMIT &amp; SAVE CLIENT</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
