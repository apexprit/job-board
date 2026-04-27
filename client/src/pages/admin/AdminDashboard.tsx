import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  BarChart3,
  FileText,
  UserPlus
} from 'lucide-react';
import { User, Job } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { adminApi } from '../../api/admin.api';
import { jobsApi } from '../../api/jobs.api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
  const { user: _user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    pendingJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'user' | 'job', id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API endpoints in parallel
      const [modStats, usersResult, pendingJobsResult, jobsResult] = await Promise.all([
        adminApi.getStats().catch(() => ({ pendingJobs: 0, pendingApplications: 0, totalModerations: 0 })),
        adminApi.getUsers(1, 5).catch(() => ({ data: [] as User[], total: 0, page: 1, limit: 5, totalPages: 0 })),
        adminApi.getPendingJobs(1, 5).catch(() => ({ data: [] as Job[], total: 0, page: 1, limit: 5, totalPages: 0 })),
        jobsApi.getJobs({ page: 1, limit: 1 }).catch(() => ({ data: [] as Job[], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ]);

      setStats({
        totalUsers: (usersResult as any).total || 0,
        totalJobs: (jobsResult as any).total || 0,
        pendingJobs: (modStats as any).pendingJobs || 0,
        totalApplications: (modStats as any).pendingApplications || 0,
      });

      setUsers((usersResult as any).data || []);
      setPendingJobs((pendingJobsResult as any).data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      if (itemToDelete.type === 'user') {
        await adminApi.deactivateUser(itemToDelete.id);
        setUsers(users.filter(u => u.id !== itemToDelete.id));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } else {
        await adminApi.moderateJob(itemToDelete.id, { status: 'rejected', reason: 'Deleted by admin' });
        setJobs(jobs.filter(j => j.id !== itemToDelete.id));
        setPendingJobs(pendingJobs.filter(j => j.id !== itemToDelete.id));
        setStats(prev => ({ ...prev, totalJobs: prev.totalJobs - 1 }));
      }
      
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await adminApi.moderateJob(jobId, { status: 'approved' });
      setPendingJobs(pendingJobs.filter(j => j.id !== jobId));
      setStats(prev => ({ ...prev, pendingJobs: prev.pendingJobs - 1 }));
    } catch (err) {
      console.error('Error approving job:', err);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      await adminApi.moderateJob(jobId, { status: 'rejected' });
      setPendingJobs(pendingJobs.filter(j => j.id !== jobId));
      setStats(prev => ({ ...prev, pendingJobs: prev.pendingJobs - 1 }));
    } catch (err) {
      console.error('Error rejecting job:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, jobs, and platform content</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/settings">
                <Shield className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-800">
                Manage users →
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/jobs" className="text-sm text-primary-600 hover:text-primary-800">
                Manage jobs →
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Jobs</p>
                <p className="text-2xl font-bold">{stats.pendingJobs}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/moderate" className="text-sm text-primary-600 hover:text-primary-800">
                Review pending →
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/applications" className="text-sm text-primary-600 hover:text-primary-800">
                View applications →
              </Link>
            </div>
          </Card>
        </div>

        {/* Pending Jobs & Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Jobs for Moderation */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Pending Job Approvals</h2>
              <Link to="/admin/moderate" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No pending jobs for approval</p>
                <p className="text-sm text-gray-500">All jobs have been moderated</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span>{job.company?.name || 'Company'}</span>
                      <span className="mx-2">•</span>
                      <span>{job.location || 'Location'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(job.postedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/jobs/${job.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          onClick={() => handleApproveJob(job.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleRejectJob(job.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No user data available</p>
                  <p className="text-sm text-gray-500">User data will appear here</p>
                </div>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-1">
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/users/${user.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => {
                          setItemToDelete({ type: 'user', id: user.id });
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/users/new">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/moderate">
                <AlertCircle className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Moderate Jobs</div>
                  <div className="text-sm text-gray-600">Review pending job postings</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/users">
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-gray-600">View and manage user accounts</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/jobs">
                <Briefcase className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Manage Jobs</div>
                  <div className="text-sm text-gray-600">View and manage all job postings</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/settings">
                <Shield className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Platform Settings</div>
                  <div className="text-sm text-gray-600">Configure platform settings</div>
                </div>
              </Link>
            </Button>
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">System Health</h2>
            <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">API Server</div>
                  <div className="text-sm text-gray-600">Operational</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-gray-600">Operational</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">File Storage</div>
                  <div className="text-sm text-gray-600">Operational</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Email Service</div>
                  <div className="text-sm text-gray-600">Operational</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.type === 'user' ? 'User' : 'Job'}`}
        size="md"
      >
        <div className="py-4">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : `Delete ${itemToDelete?.type === 'user' ? 'User' : 'Job'}`}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
