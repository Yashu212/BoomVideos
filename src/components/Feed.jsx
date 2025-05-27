import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Gift, MessageCircle, ShoppingCart, Play, Loader } from 'lucide-react';
import moment from 'moment';
import Toast from './Utils/Toast';
import ConfirmationDialog from './Utils/ConfirmationDialog';
import GiftDialog from './Utils/GiftDialog';
import VideoCommentDialog from './Utils/VideoCommentDialog';

const Feed = ({ isDarkMode }) => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [purchasingVideoId, setPurchasingVideoId] = useState(null);
    const [giftingVideoId, setGiftingVideoId] = useState(null);
    const loaderRef = useRef(null);

    const [toasts, setToasts] = useState([]);
    const nextToastId = useRef(0);

    const addToast = useCallback((message, type = 'info') => {
        const id = nextToastId.current++;
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const [confirmDialog, setConfirmDialog] = useState({
        isVisible: false,
        message: '',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const showConfirmationDialog = useCallback((message) => {
        return new Promise((resolve) => {
        setConfirmDialog({
            isVisible: true,
            message,
            onConfirm: () => {
            setConfirmDialog(prev => ({ ...prev, isVisible: false }));
            resolve(true);
            },
            onCancel: () => {
            setConfirmDialog(prev => ({ ...prev, isVisible: false }));
            resolve(false);
            }
        });
        });
    }, []);

    const [giftDialog, setGiftDialog] = useState({
        isVisible: false,
        videoId: null,
        resolvePromise: null,
    });

    const showGiftDialog = useCallback((videoId) => {
        return new Promise((resolve) => {
        setGiftDialog({
            isVisible: true,
            videoId,
            resolvePromise: resolve,
        });
        });
    }, []);

    const [videoCommentDialog, setVideoCommentDialog] = useState({
        isVisible: false,
        video: null,
    });

    const token = localStorage.getItem('token');

    const loadVideos = useCallback(async () => {
        if (isLoading || !hasMore) {
        return;
        }

        setIsLoading(true);
        setError(null);

        try {
        const res = await axios.get(`https://determined-peace-production.up.railway.app/api/videos?page=${page}&limit=5`);

        const videosWithPurchase = await Promise.all(
            res.data.map(async (video) => {
            // If price is 0, it's considered purchased
            if (video.price === 0) {
                return { ...video, purchased: true };
            }

            // Only check purchase status if token exists, otherwise assume not purchased
            if (!token) {
                return { ...video, purchased: false };
            }

            try {
                const check = await axios.get(`https://determined-peace-production.up.railway.app/api/videos/${video._id}/purchased`, {
                headers: { Authorization: `Bearer ${token}` },
                });
                return { ...video, purchased: check.data.purchased };
            } catch (e) {
                console.error(`Error checking purchase for video ${video._id}:`, e.response?.data?.error || e.message);
                // On error checking purchase, default to not purchased to be safe
                return { ...video, purchased: false };
            }
            })
        );

        if (videosWithPurchase.length === 0) {
            setHasMore(false);
        } else {
            setVideos(prev => {
            const newUniqueVideos = videosWithPurchase.filter(
                (newVideo) => !prev.some((existingVideo) => existingVideo._id === newVideo._id)
            );
            return [...prev, ...newUniqueVideos];
            });
            setPage(prevPage => prevPage + 1); 
        }
        } catch (err) {
        console.error('Failed to load videos:', err.message);
        let errMsg = 'Failed to load videos. Please try again later.';
        if (err.response && err.response.data && err.response.data.message) {
            errMsg = err.response.data.message;
        }
        addToast(errMsg, 'error');
        setError(errMsg);
        setHasMore(false); 
        } finally {
        setIsLoading(false);
        }
    }, [hasMore, isLoading, token, addToast, page]); 

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    useEffect(() => {
        if (!hasMore || isLoading) {
        return;
        }

        const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadVideos();
            }
        },
        { threshold: 1 }
        );

        if (loaderRef.current) {
        observer.observe(loaderRef.current);
        }

        return () => {
        if (loaderRef.current) {
            observer.unobserve(loaderRef.current);
        }
        observer.disconnect();
        };
    }, [hasMore, isLoading, loadVideos]);

    const timeAgo = (date) => moment(date).fromNow();

    const handleBuy = async (videoId, price) => {
        if (!token) {
        addToast('You must be logged in to purchase videos.', 'info');
        return;
        }

        if (purchasingVideoId === videoId) {
            return; 
        }

        const confirmed = await showConfirmationDialog(`Are you sure you want to buy this video for ₹${price}?`);
        if (!confirmed) {
        return;
        }

        setPurchasingVideoId(videoId);

        try {
        const response = await axios.post(
            `https://determined-peace-production.up.railway.app/api/videos/${videoId}/purchase`,
            {},
            {
            headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (response.status === 200 || response.status === 201) {
            addToast('Video purchased successfully!', 'success');
            setVideos(prevVideos =>
            prevVideos.map(video =>
                video._id === videoId ? { ...video, purchased: true } : video
            )
            );
        } else {
            addToast(`Purchase failed: ${response.data?.message || 'Unknown response status.'}`, 'error');
        }
        } catch (error) {
        console.error('Error purchasing video:', error);
        let errorMessage = 'Failed to purchase video.';

        if (error.response) {
            if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response.status === 403) {
            errorMessage = 'Access denied. You might not have permission.';
            } else if (error.response.status === 400) {
            errorMessage = error.response.data?.message || 'Bad request. Check video ID or user balance.';
            } else if (error.response.status === 404) {
            errorMessage = 'Video not found or purchase endpoint invalid.';
            } else {
            errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            }
        } else if (error.request) {
            errorMessage = 'No response from server. Check your network or server status.';
        } else {
            errorMessage = 'An unexpected error occurred during purchase.';
        }
        addToast(errorMessage, 'error');
        } finally {
        setPurchasingVideoId(null);
        }
    };

    const handleWatch = useCallback((video) => {
        if (!video.purchased && video.price > 0) { // Check if video is not free AND not purchased
        addToast('Please purchase the video to watch it.', 'info');
        return;
        }
        setVideoCommentDialog({ isVisible: true, video: video });
    }, [addToast]);

    const handleGift = useCallback(async (videoId) => {
        if (!token) {
        addToast('Please log in to gift videos.', 'info');
        return;
        }

        if (giftingVideoId === videoId) {
            return; 
        }

        const giftAmount = await showGiftDialog(videoId);

        if (giftAmount === null || giftAmount === undefined) {
        addToast('Gift transaction cancelled.', 'info');
        return;
        }

        setGiftingVideoId(videoId);

        try {
        const response = await axios.post(
            `https://determined-peace-production.up.railway.app/api/videos/${videoId}/gift`,
            { amount: giftAmount },
            {
            headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (response.status === 201) {
            addToast(`Gift of ₹${giftAmount} sent successfully!`, 'success');
        } else {
            addToast(`Failed to send gift: ${response.data?.message || 'Unknown response status.'}`, 'error');
        }
        } catch (error) {
        console.error('Error sending gift:', error);
        let errorMessage = 'Failed to send gift.';

        if (error.response) {
            if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response.status === 400) {
            errorMessage = error.response.data?.error || error.response.data?.message || 'Invalid request for gifting.';
            } else if (error.response.status === 404) {
            errorMessage = 'Video not found or gift endpoint invalid.';
            } else if (error.response.status === 500) {
            errorMessage = error.response.data?.error || 'Server error. Could not complete gift transaction.';
            } else {
            errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            }
        } else if (error.request) {
            errorMessage = 'No response from server. Check your network or server status.';
        } else {
            errorMessage = 'An unexpected error occurred.';
        }
        addToast(errorMessage, 'error');
        } finally {
        setGiftingVideoId(null);
        }
    }, [token, addToast, showGiftDialog, giftingVideoId]);

    const handleComment = useCallback((video) => {
        if (!token) {
        addToast('Please log in to comment.', 'info');
        return;
        }
        
        setVideoCommentDialog({ isVisible: true, video: video });
    }, [token, addToast]);


    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="fixed top-4 right-4 z-[1200] flex flex-col items-end">
            {toasts.map(toast => (
            <Toast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={removeToast}
                isDarkMode={isDarkMode}
            />
            ))}
        </div>

        {confirmDialog.isVisible && (
            <ConfirmationDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={confirmDialog.onCancel}
            isDarkMode={isDarkMode}
            />
        )}

        {giftDialog.isVisible && (
            <GiftDialog
            onConfirm={(amount) => {
                setGiftDialog(prev => ({ ...prev, isVisible: false }));
                if (giftDialog.resolvePromise) {
                giftDialog.resolvePromise(amount);
                }
            }}
            onCancel={() => {
                setGiftDialog(prev => ({ ...prev, isVisible: false }));
                if (giftDialog.resolvePromise) {
                giftDialog.resolvePromise(null);
                }
            }}
            isDarkMode={isDarkMode}
            />
        )}

        {videoCommentDialog.isVisible && (
            <VideoCommentDialog
            video={videoCommentDialog.video}
            onClose={() => setVideoCommentDialog({ isVisible: false, video: null })}
            isDarkMode={isDarkMode}
            addToast={addToast}
            showConfirmationDialog={showConfirmationDialog}
            />
        )}

        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            Boom Feed
            </h2>

            <div className="space-y-6">
            {!isLoading && videos.length === 0 && !hasMore && !error && (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No videos available at the moment. Please check back later.
                </p>
            )}

            {videos.map(video => {
                const isShort = video.type === 'short';

                return (
                <div
                    key={video._id}
                    className={`rounded-2xl shadow-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 transform hover:scale-105 transition-all duration-200`}
                >
                    <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {video.creatorId?.username?.[0] || 'U'}
                        </div>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                        {video.creatorId?.username || 'Unknown'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(video.createdAt)}</span>
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-500'}`}>{video.title}</h3>

                    <div className="relative rounded-lg overflow-hidden w-full h-64 bg-gray-700 flex items-center justify-center">
                    {isShort ? (
                        <video
                        src={video.videoUrl}
                        autoPlay
                        muted
                        controls
                        data-type="short"
                        className="w-full h-64 object-cover"
                        />
                    ) : (
                        <>
                        <div className={`
                            absolute inset-0 flex items-center justify-center
                            text-6xl font-extrabold text-white leading-none
                            ${isDarkMode
                            ? 'bg-gradient-to-br from-purple-800 to-indigo-900'
                            : 'bg-gradient-to-br from-purple-600 to-indigo-700'
                            }
                            rounded-lg shadow-inner
                        `}>
                            BOOM
                            <div className="absolute inset-0 bg-black opacity-10 rounded-lg"></div>
                        </div>

                        {video.purchased ? (
                            <button
                            onClick={() => handleWatch(video)}
                            className="absolute bottom-4 right-4 bg-white text-purple-600 font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors duration-200 flex items-center space-x-1 z-10"
                            >
                            <Play size={16} /> <span>Watch</span>
                            </button>
                        ) : (
                            <button
                            onClick={() => handleBuy(video._id, video.price)}
                            disabled={purchasingVideoId === video._id}
                            className={`absolute bottom-4 right-4 font-semibold px-4 py-2 rounded-full shadow-lg transition-colors duration-200 flex items-center space-x-1 z-10
                                ${purchasingVideoId === video._id
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                            {purchasingVideoId === video._id ? (
                                <Loader className="animate-spin" size={16} />
                            ) : (
                                <ShoppingCart size={16} />
                            )}
                            <span>{purchasingVideoId === video._id ? 'Purchasing...' : `Buy for ₹${video.price}`}</span>
                            </button>
                        )}
                        </>
                    )}
                    </div>

                    <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => handleGift(video._id)}
                        disabled={giftingVideoId === video._id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-200
                        ${giftingVideoId === video._id
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600')
                        }`}
                    >
                        {giftingVideoId === video._id ? (
                            <Loader className="animate-spin" size={16} />
                        ) : (
                            <Gift size={16} />
                        )}
                        <span className="text-sm">{giftingVideoId === video._id ? 'Gifting...' : 'Gift'}</span>
                    </button>
                    {/* Conditional rendering for the Comment button */}
                    {video.purchased && (
                        <button
                            onClick={() => handleComment(video)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-200 ${
                            isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                            <MessageCircle size={16} /> <span className="text-sm">Comment</span>
                        </button>
                    )}
                    </div>
                </div>
                );
            })}

            <div ref={loaderRef} className="py-4 text-center">
                {isLoading && hasMore && (
                    <div className={`flex items-center justify-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Loader className="animate-spin" size={20} />
                        <span>Loading videos...</span>
                    </div>
                )}
                {!isLoading && !hasMore && videos.length > 0 && (
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        You've reached the end of the feed!
                    </p>
                )}
            </div>
            </div>
        </div>
        </div>
    );
};

export default Feed;