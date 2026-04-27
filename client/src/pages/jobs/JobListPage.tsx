import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, Clock, DollarSign } from 'lucide-react';
import { jobsApi, JobFilters } from '../../api/jobs.api';
import { Job, JobType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const SORT_OPTIONS = [
  { value: 'postedAt_desc', label: 'Newest' },
  { value: 'postedAt_asc', label: 'Oldest' },
  { value: 'salary_desc', label: 'Salary High to Low' },
  { value: 'salary_asc', label: 'Salary Low to High' },
];

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract filter values from URL
  const keyword = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') as JobType | null;
  const minSalary = searchParams.get('minSalary') ? Number(searchParams.get('minSalary')) : undefined;
  const maxSalary = searchParams.get('maxSalary') ? Number(searchParams.get('maxSalary')) : undefined;
  const sortBy = searchParams.get('sortBy') || 'postedAt_desc';
  const page = Number(searchParams.get('page') || '1');
  const limit = 12;

  // Debounced search
  const [keywordInput, setKeywordInput] = useState(keyword);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keywordInput !== keyword) {
        updateSearchParam('q', keywordInput || null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const updateSearchParam = (key: string, value: string | number | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    newParams.set('page', '1'); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sortByField, sortOrder] = sortBy.split('_') as ['postedAt' | 'salary', 'asc' | 'desc'];
      const filters: JobFilters = {};
      if (keyword.trim()) filters.search = keyword.trim();
      if (location.trim()) filters.location = location.trim();
      if (type) filters.type = type;
      if (minSalary !== undefined) filters.minSalary = minSalary;
      if (maxSalary !== undefined) filters.maxSalary = maxSalary;
      filters.page = page;
      filters.limit = limit;
      filters.sortBy = sortByField;
      filters.sortOrder = sortOrder;
      const result = await jobsApi.getJobs(filters);
      setJobs(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, type, minSalary, maxSalary, sortBy, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleClearFilters = () => {
    setSearchParams({});
    setKeywordInput('');
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'USD';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${curr} ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    return `Up to ${curr} ${max!.toLocaleString()}`;
  };

  const getDaysAgo = (date: Date) => {
    const posted = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-xl mb-8">Browse thousands of job opportunities from top companies</p>
          <div className="max-w-3xl mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Job title, keywords, or company"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="flex-1 bg-white text-gray-900"
            icon={Search}
          />
          <Button className="bg-white text-primary-700 hover:bg-gray-100">
            Search
          </Button>
        </div>
      </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    placeholder="City, State, or Remote"
                    value={location}
                    onChange={(e) => updateSearchParam('location', e.target.value)}
                    icon={MapPin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <Select
                    value={type || ''}
                    onChange={(e) => updateSearchParam('type', e.target.value)}
                    options={[{ value: '', label: 'All Types' }, ...JOB_TYPES]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minSalary || ''}
                      onChange={(e) => updateSearchParam('minSalary', e.target.value)}
                      icon={DollarSign}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxSalary || ''}
                      onChange={(e) => updateSearchParam('maxSalary', e.target.value)}
                      icon={DollarSign}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <Select
                    value={sortBy}
                    onChange={(e) => updateSearchParam('sortBy', e.target.value)}
                    options={SORT_OPTIONS}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Loading Jobs...' : `${total} Job${total !== 1 ? 's' : ''} Found`}
                </h2>
                <p className="text-gray-600">Browse opportunities that match your criteria</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={fetchJobs}>Try Again</Button>
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500 text-lg mb-4">No jobs found matching your criteria</div>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={handleClearFilters}>Clear All Filters</Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {jobs.map((job) => (
                    <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            <a href={`/jobs/${job.id}`} className="hover:text-primary-600">
                              {job.title}
                            </a>
                          </h3>
                          <p className="text-gray-700 font-medium">
                            {job.company?.name || 'Unknown Company'}
                          </p>
                        </div>
                        <Badge className={cn('px-3 py-1', getTypeBadgeColor(job.type))}>
                          {job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {job.location}
                          {job.remote && job.location.toLowerCase() !== 'remote' && <span className="ml-2 text-primary-600">• Remote</span>}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Posted {getDaysAgo(job.postedAt)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {job.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button asChild>
                          <a href={`/jobs/${job.id}`}>View Details</a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {total > limit && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil(total / limit)}
                      onPageChange={(newPage) => updateSearchParam('page', newPage)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListPage;