import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          DnD Space
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/my-characters" className="nav-link">My Characters</Link>
              <Link to="/character/create" className="nav-link">Create Character</Link>
              <div className="nav-user">
                <span>Welcome, {user?.username}!</span>
                <button type="button" onClick={logout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
