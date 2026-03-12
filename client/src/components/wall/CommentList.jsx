import CommentItem from './CommentItem';
import './CommentList.css';

const CommentList = ({
  comments,
  userCharacters,
  onCommentDeleted,
  onCommentUpdated,
  refreshing
}) => {
  if (refreshing) {
    return (
      <div className="comments-list">
        <div className="comments-loading">Loading comments...</div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="comments-list">
        <div className="comments-empty">
          <p>No comments yet. Be the first to leave a comment!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          userCharacters={userCharacters}
          onCommentDeleted={onCommentDeleted}
          onCommentUpdated={onCommentUpdated}
        />
      ))}
    </div>
  );
};

export default CommentList;
