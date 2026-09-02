import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { safetyApi } from '../api/safetyApi';

const REPORT_OPTIONS = [
  { value: 'unsafe_behavior', label: 'Unsafe behaviour' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'fraud', label: 'Fraud or suspicious activity' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'no_show', label: 'No-show or missed appointment' },
  { value: 'other', label: 'Other' },
];

function SafetyReportModal({ reportedUserId, reportedUserName, listingId, onClose, onComplete }) {
  const [category, setCategory] = useState('unsafe_behavior');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (description.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await safetyApi.submitReport({
        reportedUserId,
        listingId: listingId || null,
        category,
        description: description.trim(),
      });
      onComplete?.('Report submitted successfully. Our team will review it.');
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="report-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">Report {reportedUserName}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell us what happened. Please do not include passwords or sensitive identity numbers.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="Close report dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Reason</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {REPORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Details</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={5} placeholder="Explain the issue clearly..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <span className="mt-1 block text-right text-xs text-slate-400">{description.length}/2000</span>
          </label>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SafetyReportModal;
