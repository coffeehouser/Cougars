import { useState } from 'react';
import { toast } from 'react-toastify';
import albumService from '../../services/albumService';
import './CreateAlbumModal.css';

const CreateAlbumModal = ({ characterId, onClose, onAlbumCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an album title');
      return;
    }

    setSubmitting(true);

    try {
      const response = await albumService.createAlbum({
        characterId,
        title: title.trim(),
        description: description.trim()
      });

      toast.success('Album created successfully!');
      if (onAlbumCreated) {
        onAlbumCreated(response.album);
      }
      onClose();
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to create album');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>

        <h2>Create New Album</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="album-title">Album Title *</label>
            <input
              id="album-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter album title"
              maxLength={100}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="album-description">Description (optional)</label>
            <textarea
              id="album-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this album"
              maxLength={500}
              rows={4}
              disabled={submitting}
            />
            <span className="character-count">
              {description.length} / 500
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbumModal;
