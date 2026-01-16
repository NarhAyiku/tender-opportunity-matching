import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Feed from './pages/Feed';
import ApplicationPreview from './pages/ApplicationPreview';
import Saved from './pages/Saved';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 pb-16">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/preview/:swipeId" element={<ApplicationPreview />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
