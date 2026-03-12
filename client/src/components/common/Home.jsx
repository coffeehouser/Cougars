import { useAuth } from '../../context/AuthContext';
import CharacterList from '../character/CharacterList';
import DiceRoller from './DiceRoller';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Welcome to DnD Space</h1>
        <p className="hero-subtitle">
          The MySpace-style social network for Dr_Maddz's D&D Campaign
        </p>

        {isAuthenticated ? (
          <div className="hero-content">
            <h2>Welcome back, {user?.username}!</h2>
            <p>Ready to continue your adventure?</p>
            <div className="home-actions">
              <a href="/my-characters" className="btn-primary">
                View My Characters
              </a>
              <a href="/character/create" className="btn-secondary">
                Create New Character
              </a>
            </div>
          </div>
        ) : (
          <div className="hero-content">
            <p>Create your character profile, share your adventure photos, and connect with fellow adventurers!</p>
            <div className="home-actions">
              <a href="/register" className="btn-primary">
                Join the Campaign
              </a>
              <a href="/login" className="btn-secondary">
                Login
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Dice Roller */}
      <DiceRoller />

      <div className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Character Profiles</h3>
            <p>Create detailed profiles with D&D stats, bios, and profile pictures</p>
          </div>
          <div className="feature-card">
            <h3>Wall Comments</h3>
            <p>MySpace-style public commenting on character profiles</p>
          </div>
          <div className="feature-card">
            <h3>Photo Albums</h3>
            <p>Share campaign moments and character art in galleries</p>
          </div>
          <div className="feature-card">
            <h3>Music Playlists</h3>
            <p>Add character theme songs with Spotify & SoundCloud embeds</p>
          </div>
        </div>
      </div>

      {/* Campaign Directory */}
      <div style={{ marginTop: '40px' }}>
        <CharacterList showOnlyMine={false} />
      </div>
    </div>
  );
};

export default Home;
