import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { 
  ShieldCheck, CheckCircle2, XCircle, Loader2, 
  Eye, FileX, ExternalLink, X
} from 'lucide-react';

function AdminKyc() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await adminApi.getKycRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load KYC requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void fetchRequests();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [fetchRequests]);

  const handleStatusUpdate = async (id, status) => {
    setProcessingId(id);
    try {
      await adminApi.updateKycStatus(id, status);
      showToast(`Provider KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully!`);
      if (selectedReq && selectedReq.userId === id) {
        setSelectedReq(null);
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast('Failed to update KYC status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">KYC Verification Portal</h1>
        <p className="text-slate-500 mt-1">Review government IDs submitted by Service Providers to assign verified blue badges.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-lg text-slate-700">No KYC requests pending</p>
            <p className="text-sm mt-1">When service providers upload their government IDs in Settings, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Document Proof</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <tr key={req.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{req.fullName}</p>
                      <p className="text-xs text-slate-500">{req.email}</p>
                    </td>
                    <td className="p-4">
                      {req.documentUrl ? (
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Inspect ID Document
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic flex items-center gap-1">
                          <FileX className="w-3.5 h-3.5" /> None
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {req.submittedAt
                        ? new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'verified' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status !== 'verified' && (
                          <button
                            onClick={() => handleStatusUpdate(req.userId, 'verified')}
                            disabled={processingId === req.userId}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            title="Approve ID"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {req.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(req.userId, 'rejected')}
                            disabled={processingId === req.userId}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-all"
                            title="Reject ID"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL-SIZE HIGH-RES INSPECTION MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Government ID Inspection</h3>
                <p className="text-xs text-slate-500">Submitted by {selectedReq.fullName} ({selectedReq.email})</p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* High-Resolution Document Canvas */}
            <div className="p-6 overflow-auto max-h-[60vh] bg-slate-900/95 flex items-center justify-center">
              <img
                src={selectedReq.documentUrl}
                alt="Government ID"
                className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xl border-2 border-slate-700"
              />
            </div>

            {/* Footer with Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={selectedReq.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-violet-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open original in new tab
              </a>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleStatusUpdate(selectedReq.userId, 'rejected')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-xl text-sm transition-all"
                >
                  Reject Document
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedReq.userId, 'verified')}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-green-200 transition-all"
                >
                  Approve & Verify Provider 🛡️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKyc;