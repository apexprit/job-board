import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/auth';
import { Navbar, Footer, PageContainer, DashboardLayout } from './components/layout';
import ComingSoonPage from './components/layout/ComingSoonPage';
import Home from './pages/index';
import { LoginPage, RegisterPage } from './pages/auth';
import { JobListPage, JobDetailPage } from './pages/jobs';
import { EmployerDashboard } from './pages/employer';
import { SeekerDashboard } from './pages/seeker';
import { AdminDashboard } from './pages/admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <PageContainer title="Find Your Dream Job">
                  <Home />
                </PageContainer>
              } />
              
              <Route path="/login" element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } />
              
              <Route path="/register" element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              } />
              
              <Route path="/jobs" element={
                <PageContainer title="Browse Jobs">
                  <JobListPage />
                </PageContainer>
              } />
              
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="User Management" description="Manage users, roles, and permissions. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/jobs" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Job Moderation" description="Review and moderate job listings. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Analytics" description="Platform analytics and insights. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Admin Settings" description="Configure platform settings. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/moderate" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Job Moderation" description="Review and moderate pending job listings. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/applications" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Application Management" description="View and manage all applications. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/users/new" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Add New User" description="Create a new user account. This feature is coming soon." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Page Not Found" description="The page you're looking for doesn't exist." backLink="/admin/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Employer routes */}
              <Route path="/employer/dashboard" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/employer/jobs/new" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Post New Job" description="Create a new job listing to find the perfect candidate. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/jobs" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="My Posted Jobs" description="Manage your job listings. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/applications" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Applications" description="Review and manage job applications. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/company" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Company Profile" description="Manage your company profile and branding. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/profile" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Employer Profile" description="Manage your personal profile. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/analytics" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Analytics" description="View job performance analytics and insights. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/employer/settings" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Settings" description="Manage your account settings. This feature is coming soon." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/employer/*" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Page Not Found" description="The page you're looking for doesn't exist." backLink="/employer/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Seeker routes */}
              <Route path="/seeker/dashboard" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <SeekerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/seeker/applications" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="My Applications" description="Track and manage your job applications. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/profile" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="My Profile" description="Manage your professional profile and resume. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/notifications" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Notifications" description="View your job alerts and notifications. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/help" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Help & Support" description="Get help and contact support. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/profile/edit" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Edit Profile" description="Update your professional profile and personal information. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/profile/resume" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Upload Resume" description="Upload and manage your resume. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/profile/skills" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Manage Skills" description="Add and manage your professional skills. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/profile/experience" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Work Experience" description="Add and manage your work experience. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/saved-jobs" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Saved Jobs" description="View and manage your saved job listings. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/alerts" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Job Alerts" description="Manage your job alert preferences. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/seeker/alerts/create" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Create Job Alert" description="Set up a new job alert to get notified about relevant opportunities. This feature is coming soon." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/seeker/*" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <ComingSoonPage title="Page Not Found" description="The page you're looking for doesn't exist." backLink="/seeker/dashboard" backLabel="Back to Dashboard" />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={
                <PageContainer title="Page Not Found">
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <a href="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                      Go Back Home
                    </a>
                  </div>
                </PageContainer>
              } />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;