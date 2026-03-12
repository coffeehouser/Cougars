import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import characterService from '../../services/characterService';
import albumService from '../../services/albumService';
import StatBlock from './StatBlock';
import Wall from '../wall/Wall';
import PhotoGallery from '../albums/PhotoGallery';
import PhotoUpload from '../albums/PhotoUpload';
import PlaylistContainer from '../playlist/PlaylistContainer';
import LoadingSpinner from '../common/LoadingSpinner';
import BannerEditor from './BannerEditor';
import './CharacterProfile.css';

const CharacterProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [userCharacters, setUserCharacters] = useState([]);
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [bannerPosition, setBannerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadCharacter();
    loadAlbumAndPhotos();
    if (user) {
      loadUserCharacters();
    }
  }, [id, user]);

  const loadCharacter = async () => {
    try {
      const data = await characterService.getCharacterById(id);
      setCharacter(data.character);
      setIsOwner(user && data.character.owner._id === user.id);

      // Increment view count
      await characterService.incrementViewCount(id);
    } catch (error) {
      toast.error('Failed to load character');

    } finally {
      setLoading(false);
    }
  };

  const loadUserCharacters = async () => {
    try {
      const data = await characterService.getMyCharacters();
      setUserCharacters(data.characters);
    } catch (error) {

    }
  };

  const loadAlbumAndPhotos = async () => {
    try {
      const data = await albumService.getCharacterAlbums(id);
      if (data.albums && data.albums.length > 0) {
        const characterAlbum = data.albums[0]; // Get the auto-created album
        setAlbum(characterAlbum);
        setPhotos(characterAlbum.photos || []);
      } else if (isOwner && character) {
        // Auto-create album for existing character that doesn't have one
        try {
          const newAlbumData = await albumService.createAlbum({
            characterId: id,
            title: `${character.name}'s Photos`,
            description: 'Character photo album'
          });
          setAlbum(newAlbumData.album);
          setPhotos([]);
        } catch (createError) {

        }
      }
    } catch (error) {

    }
  };

  const handleUploadComplete = () => {
    loadAlbumAndPhotos(); // Reload photos after upload
    setShowUpload(false);
  };

  const handlePhotoDeleted = () => {
    loadAlbumAndPhotos(); // Reload photos after deletion
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }

    try {
      await characterService.deleteCharacter(id);
      toast.success('Character deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete character');
    }
  };

  const handleBannerSave = async (bannerData) => {
    try {
      // Store the position in localStorage for this character
      const positionKey = `banner-position-${id}`;
      localStorage.setItem(positionKey, JSON.stringify(bannerData.position));

      setBannerPosition(bannerData.position);
      setShowBannerEditor(false);
      toast.success('Banner position saved!');
    } catch (error) {

      toast.error('Failed to save banner position');
    }
  };

  // Load banner position from localStorage
  useEffect(() => {
    if (character) {
      const positionKey = `banner-position-${id}`;
      const savedPosition = localStorage.getItem(positionKey);
      if (savedPosition) {
        setBannerPosition(JSON.parse(savedPosition));
      }
    }
  }, [character, id]);

  if (loading) {
    return <LoadingSpinner message="Loading character..." />;
  }

  if (!character) {
    return (
      <div className="error-container">
        <h2>Character not found</h2>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="character-profile">
      {/* Banner */}
      <div
        className="profile-banner"
        style={{
          backgroundImage: `url(${character.bannerImage})`,
          backgroundPosition: `${bannerPosition.x}px ${bannerPosition.y}px`
        }}
      >
        <div className="banner-overlay">
          <div className="profile-header-content">
            <img
              src={character.profileImage}
              alt={character.name}
              className="profile-image"
            />
            <div className="profile-title">
              <h1>{character.name}</h1>
              <p className="profile-subtitle">
                Level {character.level} {character.race} {character.class}
              </p>
              <p className="profile-views">Profile Views: {character.profileViews}</p>
            </div>
          </div>
          {isOwner && character.bannerImage && (
            <button
              className="adjust-banner-btn"
              onClick={() => setShowBannerEditor(true)}
              title="Adjust banner position"
              type="button"
            >
              🖼️ Adjust Banner
            </button>
          )}
        </div>
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <div className="owner-actions">
          <Link to={`/character/${id}/edit`} className="btn-secondary">
            Edit Character
          </Link>
          <button type="button" onClick={handleDelete} className="btn-danger">
            Delete Character
          </button>
        </div>
      )}

      {/* Banner Editor Modal */}
      {showBannerEditor && (
        <BannerEditor
          currentBanner={character.bannerImage}
          onSave={handleBannerSave}
          onCancel={() => setShowBannerEditor(false)}
        />
      )}

      {/* Main Content */}
      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <StatBlock stats={character.stats} />

          <div className="info-section">
            <h3>Details</h3>
            <div className="detail-item">
              <span className="detail-label">Background:</span>
              <span className="detail-value">{character.background || 'None'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Alignment:</span>
              <span className="detail-value">{character.alignment}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created by:</span>
              <span className="detail-value">{character.owner.username}</span>
            </div>
          </div>

          {character.topFriends && character.topFriends.length > 0 && (
            <div className="top-friends">
              <h3>Top Friends</h3>
              <div className="friends-grid">
                {character.topFriends.map(friend => (
                  <Link
                    key={friend._id}
                    to={`/character/${friend._id}`}
                    className="friend-card"
                  >
                    <img src={friend.profileImage} alt={friend.name} />
                    <span>{friend.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="playlist-section sidebar-section">
            <h3>Music Playlist</h3>
            <PlaylistContainer characterId={id} isOwner={isOwner} />
          </div>

          <div className="photos-section sidebar-section">
            <div className="section-header">
              <h3>Photos</h3>
              {isOwner && album && (
                <button
                  type="button"
                  onClick={() => setShowUpload(!showUpload)}
                  className="btn-add-photos"
                >
                  {showUpload ? '−' : '+'}
                </button>
              )}
            </div>

            {showUpload && album && (
              <PhotoUpload
                albumId={album._id}
                onUploadComplete={handleUploadComplete}
              />
            )}

            {photos.length > 0 ? (
              <>
                <PhotoGallery
                  photos={photos.slice(0, 3)}
                  isOwner={isOwner}
                  onPhotosUpdated={loadAlbumAndPhotos}
                  userCharacters={userCharacters}
                />
                {photos.length > 3 && album && (
                  <Link to={`/album/${album._id}`} className="see-all-photos-btn">
                    See All Photos ({photos.length})
                  </Link>
                )}
              </>
            ) : (
              <p className="no-content">No photos yet.</p>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main">
          <div className="bio-section">
            <h2>Biography</h2>
            <div className="bio-content">
              {character.bio ? (
                <p>{character.bio}</p>
              ) : (
                <p className="no-content">No biography yet.</p>
              )}
            </div>
          </div>

          <Wall characterId={id} userCharacters={userCharacters} />
        </main>
      </div>
    </div>
  );
};

export default CharacterProfile;
