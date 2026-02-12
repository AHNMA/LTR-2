
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import { Search, Shield, Trash2, Edit2, Check, X } from 'lucide-react';

const UserManagement: React.FC = () => {
    const { users, updateUserRole, deleteUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRole, setEditingRole] = useState<string | null>(null);

    const roles: UserRole[] = ['admin', 'it', 'editor', 'author', 'moderator', 'vip', 'user'];

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId: string, newRole: string) => {
        await updateUserRole(userId, newRole as UserRole);
        setEditingRole(null);
    };

    const handleDelete = async (userId: string) => {
        if(confirm('Delete user?')) {
            await deleteUser(userId);
        }
    }

    return (
        <div>
             {/* Toolbar */}
             <div className="flex justify-between items-center mb-6">
                 <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-f1-pink bg-white text-slate-900"
                    />
                </div>
                <div className="text-sm text-slate-500">
                    Total Users: <span className="font-bold text-slate-900">{users.length}</span>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                         <tr>
                             <th className="p-4">User</th>
                             <th className="p-4">Role</th>
                             <th className="p-4">Joined</th>
                             <th className="p-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {filteredUsers.map(user => (
                             <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4">
                                     <div className="flex items-center">
                                         <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mr-3">
                                             <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt="" className="w-full h-full object-cover" />
                                         </div>
                                         <div>
                                             <div className="font-bold text-slate-900">{user.username}</div>
                                             <div className="text-xs text-slate-500">{user.email}</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="p-4">
                                     {editingRole === user.id ? (
                                         <div className="flex items-center space-x-2">
                                             <select 
                                                className="border border-slate-300 rounded p-1 text-xs bg-white text-slate-900 focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink"
                                                defaultValue={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                autoFocus
                                                onBlur={() => setEditingRole(null)}
                                            >
                                                 {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                             </select>
                                         </div>
                                     ) : (
                                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                             user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                             user.role === 'it' ? 'bg-blue-100 text-blue-700' :
                                             user.role === 'editor' ? 'bg-green-100 text-green-700' :
                                             user.role === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-slate-100 text-slate-600'
                                         }`}>
                                             {user.role}
                                         </span>
                                     )}
                                 </td>
                                 <td className="p-4 text-slate-500 text-xs">
                                     {user.joinedDate}
                                 </td>
                                 <td className="p-4 text-right">
                                     <div className="flex justify-end space-x-2">
                                         <button onClick={() => setEditingRole(user.id)} className="p-2 text-slate-400 hover:text-f1-pink">
                                             <Shield size={16} />
                                         </button>
                                         <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600">
                                             <Trash2 size={16} />
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    );
};

export default UserManagement;
