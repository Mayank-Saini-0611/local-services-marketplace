import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Star } from 'lucide-react';
import { adminApi } from '../api/adminApi';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await adminApi.getReviews(status));
    } catch (error) {
      console.error('Failed to load reviews:', error);
      showToast('Failed to load reviews.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, status]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void fetchReviews();
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [fetchReviews]);

  const moderate = async (review, nextStatus) => {
    setProcessingId(review.id);
    try {
      await adminApi.moderateReview(review.id, nextStatus);
      showToast(`Review ${nextStatus === 'published' ? 'published' : 'hidden'}.`);
      await fetchReviews();
    } catch (error) {
      console.error('Review moderation failed:', error);
      showToast(error.response?.data?.message || 'Unable to update review.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-20 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl ${toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`} role="status">
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Review moderation</h1>
        <p className="mt-1 text-slate-500">Keep public reviews helpful, authentic, and safe.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'published', 'hidden'].map((filter) => (
          <button key={filter} type="button" onClick={() => setStatus(filter)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${status === filter ? 'bg-orange-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No reviews found for this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <article key={review.id} className="p-5 lg:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${review.moderationStatus === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{review.moderationStatus}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{review.comment || 'No written comment.'}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {review.customerName} reviewed <strong>{review.listingTitle}</strong> for {review.providerName} on {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    {review.moderationNote && <p className="mt-2 text-xs text-amber-700">Moderator note: {review.moderationNote}</p>}
                  </div>
                  <div className="flex flex-shrink-0 items-start gap-2">
                    {review.moderationStatus === 'published' ? (
                      <button type="button" onClick={() => moderate(review, 'hidden')} disabled={processingId === review.id} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                        {processingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />} Hide
                      </button>
                    ) : (
                      <button type="button" onClick={() => moderate(review, 'published')} disabled={processingId === review.id} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                        {processingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Publish
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReviews;
