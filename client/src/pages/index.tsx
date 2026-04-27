import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Building, MapPin, DollarSign, Briefcase, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { useAuth, getDashboardPath } from '../context/AuthContext';
import { jobsApi } from '../api/jobs.api';
import { Job } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [jobStats, setJobStats] = useState<{ total: number; byType: Record<string, number>; byLocation: Record<string, number> } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobs, stats] = await Promise.all([
          jobsApi.getFeaturedJobs(4),
          jobsApi.getJobStats(),
        ]);
        setFeaturedJobs(jobs);
        setJobStats(stats);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (jobType) params.set('type', jobType);
    navigate(`/jobs?${params.toString()}`);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive';
    const fmt = (n: number) => `${(n / 1000).toFixed(0)}k`;
    if (min && max) return `$${fmt(min)} - $${fmt(max)}`;
    return min ? `From $${fmt(min)}` : `Up to $${fmt(max!)}`;
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  };

  const stats = [
    { label: 'Active Jobs', value: jobStats?.total?.toLocaleString() || '—', icon: <Briefcase className="w-6 h-6" /> },
    { label: 'Locations', value: jobStats?.byLocation ? Object.keys(jobStats.byLocation).length.toString() : '—', icon: <Building className="w-6 h-6" /> },
    { label: 'Job Types', value: jobStats?.byType ? Object.keys(jobStats.byType).length.toString() : '—', icon: <Users className="w-6 h-6" /> },
    { label: 'Success Rate', value: '95%', icon: <Award className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your <span className="text-yellow-300">Dream Job</span> Today
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90">
              Connect with top employers and discover opportunities that match your skills and ambitions.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      className="pl-12 py-3 text-lg border-0 focus:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="City, state, or remote"
                      className="pl-12 py-3 text-lg border-0 focus:ring-0"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <Select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="py-3 text-lg border-0 focus:ring-0"
                    options={[
                      { value: '', label: 'All Job Types' },
                      { value: 'full-time', label: 'Full-time' },
                      { value: 'part-time', label: 'Part-time' },
                      { value: 'contract', label: 'Contract' },
                      { value: 'internship', label: 'Internship' },
                      { value: 'remote', label: 'Remote' },
                    ]}
                  />
                </div>
                
                <Button type="submit" size="lg" className="px-8 py-3 text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </form>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <span className="text-sm opacity-80">Popular searches:</span>
              {['React Developer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Jobs</h2>
              <p className="text-gray-600">Hand-picked opportunities from top companies</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/jobs">
                View All Jobs
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.length === 0 ? (
              <p className="col-span-4 text-center text-gray-500 py-8">No featured jobs available right now.</p>
            ) : (
              featuredJobs.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-xl transition-shadow border hover:border-primary-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={job.company?.logoUrl || 'https://via.placeholder.com/40'}
                        alt={job.company?.name || 'Company'}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company?.name || 'Company'}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {job.postedAt ? getDaysAgo(String(job.postedAt)) : 'New'}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </div>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to={`/jobs/${job.id}`}>
                      View Details
                    </Link>
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to take the next step in your career?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream job through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to={user ? getDashboardPath(user.role) : '/login'}>
                    Go to Dashboard
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link to="/jobs">
                    Browse Jobs
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register">
                    Create Free Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and build your professional profile with skills, experience, and resume.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Find Perfect Jobs</h3>
              <p className="text-gray-600">
                Use our advanced search and filters to discover jobs that match your criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Apply & Get Hired</h3>
              <p className="text-gray-600">
                Apply with one click and track your applications through our dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;