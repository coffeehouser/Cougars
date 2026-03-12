import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import photoService from '../../services/photoService';
import './PhotoGallery.css';

const PhotoGallery = ({ photos, isOwner, onPhotosUpdated, userCharacters }) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [likeDetails, setLikeDetails] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [photoComments, setPhotoComments] = useState([]);
  const [showLikesModal, setShowLikesModal] = useState(false);

  useEffect(() => {
    if (userCharacters && userCharacters.length > 0) {
      setSelectedCharacter(userCharacters[0]._id);
    }
  }, [userCharacters]);

  useEffect(() => {
    if (selectedPhoto) {
      loadLikes(selectedPhoto._id);
      loadComments();
    }
  }, [selectedPhoto]);

  const loadLikes = async (photoId) => {
    try {
      const data = await photoService.getPhotoLikes(photoId);
      setLikeDetails({
        likes: data.likes || [],
        likeCount: data.likeCount || 0
      });
    } catch (error) {

    }
  };

  const loadComments = () => {
    if (selectedPhoto && selectedPhoto.comments) {
      setPhotoComments(selectedPhoto.comments);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setSelectedPhoto(photos[index]);
    setCaptionText(photos[index].caption || '');
    setShowComments(false);
    setEditingCaption(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setSelectedPhoto(null);
    setEditingCaption(false);
    setShowComments(false);
    setShowLikesModal(false);
  };

  const nextPhoto = () => {
    const nextIndex = (lightboxIndex + 1) % photos.length;
    setLightboxIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);
    setCaptionText(photos[nextIndex].caption || '');
    setEditingCaption(false);
    setShowComments(false);
  };

  const prevPhoto = () => {
    const prevIndex = (lightboxIndex - 1 + photos.length) % photos.length;
    setLightboxIndex(prevIndex);
    setSelectedPhoto(photos[prevIndex]);
    setCaptionText(photos[prevIndex].caption || '');
    setEditingCaption(false);
    setShowComments(false);
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await photoService.deletePhoto(photoId);
      toast.success('Photo deleted successfully');
      closeLightbox();
      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to delete photo');
    }
  };

  const handleLike = async () => {
    if (!selectedCharacter) {
      toast.error('Please select a character');
      return;
    }

    try {
      const data = await photoService.toggleLike(selectedPhoto._id, selectedCharacter);

      // Update local state optimistically
      setLikeDetails({
        likes: data.liked
          ? [...(likeDetails.likes || []), { _id: selectedCharacter }]
          : (likeDetails.likes || []).filter(like => like._id !== selectedCharacter),
        likeCount: data.likeCount
      });

      // Reload to get full data
      await loadLikes(selectedPhoto._id);

      // Update the photo in the parent component
      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to like photo');
    }
  };

  const handleSaveCaption = async () => {
    try {
      await photoService.updateCaption(selectedPhoto._id, captionText);
      toast.success('Caption updated successfully');
      setEditingCaption(false);

      // Update local state
      setSelectedPhoto({ ...selectedPhoto, caption: captionText });

      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to update caption');
    }
  };

  const handleRemoveTag = async (characterId) => {
    if (!window.confirm('Remove this character tag?')) {
      return;
    }

    try {
      await photoService.removeTag(selectedPhoto._id, characterId);
      toast.success('Tag removed successfully');

      // Update local state
      setSelectedPhoto({
        ...selectedPhoto,
        taggedCharacters: selectedPhoto.taggedCharacters.filter(
          char => char._id !== characterId
        )
      });

      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to remove tag');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!selectedCharacter) {
      toast.error('Please select a character');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const data = await photoService.addComment(
        selectedPhoto._id,
        selectedCharacter,
        commentText
      );

      toast.success('Comment added');
      setCommentText('');

      // Add comment to local state
      setPhotoComments([...photoComments, data.comment]);

      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      await photoService.deleteComment(selectedPhoto._id, commentId);
      toast.success('Comment deleted');

      // Remove comment from local state
      setPhotoComments(photoComments.filter(c => c._id !== commentId));

      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {

      toast.error('Failed to delete comment');
    }
  };

  const isUserLiked = () => {
    if (!selectedCharacter || !likeDetails.likes) return false;
    return likeDetails.likes.some(like => like._id === selectedCharacter);
  };

  if (photos.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="photo-gallery-grid">
        {photos.map((photo, index) => (
          <div
            key={photo._id}
            className="gallery-item"
            onClick={() => openLightbox(index)}
          >
            <img src={photo.imageUrl} alt={photo.caption || `Photo ${index + 1}`} />
            <div className="gallery-item-overlay">
              <span className="gallery-item-likes">
                ❤️ {photo.likeCount || 0}
              </span>
              <span className="gallery-item-comments">
                💬 {photo.comments?.length || 0}
              </span>
            </div>
            {photo.caption && (
              <div className="gallery-item-caption">{photo.caption}</div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && selectedPhoto && (
        <div className="lightbox" onClick={closeLightbox}>
          <button type="button" className="lightbox-close" onClick={closeLightbox}>
            ×
          </button>

          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
          >
            ‹
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-container">
              <img src={selectedPhoto.imageUrl} alt={selectedPhoto.caption || 'Photo'} />
            </div>

            <div className="lightbox-sidebar">
              {/* Caption Section */}
              <div className="lightbox-section">
                {editingCaption ? (
                  <div className="caption-edit">
                    <textarea
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Add a caption..."
                      maxLength={500}
                      rows={3}
                    />
                    <div className="caption-edit-actions">
                      <button type="button" onClick={handleSaveCaption} className="btn-primary btn-small">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingCaption(false)} className="btn-secondary btn-small">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="caption-display">
                    <p>{selectedPhoto.caption || 'No caption'}</p>
                    {isOwner && (
                      <button type="button" onClick={() => setEditingCaption(true)} className="btn-text">
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tagged Characters */}
              {selectedPhoto.taggedCharacters && selectedPhoto.taggedCharacters.length > 0 && (
                <div className="lightbox-section">
                  <h4>Tagged Characters</h4>
                  <div className="tagged-characters">
                    {selectedPhoto.taggedCharacters.map(char => (
                      <div key={char._id} className="tagged-character">
                        <Link to={`/character/${char._id}`} className="tagged-character-link">
                          {char.name}
                        </Link>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(char._id)}
                            className="btn-remove-tag"
                            title="Remove tag"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Likes Section */}
              <div className="lightbox-section">
                <div className="likes-header">
                  <button
                    type="button"
                    onClick={() => setShowLikesModal(!showLikesModal)}
                    className="btn-text"
                  >
                    ❤️ {likeDetails.likeCount || 0} {likeDetails.likeCount === 1 ? 'like' : 'likes'}
                  </button>
                </div>

                {user && userCharacters && userCharacters.length > 0 && (
                  <div className="like-actions">
                    <select
                      value={selectedCharacter || ''}
                      onChange={(e) => setSelectedCharacter(e.target.value)}
                      className="character-select"
                    >
                      {userCharacters.map(char => (
                        <option key={char._id} value={char._id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleLike}
                      className={`btn-like ${isUserLiked() ? 'liked' : ''}`}
                    >
                      {isUserLiked() ? '❤️ Unlike' : '🤍 Like'}
                    </button>
                  </div>
                )}

                {showLikesModal && likeDetails.likes && likeDetails.likes.length > 0 && (
                  <div className="likes-modal">
                    <h5>Liked by</h5>
                    <ul>
                      {likeDetails.likes.map(like => (
                        <li key={like._id}>
                          <Link to={`/character/${like._id}`}>
                            {like.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="lightbox-section">
                <button
                  type="button"
                  onClick={() => setShowComments(!showComments)}
                  className="btn-text comments-toggle"
                >
                  💬 {photoComments.length} {photoComments.length === 1 ? 'comment' : 'comments'}
                </button>

                {showComments && (
                  <div className="comments-section">
                    {/* Comment Form */}
                    {user && userCharacters && userCharacters.length > 0 && (
                      <form onSubmit={handleAddComment} className="comment-form">
                        <select
                          value={selectedCharacter || ''}
                          onChange={(e) => setSelectedCharacter(e.target.value)}
                          className="character-select"
                        >
                          {userCharacters.map(char => (
                            <option key={char._id} value={char._id}>
                              {char.name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          maxLength={1000}
                          rows={2}
                        />
                        <button type="submit" className="btn-primary btn-small">
                          Post Comment
                        </button>
                      </form>
                    )}

                    {/* Comments List */}
                    <div className="comments-list">
                      {photoComments.length === 0 ? (
                        <p className="no-comments">No comments yet.</p>
                      ) : (
                        photoComments.map(comment => (
                          <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                              <Link to={`/character/${comment.author._id}`} className="comment-author">
                                {comment.author.name}
                              </Link>
                              <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                            {user && userCharacters && userCharacters.some(
                              char => char._id === comment.author._id
                            ) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                className="btn-text btn-delete-comment"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Photo */}
              {isOwner && (
                <div className="lightbox-section">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedPhoto._id)}
                    className="btn-danger btn-small"
                  >
                    Delete Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            ›
          </button>

          <div className="lightbox-counter">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
