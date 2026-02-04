import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { setupGlobalErrorHandlers } from './services/errorLogger';
import ErrorBoundary from './components/ErrorBoundary';
import Feed from './pages/Feed';
import ApplicationPreview from './pages/ApplicationPreview';
import ApplicationTracking from './pages/ApplicationTracking';
import Saved from './pages/Saved';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Preferences from './pages/Preferences';
import Inbox from './pages/Inbox';
import Screening from './pages/Screening';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OpportunityDetails from './pages/OpportunityDetails';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  // Initialize global error handlers on mount
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary name="App">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--color-bg)] pb-16 flex flex-col">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/"
                element={(
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/feed"
                element={(
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/opportunity/:id"
                element={(
                  <ProtectedRoute>
                    <OpportunityDetails />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/preview/:swipeId"
                element={(
                  <ProtectedRoute>
                    <ApplicationPreview />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/saved"
                element={(
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/applications"
                element={(
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/application/:id"
                element={(
                  <ProtectedRoute>
                    <ApplicationTracking />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/preferences"
                element={(
                  <ProtectedRoute>
                    <Preferences />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/inbox"
                element={(
                  <ProtectedRoute>
                    <Inbox />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/screening"
                element={(
                  <ProtectedRoute>
                    <Screening />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/settings"
                element={(
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/feedback"
                element={(
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<Navigate to="/feed" replace />} />
            </Routes>
            <BottomNav />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
