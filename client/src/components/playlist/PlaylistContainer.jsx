import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import playlistService from '../../services/playlistService';
import AddSongForm from './AddSongForm';
import SongList from './SongList';
import LoadingSpinner from '../common/LoadingSpinner';
import './Playlist.css';

const PlaylistContainer = ({ characterId, isOwner }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    loadPlaylist();
  }, [characterId]);

  useEffect(() => {
    // Auto-play first song if enabled
    if (playlist && playlist.autoPlay && playlist.songs.length > 0 && currentSongIndex === 0) {
      setAutoPlay(true);
    }
  }, [playlist]);

  const loadPlaylist = async () => {
    try {
      const data = await playlistService.getPlaylistByCharacter(characterId);
      if (data) {
        setPlaylist(data.playlist);
      }
    } catch (error) {
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const data = await playlistService.createOrUpdatePlaylist({
        characterId,
        title: 'My Playlist',
        autoPlay: true
      });
      setPlaylist(data.playlist);
      toast.success('Playlist created!');
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleAddSong = async (songData) => {
    try {
      const data = await playlistService.addSong(playlist._id, songData);
      setPlaylist(data.playlist);
      setShowAddForm(false);
      toast.success('Song added to playlist!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add song');
    }
  };

  const handleRemoveSong = async (songId) => {
    if (!window.confirm('Remove this song from the playlist?')) {
      return;
    }

    try {
      const data = await playlistService.removeSong(playlist._id, songId);
      setPlaylist(data.playlist);
      toast.success('Song removed from playlist');

      // If current song was removed, reset to first song
      if (playlist.songs.findIndex(s => s._id === songId) === currentSongIndex) {
        setCurrentSongIndex(0);
      }
    } catch (error) {
      toast.error('Failed to remove song');
    }
  };

  const handleReorderSongs = async (reorderedSongs) => {
    try {
      const songIds = reorderedSongs.map(s => s._id);
      const data = await playlistService.reorderSongs(playlist._id, songIds);
      setPlaylist(data.playlist);
      toast.success('Playlist reordered');
    } catch (error) {
      toast.error('Failed to reorder playlist');
    }
  };

  const handleToggleAutoPlay = async () => {
    try {
      const newAutoPlay = !playlist.autoPlay;
      const data = await playlistService.createOrUpdatePlaylist({
        characterId,
        title: playlist.title,
        description: playlist.description,
        autoPlay: newAutoPlay
      });
      setPlaylist(data.playlist);
      toast.success(`Auto-play ${newAutoPlay ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update auto-play setting');
    }
  };

  const handlePlaySong = (index) => {
    setCurrentSongIndex(index);
    setAutoPlay(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading playlist..." />;
  }

  // No playlist exists
  if (!playlist) {
    return (
      <div className="playlist-empty">
        <p>No playlist yet.</p>
        {isOwner && (
          <button type="button" onClick={handleCreatePlaylist} className="btn-primary">
            Create Playlist
          </button>
        )}
      </div>
    );
  }

  // Playlist exists but no songs
  if (playlist.songs.length === 0) {
    return (
      <div className="playlist-container">
        <div className="playlist-header">
          <h3>{playlist.title}</h3>
          {isOwner && (
            <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="btn-primary btn-small">
              {showAddForm ? 'Cancel' : 'Add Song'}
            </button>
          )}
        </div>

        {showAddForm && (
          <AddSongForm onAddSong={handleAddSong} onCancel={() => setShowAddForm(false)} />
        )}

        <div className="playlist-empty">
          <p>No songs in playlist yet.</p>
        </div>
      </div>
    );
  }

  const currentSong = playlist.songs[currentSongIndex];

  return (
    <div className="playlist-container">
      {isOwner && (
        <div className="playlist-owner-actions">
          <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="btn-primary btn-small">
            {showAddForm ? 'Cancel' : '+ Add Song'}
          </button>
        </div>
      )}

      {showAddForm && (
        <AddSongForm onAddSong={handleAddSong} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Compact Now Playing Widget */}
      {currentSong && (
        <div className="now-playing-widget">
          <div className="now-playing-info">
            <div className="now-playing-icon">🎵</div>
            <div className="now-playing-details">
              <h4 className="now-playing-title">{currentSong.title}</h4>
              {currentSong.artist && <p className="now-playing-artist">{currentSong.artist}</p>}
            </div>
          </div>
          <div className="embed-container-mini">
            <iframe
              ref={iframeRef}
              src={`${currentSong.embedUrl}${autoPlay && currentSongIndex === 0 ? '?autoplay=1' : ''}`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={currentSong.title}
            />
          </div>
        </div>
      )}

      {/* Song List */}
      <SongList
        songs={playlist.songs}
        currentSongIndex={currentSongIndex}
        isOwner={isOwner}
        onPlaySong={handlePlaySong}
        onRemoveSong={handleRemoveSong}
        onReorderSongs={handleReorderSongs}
      />
    </div>
  );
};

export default PlaylistContainer;
