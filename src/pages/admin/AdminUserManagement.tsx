import React, { useState } from 'react';
import axios from 'axios';
import { useUsers } from '@/hooks/useUsers';
import ProductDrawer from "@/components/products/ProductDrawer";
import { User } from '@/types/User';
import axiosClient from '@/axiosClient';
import { Eye, Pencil, Trash2, Trash2Icon } from 'lucide-react';

export default function AdminUserManagement() {
  const { users, loading, pagination, filters, setFilters, refresh } = useUsers();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const handleEditClick = (user: User) => {
  if (!user.id) {
    alert("Error: User ID is missing");
    return;
  }

  setSelectedUser(user);
  setIsDrawerOpen(true);
};

const handleSave = async (updatedData: any) => {
  if (!selectedUser?.id) {
    alert("Error: No user selected");
    return;
  }

  try {
    if (updatedData.role !== selectedUser.role) {
      await axiosClient.put(
        `/admin/users/${selectedUser.id}/role`,
        { role: updatedData.role }
      );
    }

    refresh();
    setIsDrawerOpen(false);
    alert("User role updated successfully");
  } catch (err: any) {
    console.error('Update error:', err);
    alert(err.response?.data?.message || "Update failed");
  }
};



const handleDelete = async (user: User) => {
  if (
    !window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    )
  ) {
    return;
  }

  try {
    await axiosClient.delete(`/admin/users/${user.id}`);
    refresh();
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to delete user");
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toggleVerification = async (user: User) => {
  try {
    await axiosClient.put(
      `/admin/users/${user.id}/status`,
      { isVerified: !user.isVerified }
    );

    refresh();
  } catch (err) {
    alert("Failed to update verification status");
  }
};

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">Manage all users and their permissions</p>
      </div>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  User
                </th>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Phone
                </th>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Role
                </th>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Created
                </th>
                <th className="text-left p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Updated
                </th>
                <th className="text-center p-4 font-semibold text-gray-300 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                      <p className="text-gray-400">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users?.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* <div className="flex-shrink-0">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                          )}
                        </div> */}
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {user.phone || <span className="text-gray-500">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : user.role === 'seller'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                <td className="p-4">
                
                  {user.role !== 'admin' && user.id !== currentUser.id ? (
                    <button
                      onClick={() => toggleVerification(user)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit
                        transition hover:scale-[1.03] active:scale-95
                        ${
                          user.isVerified
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                        }`}
                      title="Click to toggle verification"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.isVerified ? 'bg-green-400' : 'bg-yellow-400'
                        }`}
                      />
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </button>
                  ) : (
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit bg-gray-700/20 border border-gray-600/30 cursor-not-allowed"
                      title={user.id === currentUser.id ? "You cannot edit your own status" : "Admin status managed by system"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span className="text-gray-500">
                        {user.id === currentUser.id ? 'You (Admin)' : 'Protected'}
                      </span>
                    </div>
                  )}
                </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {user.updatedAt ? formatDate(user.updatedAt) : <span className="text-gray-500">—</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                       
                        <button 
                          onClick={() => handleEditClick(user)}
                         className="h-8 w-8 text-blue-400 hover:bg-blue-400/10 ">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                           className="h-8 w-8 text-red-400 hover:bg-red-400/10">
                         <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-400 font-medium">No users found</p>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
            <span className="font-semibold text-white">{pagination.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilters({...filters, page: filters.page - 1})}
              className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
<ProductDrawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  product={selectedUser}
  categories={[]}
  mode="edit"
  onSave={handleSave}
  isUserMode={true} 
/>
    </div>
  );
}