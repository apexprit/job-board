import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Building, 
  Globe, 
  Calendar,
  ArrowLeft,
  CheckCircle,
  FileText,
  User
} from 'lucide-react';
import { jobsApi } from '../../api/jobs.api';
import { applicationsApi } from '../../api/applications.api';
import { Job, JobType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobData = await jobsApi.getJob(id!);
      setJob(jobData);
      // Check if user has already applied (simplified - in real app, fetch user's applications)
      if (isAuthenticated && user?.role === 'candidate') {
        // You would check applicationsApi.getMyApplications and filter by jobId
        // For now, we'll assume not applied
        setHasApplied(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user?.role !== 'candidate') {
      setError('Only candidates can apply for jobs');
      return;
    }
    setApplyModalOpen(true);
  };

  const submitApplication = async () => {
    if (!id) return;
    setApplying(true);
    try {
      const requestData: any = {};
      if (coverLetter.trim()) {
        requestData.coverLetter = coverLetter.trim();
      }
      // In real app, you would have resumeUrl from user profile
      await applicationsApi.applyForJob(id, requestData);
      setApplicationSuccess(true);
      setHasApplied(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplicationSuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const getTypeBadgeColor = (type: JobType) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-yellow-100 text-yellow-800';
      case 'remote': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'USD';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${curr} ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    return `Up to ${curr} ${max!.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="text-red-600 mb-4">{error || 'Job not found'}</div>
          <Button asChild>
            <Link to="/jobs">Back to Job Listings</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-6"
            asChild
          >
            <Link to="/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  <span className="text-lg">{job.company?.name || 'Unknown Company'}</span>
                </div>
                <Badge className={cn('px-3 py-1', getTypeBadgeColor(job.type))}>
                  {job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {job.location}
                  {job.remote && <span className="ml-2">• Remote</span>}
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Posted {formatDate(job.postedAt)}
                </div>
                {job.expiresAt && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Expires {formatDate(job.expiresAt)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <div className="p-6">
                  {hasApplied ? (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Application Submitted</h3>
                      <p className="text-white/80 mb-4">Your application has been received.</p>
                      <Button variant="outline" className="w-full text-white border-white hover:bg-white/20">
                        View Application Status
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
                      {isAuthenticated && user?.role === 'candidate' ? (
                        <Button 
                          className="w-full bg-white text-primary-700 hover:bg-gray-100"
                          onClick={handleApply}
                        >
                          Apply Now
                        </Button>
                      ) : !isAuthenticated ? (
                        <>
                          <p className="mb-4 text-white/80">Sign in to apply for this position</p>
                          <Button 
                            className="w-full bg-white text-primary-700 hover:bg-gray-100"
                            asChild
                          >
                            <Link to="/login" state={{ from: `/jobs/${id}` }}>
                              Sign In to Apply
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <p className="text-white/80">Only candidates can apply for jobs.</p>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </Card>

            {/* Requirements & Skills */}
            {job.tags && job.tags.length > 0 && (
              <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Skills & Requirements</h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* About Company */}
            {job.company && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">About the Company</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{job.company.name}</h3>
                    <p className="text-gray-600 mb-4">
                      {job.company.description || 'No description available.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {job.company.website && (
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary-600 hover:text-primary-800"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </a>
                      )}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.company.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Job Type</div>
                    <div className="font-medium">{job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">
                      {job.location}
                      {job.remote && <span className="text-primary-600"> (Remote available)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Salary</div>
                    <div className="font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Posted</div>
                    <div className="font-medium">{formatDate(job.postedAt)}</div>
                  </div>
                </div>
                {job.expiresAt && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Expires</div>
                      <div className="font-medium">{formatDate(job.expiresAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Share Job */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Share This Job</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Copy Link
                </Button>
                <Button variant="outline" className="flex-1">
                  Share
                </Button>
              </div>
            </Card>

            {/* Similar Jobs (placeholder) */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Similar Jobs</h3>
              <p className="text-gray-600 text-sm">
                Browse similar job opportunities in your area.
              </p>
              <Button variant="ghost" className="mt-4 p-0" asChild>
                <Link to="/jobs">View All Jobs</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => !applying && setApplyModalOpen(false)}
        title="Apply for Job"
        size="lg"
      >
        {applicationSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your application has been successfully submitted. The employer will review your profile.
            </p>
            <Button onClick={() => setApplyModalOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-2">{job.title}</h4>
              <p className="text-gray-600">{job.company?.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're a good fit for this position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Your resume will be attached from your profile.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/profile">
                      Manage Resume
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                Your profile information will be included with this application.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setApplyModalOpen(false)}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button
                onClick={submitApplication}
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default JobDetailPage;
