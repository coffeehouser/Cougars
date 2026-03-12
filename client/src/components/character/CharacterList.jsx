import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import characterService from '../../services/characterService';
import LoadingSpinner from '../common/LoadingSpinner';
import './CharacterList.css';

const CharacterList = ({ showOnlyMine = false }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, [showOnlyMine]);

  const loadCharacters = async () => {
    try {
      const data = showOnlyMine
        ? await characterService.getMyCharacters()
        : await characterService.getAllCharacters();
      setCharacters(data?.characters || []);
    } catch (error) {
      console.error('Failed to load characters:', error);
      toast.error('Failed to load characters');
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading characters..." />;
  }

  if (characters.length === 0) {
    return (
      <div className="characters-empty">
        <h2>
          {showOnlyMine ? 'You haven\'t created any characters yet' : 'No characters yet'}
        </h2>
        {showOnlyMine && (
          <Link to="/character/create" className="btn-primary">
            Create Your First Character
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="characters-container">
      <h1>{showOnlyMine ? 'My Characters' : 'Campaign Directory'}</h1>
      {showOnlyMine && (
        <Link to="/character/create" className="btn-primary create-new">
          Create New Character
        </Link>
      )}

      <div className="characters-grid">
        {characters.map(character => (
          <Link
            key={character._id}
            to={`/character/${character._id}`}
            className="character-card"
          >
            <div className="card-banner" style={{ backgroundImage: `url(${character.bannerImage})` }}>
              <div className="banner-overlay-card"></div>
            </div>
            <div className="card-content">
              <img
                src={character.profileImage}
                alt={character.name}
                className="card-profile-image"
              />
              <div className="card-info">
                <h3>{character.name}</h3>
                <p className="card-subtitle">
                  Level {character.level} {character.race} {character.class}
                </p>
                {!showOnlyMine && character.owner && (
                  <p className="card-owner">by {character.owner.username}</p>
                )}
                <div className="card-stats">
                  <span>Views: {character.profileViews}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CharacterList;
