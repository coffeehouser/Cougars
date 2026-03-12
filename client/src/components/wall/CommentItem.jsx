import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import commentService from '../../services/commentService';
import CommentForm from './CommentForm';
import './CommentItem.css';

const CommentItem = ({
  comment,
  userCharacters,
  onCommentDeleted,
  onCommentUpdated,
  isReply = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  // Check if current user owns the comment author character
  const isCommentAuthor = userCharacters?.some(
    char => char._id === comment.author._id
  );

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(comment._id);
      onCommentDeleted(comment._id);
    } catch (error) {

      toast.error('Failed to delete comment');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      const response = await commentService.updateComment(comment._id, editContent.trim());
      onCommentUpdated(response.comment);
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (error) {

      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyPosted = () => {
    setShowReplyForm(false);
    // Trigger parent refresh
    onCommentUpdated(comment);
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  return (
    <div className={`comment-item ${isReply ? 'comment-item-reply' : ''}`}>
      <Link to={`/character/${comment.author._id}`} className="comment-author-link">
        <img
          src={comment.author.profileImage}
          alt={comment.author.name}
          className="comment-author-image"
        />
      </Link>

      <div className="comment-content-wrapper">
        <div className="comment-header">
          <Link to={`/character/${comment.author._id}`} className="comment-author-name">
            {comment.author.name}
          </Link>
          <span className="comment-time">{timeAgo}</span>
          {comment.isEdited && <span className="comment-edited">(edited)</span>}
        </div>

        {isEditing ? (
          <form onSubmit={handleEdit} className="comment-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-edit-textarea"
              maxLength={1000}
              disabled={submitting}
              rows={3}
            />
            <div className="comment-edit-actions">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="btn-secondary btn-small"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-small"
                disabled={submitting || !editContent.trim()}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {comment.content && <p className="comment-text">{comment.content}</p>}

            {comment.photo && comment.photo.imageUrl && (
              <div className="comment-photo">
                <img src={comment.photo.imageUrl} alt="Comment attachment" />
              </div>
            )}

            <div className="comment-actions">
              {userCharacters && userCharacters.length > 0 && !isReply && (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="comment-action-btn"
                >
                  Reply
                </button>
              )}
              {isCommentAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="comment-action-btn"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="comment-action-btn comment-delete-btn"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {showReplyForm && userCharacters && (
          <CommentForm
            characterId={comment.character}
            userCharacters={userCharacters}
            onCommentPosted={handleReplyPosted}
            parentCommentId={comment._id}
            onCancel={() => setShowReplyForm(false)}
            isReply={true}
          />
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                userCharacters={userCharacters}
                onCommentDeleted={onCommentDeleted}
                onCommentUpdated={onCommentUpdated}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
