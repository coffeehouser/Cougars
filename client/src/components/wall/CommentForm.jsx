import { useState } from 'react';
import { toast } from 'react-toastify';
import commentService from '../../services/commentService';
import './CommentForm.css';

const CommentForm = ({
  characterId,
  userCharacters,
  onCommentPosted,
  parentCommentId = null,
  onCancel = null,
  isReply = false
}) => {
  const [content, setContent] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(
    userCharacters.length > 0 ? userCharacters[0]._id : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedFile) {
      toast.error('Please enter a comment or attach a photo');
      return;
    }

    if (!selectedCharacter) {
      toast.error('Please select a character');
      return;
    }

    setSubmitting(true);

    try {
      await commentService.createComment({
        characterId,
        authorCharacterId: selectedCharacter,
        content: content.trim(),
        parentCommentId,
        photo: selectedFile
      });

      toast.success(isReply ? 'Reply posted!' : 'Comment posted!');
      setContent('');
      removePhoto();
      onCommentPosted();
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = content.length;
  const maxLength = 1000;

  return (
    <form onSubmit={handleSubmit} className={`comment-form ${isReply ? 'comment-form-reply' : ''}`}>
      <div className="comment-form-header">
        <label htmlFor="character-select">
          {isReply ? 'Reply as:' : 'Comment as:'}
        </label>
        <select
          id="character-select"
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          className="character-select"
          disabled={submitting}
        >
          {userCharacters.map(char => (
            <option key={char._id} value={char._id}>
              {char.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? 'Write a reply...' : 'Leave a comment on this wall...'}
        className="comment-textarea"
        maxLength={maxLength}
        disabled={submitting}
        rows={isReply ? 3 : 4}
      />

      {previewUrl && (
        <div className="photo-preview">
          <img src={previewUrl} alt="Preview" />
          <button
            type="button"
            onClick={removePhoto}
            className="remove-photo-btn"
            disabled={submitting}
          >
            ×
          </button>
        </div>
      )}

      <div className="comment-form-footer">
        <div className="comment-form-footer-left">
          <label className="photo-attach-btn" title="Attach photo">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting}
              style={{ display: 'none' }}
            />
            📷
          </label>
          <span className={`character-count ${characterCount > maxLength * 0.9 ? 'character-count-warning' : ''}`}>
            {characterCount} / {maxLength}
          </span>
        </div>
        <div className="comment-form-actions">
          {isReply && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary btn-small"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary btn-small"
            disabled={submitting || (!content.trim() && !selectedFile)}
          >
            {submitting ? 'Posting...' : (isReply ? 'Reply' : 'Post')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
