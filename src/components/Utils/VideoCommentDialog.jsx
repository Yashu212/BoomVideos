import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, X, Loader, Trash2 } from 'lucide-react';
import moment from 'moment';

// Helper function to get the correct embed URL for different video sources
const getEmbedUrl = (url) => {
  if (!url) return null;

  // YouTube URL patterns
  const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
  }

  // Vimeo URL patterns
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/|)(\d+)(?:\S+)?/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return url;
};

const VideoCommentDialog = ({ video, onClose, isDarkMode, addToast, showConfirmationDialog }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const commentsEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  const videoSrc = getEmbedUrl(video?.videoUrl);
  const isEmbed = videoSrc && (videoSrc.includes('youtube.com/embed') || videoSrc.includes('player.vimeo.com/video'));

  useEffect(() => {
    const fetchComments = async () => {
      setIsCommentsLoading(true);
      try {
        const response = await axios.get(`https://determined-peace-production.up.railway.app/api/videos/${video._id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(response.data.reverse());
      } catch (error) {
        console.error('Error fetching comments:', error);
        addToast('Failed to load comments.', 'error');
        setComments([]);
      } finally {
        setIsCommentsLoading(false);
      }
    };

    if (video?._id && token) {
      fetchComments();
    } else if (video?._id && !token) {
        addToast('Please log in to view comments.', 'info');
    }
  }, [video, token, addToast]);

  useEffect(() => {
    if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [comments]);

  const handlePostComment = async () => {
    if (!token) {
      addToast('You must be logged in to comment.', 'info');
      return;
    }
    if (!newCommentText.trim()) {
      addToast('Comment cannot be empty.', 'warning');
      return;
    }

    setIsPostingComment(true);
    try {
      const response = await axios.post(
        `https://determined-peace-production.up.railway.app/api/videos/${video._id}/comments`,
        { text: newCommentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(prevComments => [...prevComments, response.data.comment]);
      setNewCommentText('');
      addToast('Comment posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting comment:', error);
      let errorMessage = 'Failed to post comment.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      addToast(errorMessage, 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) {
      addToast('You must be logged in to delete comments.', 'info');
      return;
    }

    const confirmed = await showConfirmationDialog('Are you sure you want to delete this comment?');
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`https://determined-peace-production.up.railway.app/api/videos/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
      addToast('Comment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      let errorMessage = 'Failed to delete comment.';
      let toastType = 'error';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = error.response.data?.error || 'You are not authorized to delete this comment.';
          toastType = 'warning';
        } else if (error.response.status === 404) {
          errorMessage = error.response.data?.error || 'Comment not found.';
          toastType = 'info';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check your network or server status.';
      } else {
        errorMessage = 'An unexpected error occurred.';
      }
      addToast(errorMessage, toastType);
    }
  };

  if (!video) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1100] p-4">
      <div
        className={`
          relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          mx-auto my-auto
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`
            absolute top-3 right-3 z-10 p-2 rounded-full
            ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            transition-colors duration-200
          `}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Video Player Section */}
        <div className="relative w-full h-[28rem] md:h-[32rem] bg-black flex items-center justify-center">
            {videoSrc ? (
            <div className="relative w-full pt-[56.25%] overflow-hidden">
              {isEmbed ? (
                <iframe
                  src={videoSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                  className="absolute top-0 left-0 w-full h-full" 
                  onError={(e) => {
                    console.error("Embed playback error:", e);
                    addToast("Failed to load embedded video. It might be unavailable or corrupted.", "error");
                  }}
                ></iframe>
              ) : (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  className="absolute top-0 left-0 w-full h-full" 
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    addToast("Failed to load video. It might be unavailable or corrupted.", "error");
                  }}
                />
              )}
            </div>
          ) : (
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Video URL is not available.
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Comments</h4>

          {isCommentsLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <Loader className="animate-spin mr-2" size={20} /> Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => {
                const isMyComment = comment.userId?._id === currentUserId;
                return (
                  <div key={comment._id} className={`mb-3 p-2 rounded-lg ${isMyComment ? 'bg-blue-600/20' : 'bg-gray-200/20 dark:bg-gray-700/20'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className={`font-semibold text-sm ${isMyComment ? 'text-blue-400' : (isDarkMode ? 'text-blue-300' : 'text-blue-700')}`}>
                          {comment.userId?.username || 'Unknown User'}
                          {isMyComment && <span className="ml-2 text-xs font-normal opacity-70">(You)</span>}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                          {moment(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className={`
                          p-1 rounded-full text-red-500 hover:bg-red-500/20
                          ${isDarkMode ? 'hover:text-red-400' : 'hover:text-red-600'}
                          transition-colors duration-200
                        `}
                        aria-label="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-sm leading-tight`}>
                      {comment.text}
                    </p>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}

          {/* Comment Input */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className={`
                flex-1 p-2 rounded-full border
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'}
                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
              `}
              disabled={isPostingComment}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newCommentText.trim()) {
                  handlePostComment();
                }
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={isPostingComment || !newCommentText.trim()}
              className={`
                p-2 rounded-full transition-colors duration-200 flex items-center justify-center
                ${isPostingComment || !newCommentText.trim()
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                }
              `}
            >
              {isPostingComment ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f1f1'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6B7280' : '#888'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9CA3AF' : '#555'};
        }
      `}</style>
    </div>
  );
};

export default VideoCommentDialog;