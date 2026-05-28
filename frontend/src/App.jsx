import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import Profile from './pages/Profile';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mail-loader" aria-label="Loading application">
          <span className="sr-only">Loading application</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/verify-email"
          element={user ? <Navigate to="/dashboard" /> : <VerifyEmail />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={user ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compose"
          element={
            <ProtectedRoute>
              <Compose />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
