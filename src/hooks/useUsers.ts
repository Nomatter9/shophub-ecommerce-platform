import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, UserResponse } from '@/types/User';
import axiosClient from '@/axiosClient';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build params object - only include non-empty values
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      // Only add search if it has a value (backend rejects empty strings)
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      
      // Only add role if it has a value (backend rejects empty strings)
      if (filters.role && filters.role.trim()) {
        params.role = filters.role.trim();
      }

      const { data } = await axiosClient.get<UserResponse>('/admin/users', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(data.users || []);
      setPagination({ 
        page: data.pagination?.page || 1, 
        totalPages: data.pagination?.totalPages || 1 
      });
    } catch (err: any) {
      console.error("Failed to load users", err);
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { 
    fetchUsers(); 
  }, [fetchUsers]);

  return { users, loading, pagination, filters, setFilters, refresh: fetchUsers };
};