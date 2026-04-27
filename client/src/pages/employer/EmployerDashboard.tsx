import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { jobsApi } from '../../api/jobs.api';
import { Job, Application, ApplicationStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import DashboardLayout from '../../components/layout/DashboardLayout';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch employer's jobs
      const jobsResult = await jobsApi.getMyJobs({ limit: 5 });
      setJobs(jobsResult.data);
      setStats(prev => ({ ...prev, totalJobs: jobsResult.total, activeJobs: jobsResult.data.filter(j => !j.expiresAt || new Date(j.expiresAt) > new Date()).length }));

      // Fetch applications for employer's jobs
      // Note: In real app, you'd have an endpoint for employer's applications
      // For now, we'll simulate by fetching applications for the first job
      if (jobsResult.data.length > 0) {
        // Simplified: fetch applications for all jobs (would need batch endpoint)
        // We'll just show placeholder
        setApplications([]);
        setStats(prev => ({ ...prev, totalApplications: 0, pendingApplications: 0 }));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await jobsApi.deleteJob(jobToDelete);
      setJobs(jobs.filter(j => j.id !== jobToDelete));
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err) {
      console.error('Error deleting job:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" /> Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" /> Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
            <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and applicants</p>
          </div>
          <Button asChild>
            <Link to="/employer/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-600 font-medium">{stats.activeJobs} active</span>
                <span className="mx-2">•</span>
                <span>{stats.totalJobs - stats.activeJobs} closed</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-yellow-600 font-medium">{stats.pendingApplications} pending</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/employer/jobs" className="text-sm text-primary-600 hover:text-primary-800">
                View all jobs →
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Company Profile</p>
                <p className="text-2xl font-bold">
                  {user?.name && user?.avatarUrl ? 'Complete' : 'Incomplete'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/employer/profile" className="text-sm text-primary-600 hover:text-primary-800">
                Edit profile →
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Jobs & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Job Postings</h2>
              <Link to="/employer/jobs" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No job postings yet</p>
                <Button asChild>
                  <Link to="/employer/jobs/new">Post Your First Job</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{job.location}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{formatDate(job.postedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employer/jobs/${job.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employer/jobs/${job.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => {
                          setJobToDelete(job.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Applications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Applications</h2>
              <Link to="/employer/applications" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No applications yet</p>
                <p className="text-sm text-gray-500">Applications will appear here when candidates apply to your jobs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{app.user?.name || 'Candidate'}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Applied for {app.job?.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{formatDate(app.appliedAt)}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employer/applications/${app.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/employer/jobs/new">
                <Plus className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Post New Job</div>
                  <div className="text-sm text-gray-600">Create a new job listing</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/employer/profile">
                <FileText className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Edit Company Profile</div>
                  <div className="text-sm text-gray-600">Update company details</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/employer/applications">
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Manage Applications</div>
                  <div className="text-sm text-gray-600">Review candidate applications</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/employer/analytics">
                <BarChart3 className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-600">See job performance</div>
                </div>
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Job"
        size="md"
      >
        <div className="py-4">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this job posting? This action cannot be undone.
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
              onClick={handleDeleteJob}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Job'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EmployerDashboard;