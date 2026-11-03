import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clientService } from '../services/clientService';
import { reviewService } from '../services/reviewService';
import { DEFAULT_AVATARS } from '../utils/avatars';
import { validateClientForm } from '../utils/validation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
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

  // Initial Review (Optional)
  const [initialRating, setInitialRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
      // 2. Create client record
      const clientDoc = await clientService.createClient(
        {
          name,
          age,
          place,
          avatarId,
          initialRating: initialRating > 0 ? initialRating : 0,
        },
        currentUser.uid
      );

      createdClientId = clientDoc.clientId || clientDoc.id;

      // 3. If initial rating/review provided, create review
      if (initialRating > 0 || reviewText.trim()) {
        await reviewService.createReview(
          {
            clientId: createdClientId,
            rating: initialRating > 0 ? initialRating : 5,
            reviewText,
            reviewDate,
          },
          currentUser.uid
        );
      }

      // 4. Confetti & redirect
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

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5">
                Select Client Avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatarId(av.id)}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      avatarId === av.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 scale-105'
                        : 'border-[#2A2A35] bg-[#20202A] hover:border-[#3a3a4a]'
                    }`}
                  >
                    <span className="text-3xl">{av.emoji}</span>
                    <span className="text-[11px] text-[#92929E] mt-1 font-medium">{av.label}</span>
                    {avatarId === av.id && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
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
              <label className="block text-xs font-semibold text-[#92929E] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Encounter Date</span>
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
