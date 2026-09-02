import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerApi } from '../api/providerApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  IndianRupee, TrendingUp, Building, Wallet, 
  ArrowDownRight, Loader2, Receipt, CalendarClock
} from 'lucide-react';

function Earnings() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'provider') {
      navigate('/dashboard');
      return;
    }
    fetchEarnings();
  }, [user, navigate]);

  const fetchEarnings = async () => {
    try {
      const data = await providerApi.getMyEarnings();
      setEarnings(data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Financial Overview</h1>
        <p className="text-slate-500 mt-1">Track your earnings, platform fees, and transaction history.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <h2 className="text-4xl font-bold text-slate-900">₹{earnings?.totalRevenue.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-slate-400 mt-2">Gross amount from all completed jobs</p>
          </div>
        </div>

        {/* Platform Fees */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building className="w-24 h-24 text-red-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform Fees (5%)</p>
            <h2 className="text-4xl font-bold text-slate-900">₹{earnings?.platformFees.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-slate-400 mt-2">Deducted for platform maintenance</p>
          </div>
        </div>

        {/* Net Earnings */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-violet-200 uppercase tracking-wider mb-1">Net Earnings</p>
            <h2 className="text-4xl font-bold text-white">₹{earnings?.netEarnings.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-violet-200 mt-2">Your actual take-home amount</p>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Receipt className="w-6 h-6 text-violet-600" />
          <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
        </div>
        
        {earnings?.recentTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarClock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm">Complete a booking to see your earnings here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Date Completed</th>
                  <th className="p-4 font-semibold">Service & Customer</th>
                  <th className="p-4 font-semibold text-right">Gross Amount</th>
                  <th className="p-4 font-semibold text-right">Platform Fee</th>
                  <th className="p-4 font-semibold text-right text-violet-700">Net Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earnings?.recentTransactions.map((tx) => (
                  <tr key={tx.bookingId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(tx.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{tx.serviceName}</p>
                      <p className="text-xs text-slate-500">Paid by {tx.customerName}</p>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right text-sm text-red-500">
                      - ₹{tx.fee.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-bold text-violet-700">
                      ₹{tx.net.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Earnings;