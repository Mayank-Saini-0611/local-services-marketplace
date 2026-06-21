import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  Users,
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  Briefcase,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Crown,
  User
} from 'lucide-react';

function AdminUsers() {
  const currentUser = tokenStorage.getUser();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toast, setToast] = useState(null);
  
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers({ 
        role: roleFilter,
        search: search.trim() || undefined
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;
    setIsUpdating(true);
    try {
      await adminApi.updateUserRole(editingUser.id, newRole);
      showToast(`Role updated to ${newRole}`);
      setEditingUser(null);
      setNewRole('');
      fetchUsers();
    } catch (err) {
      console.error('Update role error:', err);
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminApi.deleteUser(deleteConfirm.id);
      showToast(`User "${deleteConfirm.fullName}" deleted`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete user', 'error');
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Crown },
      provider: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Briefcase },
      customer: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: User },
    };
    return config[role] || config.customer;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-500 mt-1">View, manage and moderate platform users</p>
      </div>

      {/* STATS QUICK VIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setRoleFilter('all')}
          className={`p-4 rounded-xl border transition-all text-left ${
            roleFilter === 'all' 
              ? 'bg-slate-900 border-slate-900 text-white' 
              : 'bg-white border-slate-100 hover:border-slate-300'
          }`}
        >
          <Users className={`w-5 h-5 mb-2 ${roleFilter === 'all' ? 'text-orange-400' : 'text-slate-400'}`} />
          <p className={`text-2xl font-bold ${roleFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>{users.length}</p>
          <p className={`text-xs ${roleFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>All Users</p>
        </button>
        
        <button
          onClick={() => setRoleFilter('customer')}
          className={`p-4 rounded-xl border transition-all text-left ${
            roleFilter === 'customer' 
              ? 'bg-violet-600 border-violet-600 text-white' 
              : 'bg-white border-slate-100 hover:border-violet-300'
          }`}
        >
          <User className={`w-5 h-5 mb-2 ${roleFilter === 'customer' ? 'text-violet-200' : 'text-violet-500'}`} />
          <p className={`text-2xl font-bold ${roleFilter === 'customer' ? 'text-white' : 'text-slate-900'}`}>
            {users.filter(u => u.role === 'customer').length}
          </p>
          <p className={`text-xs ${roleFilter === 'customer' ? 'text-violet-100' : 'text-slate-500'}`}>Customers</p>
        </button>
        
        <button
          onClick={() => setRoleFilter('provider')}
          className={`p-4 rounded-xl border transition-all text-left ${
            roleFilter === 'provider' 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-slate-100 hover:border-blue-300'
          }`}
        >
          <Briefcase className={`w-5 h-5 mb-2 ${roleFilter === 'provider' ? 'text-blue-200' : 'text-blue-500'}`} />
          <p className={`text-2xl font-bold ${roleFilter === 'provider' ? 'text-white' : 'text-slate-900'}`}>
            {users.filter(u => u.role === 'provider').length}
          </p>
          <p className={`text-xs ${roleFilter === 'provider' ? 'text-blue-100' : 'text-slate-500'}`}>Providers</p>
        </button>
        
        <button
          onClick={() => setRoleFilter('admin')}
          className={`p-4 rounded-xl border transition-all text-left ${
            roleFilter === 'admin' 
              ? 'bg-orange-600 border-orange-600 text-white' 
              : 'bg-white border-slate-100 hover:border-orange-300'
          }`}
        >
          <Crown className={`w-5 h-5 mb-2 ${roleFilter === 'admin' ? 'text-orange-200' : 'text-orange-500'}`} />
          <p className={`text-2xl font-bold ${roleFilter === 'admin' ? 'text-white' : 'text-slate-900'}`}>
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className={`text-xs ${roleFilter === 'admin' ? 'text-orange-100' : 'text-slate-500'}`}>Admins</p>
        </button>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-32 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:shadow-lg"
        >
          Search
        </button>
      </form>

      {/* USERS TABLE */}
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No users found</h3>
          <p className="text-slate-500">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">User</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">Contact</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">Stats</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">Joined</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  const isMe = user.id === currentUser?.userId;
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate flex items-center gap-2">
                              {user.fullName}
                              {isMe && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">You</span>}
                            </p>
                            <p className="text-xs text-slate-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              +91 {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border}`}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3 h-3 text-blue-500" />
                            {user.totalListings} listings
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-orange-500" />
                            {user.totalBookings} bookings
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditingUser(user); setNewRole(user.role); }}
                            disabled={isMe}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Change role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            disabled={isMe}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {users.map(user => {
              const roleBadge = getRoleBadge(user.role);
              const RoleIcon = roleBadge.icon;
              const isMe = user.id === currentUser?.userId;
              
              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        {user.fullName}
                        {isMe && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">You</span>}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border} flex-shrink-0`}>
                      <RoleIcon className="w-3 h-3" />
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3 text-slate-500">
                      <span>📋 {user.totalListings}</span>
                      <span>📅 {user.totalBookings}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingUser(user); setNewRole(user.role); }}
                        disabled={isMe}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg disabled:opacity-30"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        disabled={isMe}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Change User Role</h3>
                <p className="text-sm text-slate-500 mt-0.5">{editingUser.fullName}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {['customer', 'provider', 'admin'].map(role => {
                  const badge = getRoleBadge(role);
                  const Icon = badge.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                        newRole === role 
                          ? `${badge.bg} ${badge.border}` 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${badge.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${badge.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${newRole === role ? badge.text : 'text-slate-900'}`}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {role === 'customer' && 'Can browse and book services'}
                          {role === 'provider' && 'Can create listings and receive bookings'}
                          {role === 'admin' && 'Full platform access'}
                        </p>
                      </div>
                      {newRole === role && <CheckCircle2 className={`w-5 h-5 ${badge.text}`} />}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={isUpdating || newRole === editingUser.role}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <strong>"{deleteConfirm.fullName}"</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ This will also delete all their listings and bookings. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;