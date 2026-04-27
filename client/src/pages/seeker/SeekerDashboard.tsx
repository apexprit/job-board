import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  User, 
  Calendar,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Plus
} from 'lucide-react';
import { applicationsApi } from '../../api/applications.api';
import { Application, ApplicationStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import DashboardLayout from '../../components/layout/DashboardLayout';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculateProfileCompleteness = (): number => {
    if (!user) return 0;
    const fields = [
      !!user.name,
      !!user.email,
      !!user.firstName,
      !!user.lastName,
      !!user.avatarUrl,
      !!user.resumeUrl,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const result = await applicationsApi.getMyApplications({ limit: 10 });
      setApplications(result.data);
      
      // Calculate stats
      const pending = result.data.filter(app => app.status === 'pending').length;
      const accepted = result.data.filter(app => app.status === 'accepted').length;
      const rejected = result.data.filter(app => app.status === 'rejected').length;
      
      setStats({
        totalApplications: result.total,
        pending,
        accepted,
        rejected,
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
            <p className="text-gray-600">Track your job applications and profile</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/seeker/profile/edit">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild>
              <Link to="/jobs">
                <Plus className="w-4 h-4 mr-2" />
                Find Jobs
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/seeker/applications" className="text-sm text-primary-600 hover:text-primary-800">
                View all applications →
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Awaiting employer review
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                Successful applications
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Completeness</p>
                <p className="text-2xl font-bold">{profileCompleteness}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/seeker/profile" className="text-sm text-primary-600 hover:text-primary-800">
                Complete profile →
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Applications & Profile Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Applications</h2>
              <Link to="/seeker/applications" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No applications yet</p>
                <Button asChild>
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{app.job?.title || 'Job Application'}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span>{app.job?.company?.name || 'Company'}</span>
                      <span className="mx-2">•</span>
                      <span>{app.job?.location || 'Location'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{formatDate(app.appliedAt)}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/jobs/${app.jobId}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {app.resumeUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Profile Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Profile Summary</h2>
              <Link to="/seeker/profile" className="text-sm text-primary-600 hover:text-primary-800">
                Edit Profile
              </Link>
            </div>
            
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{user?.name || 'Your Name'}</h3>
                  <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
                  <div className="mt-2">
                    <Badge className="bg-primary-100 text-primary-800">
                      {user?.role === 'candidate' ? 'Job Seeker' : user?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Completeness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <span className="text-sm font-bold">{profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${profileCompleteness}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Complete your profile to increase job match chances</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions</h4>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/seeker/profile/resume">
                    <FileText className="w-4 h-4 mr-3" />
                    Upload Resume
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/seeker/profile/skills">
                    <Edit className="w-4 h-4 mr-3" />
                    Add Skills
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/seeker/profile/experience">
                    <Briefcase className="w-4 h-4 mr-3" />
                    Add Experience
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Jobs & Job Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Jobs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Saved Jobs</h2>
              <Link to="/seeker/saved-jobs" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No saved jobs yet</p>
              <p className="text-sm text-gray-500 mb-4">Save jobs you're interested in to apply later</p>
              <Button variant="outline" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </Card>

          {/* Job Alerts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Job Alerts</h2>
              <Link to="/seeker/alerts" className="text-sm text-primary-600 hover:text-primary-800">
                Manage
              </Link>
            </div>
            
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No job alerts yet</p>
              <p className="text-sm text-gray-500 mb-4">Create alerts to get notified about new job opportunities</p>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/seeker/alerts/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Alert
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SeekerDashboard;