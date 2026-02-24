// src/pages/Login.jsx
// Login page for admin authentication

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);
    
    if (result.success) {
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-construction-yellow rounded-lg flex items-center justify-center border-3 border-neutral-900">
              <span className="text-white font-black text-2xl">BM</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-neutral-900 uppercase mb-2">Admin Login</h1>
          <p className="text-neutral-600">Sign in to access the admin panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-3 border-neutral-900 p-8 construction-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-construction-yellow focus:outline-none transition-colors"
                placeholder="admin@buildmart.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-construction-yellow focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-4 px-6 border-3 border-neutral-900 uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>

        {/* Demo Credentials (Remove in production) */}
        {import.meta.env.DEV && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-300 p-4 rounded-lg text-sm">
            <p className="font-bold text-blue-900 mb-2">Development Mode</p>
            <p className="text-blue-700">
              Create an admin user in Firebase Console:
              <br />
              Authentication → Users → Add User
              <br />
              Then add role in Firestore:
              <br />
              users/[uid] → role: "admin"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
