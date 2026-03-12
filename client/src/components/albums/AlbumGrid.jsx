import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import albumService from '../../services/albumService';
import LoadingSpinner from '../common/LoadingSpinner';
import './AlbumGrid.css';

const AlbumGrid = ({ characterId, isOwner, onCreateAlbum }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, [characterId]);

  const loadAlbums = async () => {
    try {
      const data = await albumService.getCharacterAlbums(characterId);
      setAlbums(data.albums);
    } catch (error) {

      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (albumId, albumTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${albumTitle}" and all its photos?`)) {
      return;
    }

    try {
      await albumService.deleteAlbum(albumId);
      setAlbums(albums.filter(a => a._id !== albumId));
      toast.success('Album deleted successfully');
    } catch (error) {

      toast.error('Failed to delete album');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading albums..." />;
  }

  return (
    <div className="album-grid-container">
      <div className="album-grid-header">
        <h2>Photo Albums</h2>
        {isOwner && (
          <button type="button" onClick={onCreateAlbum} className="btn-primary btn-small">
            Create Album
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="albums-empty">
          <p>{isOwner ? 'No albums yet. Create your first album!' : 'No albums to display.'}</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map(album => (
            <div key={album._id} className="album-card">
              <Link to={`/album/${album._id}`} className="album-link">
                <div className="album-cover">
                  {album.coverPhoto ? (
                    <img src={album.coverPhoto.imageUrl} alt={album.title} />
                  ) : (
                    <div className="album-cover-placeholder">
                      <span>No Photos</span>
                    </div>
                  )}
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <p className="album-photo-count">{album.photoCount} photos</p>
                  {album.description && (
                    <p className="album-description">{album.description}</p>
                  )}
                </div>
              </Link>
              {isOwner && (
                <div className="album-actions">
                  <Link to={`/album/${album._id}`} className="album-action-btn">
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(album._id, album.title)}
                    className="album-action-btn album-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumGrid;
