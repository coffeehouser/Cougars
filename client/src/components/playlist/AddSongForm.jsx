import { useState } from 'react';
import './Playlist.css';

const AddSongForm = ({ onAddSong, onCancel }) => {
  const [formData, setFormData] = useState({
    platform: 'youtube',
    url: '',
    title: '',
    artist: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.url.trim() || !formData.title.trim()) {
      return;
    }

    onAddSong(formData);

    // Reset form
    setFormData({
      platform: 'youtube',
      url: '',
      title: '',
      artist: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="add-song-form">
      <h4>Add Song to Playlist</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="platform">Platform *</label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            required
          >
            <option value="youtube">YouTube</option>
            <option value="spotify">Spotify</option>
            <option value="soundcloud">SoundCloud</option>
            <option value="amazon-music">Amazon Music</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="url">Song URL *</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder={
              formData.platform === 'youtube'
                ? 'https://www.youtube.com/watch?v=...'
                : formData.platform === 'spotify'
                ? 'https://open.spotify.com/track/...'
                : formData.platform === 'soundcloud'
                ? 'https://w.soundcloud.com/player/?url=...'
                : 'https://music.amazon.com/embed/...'
            }
            required
          />
          <small className="form-help">
            {formData.platform === 'youtube' && 'Paste the YouTube video URL'}
            {formData.platform === 'spotify' && 'Paste the Spotify track URL'}
            {formData.platform === 'soundcloud' && 'Click Share > Embed, then copy the URL from the embed code'}
            {formData.platform === 'amazon-music' && 'Click Share > Embed, then copy the embed URL'}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="title">Song Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter song title"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist (Optional)</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            placeholder="Enter artist name"
            maxLength={200}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Add Song
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSongForm;
