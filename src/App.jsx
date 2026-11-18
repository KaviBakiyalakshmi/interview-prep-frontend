import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { APP_NAME } from './config.js';
import { ProtectedRoute } from './components.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="inner">
        <Link to="/" className="brand">
          Interview<span>Prep</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/quiz">Quiz</NavLink>
          <NavLink to="/study">Study</NavLink>
          {user && <NavLink to="/bookmarks">Saved</NavLink>}
          {user && <NavLink to="/history">History</NavLink>}
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        {user ? (
          <div className="row">
            <span className="muted small-text">{user.name}</span>
            <button type="button" className="btn small ghost" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="row">
            <Link to="/login" className="btn small ghost">Login</Link>
            <Link to="/register" className="btn small">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NotFound() {
  return (
    <div className="center">
      <h2>Page not found</h2>
      <Link to="/">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/results/:attemptId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><StudyPage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">{APP_NAME}: practice real interview questions, one day at a time.</footer>
    </>
  );
}
