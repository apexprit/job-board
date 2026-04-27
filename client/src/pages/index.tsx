export const Home = () => (
  <div className="text-center py-12">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      Find Your Dream Job Today
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Connect with top employers and discover opportunities that match your skills.
    </p>
    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
      Browse Jobs
    </button>
  </div>
);

export const Login = () => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold mb-6">Login</h2>
    <form>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border rounded mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border rounded mb-6"
      />
      <button className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700">
        Sign In
      </button>
    </form>
  </div>
);

export const Register = () => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold mb-6">Create Account</h2>
    <form>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full p-3 border rounded mb-4"
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 border rounded mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 border rounded mb-6"
      />
      <button className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700">
        Sign Up
      </button>
    </form>
  </div>
);

export const Jobs = () => (
  <div>
    <h2 className="text-3xl font-bold mb-6">Job Listings</h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Senior Frontend Developer</h3>
          <p className="text-gray-600 mb-4">Remote • $120k - $180k</p>
          <p className="text-gray-800">
            Join our team building the future of job boards with React and TypeScript.
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const Dashboard = () => (
  <div>
    <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-700">Welcome to your dashboard! Here you can manage applications, profile, and more.</p>
    </div>
  </div>
);