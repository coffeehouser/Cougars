import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import commentService from '../../services/commentService';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import LoadingSpinner from '../common/LoadingSpinner';
import './Wall.css';

const Wall = ({ characterId, userCharacters }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadComments();
  }, [characterId]);

  const loadComments = async () => {
    try {
      const data = await commentService.getCharacterComments(characterId);
      setComments(data.comments);
    } catch (error) {

      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCommentPosted = async () => {
    setRefreshing(true);
    await loadComments();
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
    toast.success('Comment deleted successfully');
  };

  const handleCommentUpdated = async (updatedComment) => {
    // Reload all comments to get fresh data including new replies
    setRefreshing(true);
    await loadComments();
  };

  if (loading) {
    return <LoadingSpinner message="Loading wall..." />;
  }

  return (
    <div className="wall-container">
      <h2 className="wall-title">Wall</h2>

      {userCharacters && userCharacters.length > 0 && (
        <CommentForm
          characterId={characterId}
          userCharacters={userCharacters}
          onCommentPosted={handleCommentPosted}
        />
      )}

      <CommentList
        comments={comments}
        userCharacters={userCharacters}
        onCommentDeleted={handleCommentDeleted}
        onCommentUpdated={handleCommentUpdated}
        refreshing={refreshing}
      />
    </div>
  );
};

export default Wall;
