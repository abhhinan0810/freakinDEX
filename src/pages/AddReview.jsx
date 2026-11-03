import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { LoadingSpinner } from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clientService } from '../services/clientService';
import { reviewService } from '../services/reviewService';
import { getAvatarById } from '../utils/avatars';
import { validateReviewForm, validateMediaFile } from '../utils/validation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Calendar,
  Upload,
  Film,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AddReview() {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [rating, setRating] = useState(5);
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewText, setReviewText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // [{ file, preview, isVideo }]

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchClient() {
      if (!clientId) return;
      try {
        setLoading(true);
        const data = await clientService.getClientById(clientId);
        if (!data) {
          error('Client not found.');
          navigate('/');
          return;
        }
        setClient(data);
      } catch (err) {
        console.error(err);
        error('Failed to load client details.');
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [clientId, navigate, error]);

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

    const validation = validateReviewForm({ rating, reviewText });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview(
        {
          clientId,
          rating,
          reviewText,
          reviewDate: reviewDate || new Date().toISOString().split('T')[0],
          mediaFiles,
        },
        currentUser?.uid
      );

      // Celebration effect
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#EC4899', '#A855F7', '#FFC857']
        });
      } catch {
        // Safe fallback
      }

      success(`Smashed Again logged for ${client?.name || 'client'}!`);
      navigate(`/client/${clientId}`);
    } catch (err) {
      console.error(err);
      setErrors({ form: err.message || 'Failed to submit review' });
      error('Failed to save review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <LoadingSpinner size="lg" text="Loading client..." />
        </div>
      </div>
    );
  }

  if (!client) return null;

  const avatarInfo = getAvatarById(client.avatarId);

  return (
    <div className="min-h-screen bg-[#0B0B0F] pb-24 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/client/${clientId}`)}
            className="p-2 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 text-[#92929E] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-pink-500 fill-current" />
              <span>Smashed Again</span>
            </h1>
            <p className="text-xs text-[#92929E]">Log a new interaction session &amp; rating</p>
          </div>
        </div>

        {/* CLIENT SUMMARY HEADER */}
        <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-4 flex items-center gap-4 shadow-xl">
          <div className="shrink-0">
            {client.profileImageUrl ? (
              <img
                src={client.profileImageUrl}
                alt={client.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50 shadow-md"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-2xl border-2 border-purple-500/50`}
              >
                <span>{avatarInfo.emoji}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{client.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#92929E]">
              {client.age && <span>{client.age} y/o</span>}
              {client.age && client.place && <span>&bull;</span>}
              {client.place && <span className="truncate">{client.place}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-semibold text-purple-300">
                Current Avg: {client.averageRating ? client.averageRating.toFixed(1) : 'New'}/5
              </span>
              <span className="text-[11px] text-[#92929E]">({client.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        {errors.form && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* REVIEW FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-5 space-y-5 shadow-xl">
            {/* 1. FIVE-STAR RATING SELECTOR */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">
                1. Rate The Session (1 - 5 Stars) *
              </label>
              <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                <StarRating
                  rating={rating}
                  interactive={true}
                  onChange={(val) => setRating(val)}
                  size="xl"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{rating}</span>
                  <span className="text-sm font-semibold text-[#92929E]">out of 5 Stars</span>
                </div>
              </div>
              {errors.rating && <p className="text-rose-400 text-xs mt-1">{errors.rating}</p>}
            </div>

            {/* 2. DATE PICKER */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#92929E] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Session Date</span>
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 rounded-xl px-3.5 py-3 text-sm text-white outline-none"
              />
              <p className="text-[10px] text-[#92929E] mt-1">
                Leave as today or pick the exact date of interaction.
              </p>
            </div>

            {/* 3. REVIEW TEXT */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#92929E] mb-1.5">
                3. Session Notes &amp; Feedback (Optional)
              </label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was the chemistry, mood, performance, or memorable highlights? Write your notes here..."
                className="w-full bg-[#0B0B0F] border border-[#2A2A35] focus:border-purple-500 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 outline-none resize-none"
              />
            </div>

            {/* 4 & 5. PHOTO & VIDEO UPLOADS */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#92929E] mb-1.5">
                4. Upload Photos &amp; Videos (Optional)
              </label>
              <label className="cursor-pointer border-2 border-dashed border-[#2A2A35] hover:border-pink-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 bg-[#0B0B0F] transition-colors">
                <Upload className="w-6 h-6 text-pink-400" />
                <span className="text-xs font-bold text-gray-200">
                  Select Photos or Videos
                </span>
                <span className="text-[10px] text-[#92929E]">
                  JPG, PNG, WEBP, MP4, MOV (Secured in private vault)
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

              {/* Thumbnails of selected media */}
              {mediaFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2.5">
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

          {/* 6. SUBMIT REVIEW BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Recording Session &amp; Updating Rating...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 fill-current text-amber-300" />
                <span>SUBMIT REVIEW</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
