import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ConfirmDialog from '../components/ConfirmDialog';
import EditClientModal from '../components/EditClientModal';
import { LoadingSpinner } from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clientService } from '../services/clientService';
import { reviewService } from '../services/reviewService';
import { getAvatarById } from '../utils/avatars';
import {
  ArrowLeft,
  Flame,
  Edit3,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus
} from 'lucide-react';

export default function ClientProfile() {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [client, setClient] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reviews expansion state (Show initial 2, then SHOW PAST REVIEWS)
  const [expandedReviews, setExpandedReviews] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadClientData = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const clientData = await clientService.getClientById(clientId);
      if (!clientData) {
        error('Client not found.');
        navigate('/');
        return;
      }
      setClient(clientData);

      const clientReviews = await reviewService.getReviewsForClient(clientId);
      setReviews(clientReviews);
    } catch (err) {
      console.error(err);
      error('Failed to load client profile.');
    } finally {
      setLoading(false);
    }
  }, [clientId, navigate, error]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Handle Edit Save
  const handleSaveEdit = async (updates) => {
    try {
      await clientService.updateClient(clientId, updates);
      setClient(prev => ({ ...prev, ...updates }));
      success('Client profile updated!');
    } catch (err) {
      error('Failed to update: ' + err.message);
    }
  };

  // Handle Delete Client
  const handleDeleteClient = async () => {
    try {
      setActionLoading(true);
      await clientService.deleteClient(clientId, currentUser?.uid);
      success(`${client.name} has been removed.`);
      navigate('/');
    } catch (err) {
      error('Delete failed: ' + err.message);
    } finally {
      setActionLoading(false);
      setIsDeleteClientOpen(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    try {
      setActionLoading(true);
      await reviewService.deleteReview(deleteReviewId, clientId);
      success('Review deleted.');
      setDeleteReviewId(null);
      await loadClientData();
    } catch (err) {
      error('Failed to delete review: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <LoadingSpinner size="lg" text="Loading client vault..." />
        </div>
      </div>
    );
  }

  if (!client) return null;

  const avatarInfo = getAvatarById(client.avatarId);
  const ratingValue = client.averageRating || 0;
  const totalReviews = reviews.length;
  const visibleReviews = expandedReviews ? reviews : reviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0B0B0F] pb-24 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 text-xs font-semibold text-[#92929E] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/50 text-[#92929E] hover:text-purple-300 transition-colors"
              title="Edit Client"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleteClientOpen(true)}
              className="p-2 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-rose-500/50 text-[#92929E] hover:text-rose-400 transition-colors"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROFILE HEADER CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#17171F] to-[#121218] border border-[#2A2A35] p-6 text-center shadow-2xl">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Large Avatar */}
          <div className="relative inline-block mx-auto mb-4">
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-6xl border-4 border-purple-500/40 shadow-xl shadow-purple-500/20`}
            >
              <span>{avatarInfo.emoji}</span>
            </div>
          </div>

          {/* Name & Age */}
          <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>{client.name}</span>
            {client.age && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#20202A] text-purple-300 border border-[#2A2A35]">
                {client.age}
              </span>
            )}
          </h1>

          {/* Place */}
          {client.place && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#92929E] mt-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              <span>{client.place}</span>
            </p>
          )}

          {/* Average Rating & Total Reviews */}
          <div className="mt-4 pt-4 border-t border-[#2A2A35]/60 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <StarRating rating={ratingValue} size="sm" />
                <span className="text-base font-black text-white">
                  {ratingValue ? ratingValue.toFixed(1) : '0.0'}
                  <span className="text-xs text-[#92929E] font-normal">/5</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#92929E] mt-0.5">
                Average Rating
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#2A2A35]" />

            <div className="flex flex-col items-center">
              <span className="text-base font-black text-white">{totalReviews}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#92929E] mt-0.5">
                Total Reviews
              </span>
            </div>
          </div>

          {/* SMASHED AGAIN PRIMARY ACTION BUTTON */}
          <button
            onClick={() => navigate(`/client/${client.clientId}/review`)}
            className="w-full mt-5 py-3.5 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-current text-amber-300" />
            <span>Smashed Again (Log New Review)</span>
          </button>
        </section>

        {/* REVIEWS SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#92929E] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Review History ({reviews.length})</span>
            </h2>

            <button
              onClick={() => navigate(`/client/${client.clientId}/review`)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Review</span>
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-[#17171F] border border-[#2A2A35] rounded-2xl p-6 text-center text-xs text-[#92929E]">
              No reviews logged for this mf yet. Click &quot;Smashed Again&quot; to log your first review.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleReviews.map((rev) => (
                <ReviewCard
                  key={rev.reviewId || rev.id}
                  review={rev}
                  onDelete={(id) => setDeleteReviewId(id)}
                />
              ))}

              {/* SHOW PAST REVIEWS / COLLAPSE BUTTON */}
              {reviews.length > 2 && (
                <button
                  onClick={() => setExpandedReviews(!expandedReviews)}
                  className="w-full py-2.5 rounded-xl bg-[#17171F] border border-[#2A2A35] hover:border-purple-500/40 text-xs font-bold text-purple-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  {expandedReviews ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>COLLAPSE OLDER REVIEWS</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>SHOW PAST REVIEWS ({reviews.length - 2} MORE)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        client={client}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Confirm Delete Client Dialog */}
      <ConfirmDialog
        isOpen={isDeleteClientOpen}
        title={`Delete ${client.name}?`}
        message="This will permanently delete this client profile along with all associated reviews from your vault."
        confirmText="Yes, Delete Client"
        cancelText="Keep Client"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteClient}
        onCancel={() => setIsDeleteClientOpen(false)}
      />

      {/* Confirm Delete Review Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteReviewId)}
        title="Delete this review?"
        message="This review record will be deleted and the client's average rating will be automatically recalculated."
        confirmText="Delete Review"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
      />
    </div>
  );
}
