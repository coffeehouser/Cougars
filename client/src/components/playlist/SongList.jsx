import { useState } from 'react';
import './Playlist.css';

const SongList = ({ songs, currentSongIndex, isOwner, onPlaySong, onRemoveSong, onReorderSongs }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    if (!isOwner) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (!isOwner) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    if (!isOwner) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    if (!isOwner) return;
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the songs
    const reorderedSongs = [...songs];
    const [draggedSong] = reorderedSongs.splice(draggedIndex, 1);
    reorderedSongs.splice(dropIndex, 0, draggedSong);

    // Update order property
    const updatedSongs = reorderedSongs.map((song, index) => ({
      ...song,
      order: index
    }));

    onReorderSongs(updatedSongs);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="song-list">
      <h4>Playlist ({songs.length} {songs.length === 1 ? 'song' : 'songs'})</h4>
      <div className="songs">
        {songs.map((song, index) => (
          <div
            key={song._id}
            className={`song-item ${index === currentSongIndex ? 'playing' : ''} ${
              dragOverIndex === index ? 'drag-over' : ''
            } ${draggedIndex === index ? 'dragging' : ''}`}
            draggable={isOwner}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="song-info">
              {isOwner && (
                <span className="drag-handle" title="Drag to reorder">
                  ⋮⋮
                </span>
              )}
              <span className="song-number">{index + 1}.</span>
              <div className="song-details">
                <div className="song-title">{song.title}</div>
                {song.artist && <div className="song-artist">{song.artist}</div>}
              </div>
            </div>
            <div className="song-actions">
              <button
                type="button"
                onClick={() => onPlaySong(index)}
                className="btn-play"
                title="Play this song"
              >
                {index === currentSongIndex ? '🔊' : '▶️'}
              </button>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onRemoveSong(song._id)}
                  className="btn-remove"
                  title="Remove from playlist"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {isOwner && songs.length > 1 && (
        <p className="drag-help">💡 Tip: Drag songs to reorder your playlist</p>
      )}
    </div>
  );
};

export default SongList;
