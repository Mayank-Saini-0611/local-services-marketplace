import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Flag, Loader2 } from 'lucide-react';
import { adminApi } from '../api/adminApi';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      setReports(await adminApi.getReports(status));
    } catch (error) {
      console.error('Failed to load reports:', error);
      showToast('Failed to load reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, status]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [fetchReports]);

  const updateStatus = async (report, nextStatus) => {
    setProcessingId(report.id);
    try {
      await adminApi.updateReportStatus(report.id, nextStatus);
      showToast(`Report ${nextStatus.replace('_', ' ')}.`);
      await fetchReports();
    } catch (error) {
      console.error('Report update failed:', error);
      showToast(error.response?.data?.message || 'Unable to update report.', 'error');
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
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Safety reports</h1>
        <p className="mt-1 text-slate-500">Review reports from customers and providers and keep an audit-friendly status.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'open', 'under_review', 'resolved', 'rejected'].map((filter) => (
          <button key={filter} type="button" onClick={() => setStatus(filter)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${status === filter ? 'bg-orange-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">No reports found for this filter.</div>
        ) : reports.map((report) => (
          <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag className="h-4 w-4 text-red-600" />
                  <h2 className="font-bold capitalize text-slate-900">{report.category.replaceAll('_', ' ')}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${report.status === 'open' ? 'bg-red-100 text-red-700' : report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{report.status.replace('_', ' ')}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{report.description}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {report.reporterName} reported {report.reportedUserName} ({report.reportedUserRole}) on {new Date(report.createdAt).toLocaleDateString('en-IN')}
                  {report.listingTitle ? ` for listing “${report.listingTitle}”` : ''}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.status === 'open' && <button type="button" onClick={() => updateStatus(report, 'under_review')} disabled={processingId === report.id} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">Review</button>}
                {(report.status === 'open' || report.status === 'under_review') && <button type="button" onClick={() => updateStatus(report, 'resolved')} disabled={processingId === report.id} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">Resolve</button>}
                {(report.status === 'open' || report.status === 'under_review') && <button type="button" onClick={() => updateStatus(report, 'rejected')} disabled={processingId === report.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Reject</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminReports;
