import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import albumService from '../services/albumService';
import PhotoGallery from '../components/albums/PhotoGallery';
import PhotoUpload from '../components/albums/PhotoUpload';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AlbumView.css';

const AlbumView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    try {
      const data = await albumService.getAlbum(id);
      setAlbum(data.album);
      setPhotos(data.photos);
      setIsOwner(user && data.album.character.owner === user.id);
    } catch (error) {

      toast.error('Failed to load album');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadAlbum();
  };

  const handlePhotosUpdated = () => {
    loadAlbum();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${album.title}" and all its photos?`)) {
      return;
    }

    try {
      await albumService.deleteAlbum(id);
      toast.success('Album deleted successfully');
      navigate(`/character/${album.character._id}`);
    } catch (error) {

      toast.error('Failed to delete album');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading album..." />;
  }

  if (!album) {
    return (
      <div className="error-container">
        <h2>Album not found</h2>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="album-view">
      <div className="album-header">
        <div className="album-header-left">
          <Link to={`/character/${album.character._id}`} className="back-link">
            ← Back to {album.character.name}
          </Link>
          <h1>{album.title}</h1>
          {album.description && <p className="album-description-full">{album.description}</p>}
          <p className="album-meta">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isOwner && (
          <div className="album-header-actions">
            <button
              type="button"
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary"
            >
              {showUpload ? 'Hide Upload' : 'Add Photos'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-danger"
            >
              Delete Album
            </button>
          </div>
        )}
      </div>

      {showUpload && isOwner && (
        <div className="upload-section">
          <PhotoUpload albumId={id} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      <PhotoGallery
        photos={photos}
        isOwner={isOwner}
        onPhotosUpdated={handlePhotosUpdated}
      />
    </div>
  );
};

export default AlbumView;
