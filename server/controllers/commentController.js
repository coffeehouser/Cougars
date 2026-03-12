const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Character = require('../models/Character');

// @desc    Get wall comments for a character with nested replies
// @route   GET /api/comments/character/:characterId
// @access  Public
exports.getCharacterComments = async (req, res, next) => {
  try {
    // Get all top-level comments (no parent)
    const topLevelComments = await Comment.find({
      character: req.params.characterId,
      parentComment: null
    })
      .populate('author', 'name profileImage myspaceUrl')
      .sort({ createdAt: -1 });

    // Get all replies for these comments
    const commentIds = topLevelComments.map(c => c._id);
    const replies = await Comment.find({
      parentComment: { $in: commentIds }
    })
      .populate('author', 'name profileImage myspaceUrl')
      .sort({ createdAt: 1 });

    // Organize replies under their parent comments
    const commentsWithReplies = topLevelComments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.replies = replies.filter(
        reply => reply.parentComment.toString() === comment._id.toString()
      );
      return commentObj;
    });

    res.json({ comments: commentsWithReplies });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a comment or reply
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { characterId, authorCharacterId, content, parentCommentId } = req.body;

    // Require either content or photo
    if (!content && !req.file) {
      return res.status(400).json({ message: 'Comment must have either text content or a photo' });
    }

    // Verify the character exists
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Verify the author character exists and belongs to the user
    const authorCharacter = await Character.findById(authorCharacterId);
    if (!authorCharacter) {
      return res.status(404).json({ message: 'Author character not found' });
    }

    if (authorCharacter.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to comment as this character' });
    }

    // If replying to a comment, verify parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    // Prepare comment data
    const commentData = {
      character: characterId,
      author: authorCharacterId,
      content: content || '',
      parentComment: parentCommentId || null
    };

    // Add photo if uploaded
    if (req.file) {
      commentData.photo = {
        imageUrl: `/uploads/photos/${req.file.filename}`,
        filename: req.file.filename
      };
    }

    const comment = await Comment.create(commentData);

    // Populate author details
    await comment.populate('author', 'name profileImage myspaceUrl');

    res.status(201).json({
      message: 'Comment posted successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
exports.updateComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id).populate('author');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the author character
    if (comment.author.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'name profileImage myspaceUrl');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author or profile owner)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author')
      .populate('character');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is either the comment author or the character profile owner
    const isAuthor = comment.author.owner.toString() === req.user._id.toString();
    const isProfileOwner = comment.character.owner.toString() === req.user._id.toString();

    if (!isAuthor && !isProfileOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete photo file if exists
    if (comment.photo && comment.photo.filename) {
      const fs = require('fs');
      const path = require('path');
      try {
        const filePath = path.join(__dirname, '../../uploads/photos', comment.photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete comment photo file: ${comment.photo.filename}`, error);
      }
    }

    // Delete all replies to this comment
    if (!comment.parentComment) {
      const replies = await Comment.find({ parentComment: comment._id });
      // Delete photos for replies too
      for (const reply of replies) {
        if (reply.photo && reply.photo.filename) {
          const fs = require('fs');
          const path = require('path');
          try {
            const filePath = path.join(__dirname, '../../uploads/photos', reply.photo.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error(`Failed to delete reply photo file: ${reply.photo.filename}`, error);
          }
        }
      }
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get replies to a comment
// @route   GET /api/comments/:id/replies
// @access  Public
exports.getCommentReplies = async (req, res, next) => {
  try {
    const replies = await Comment.find({
      parentComment: req.params.id
    })
      .populate('author', 'name profileImage myspaceUrl')
      .sort({ createdAt: 1 });

    res.json({ replies });
  } catch (error) {
    next(error);
  }
};
