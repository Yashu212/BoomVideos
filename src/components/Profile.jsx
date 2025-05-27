import React, { useState } from 'react';
import { ArrowLeft, User, DollarSign, UploadCloud, Video, Loader } from 'lucide-react'; 
import axios from 'axios';

const Profile = ({ profileData, onBack, isDarkMode, onProfileUpdate }) => {
    const [topUpAmount, setTopUpAmount] = useState('');
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [isTopUpLoading, setIsTopUpLoading] = useState(false); 

    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        type: 'short',
        price: '',
        videoFile: null,
        videoUrl: ''
    });
    const [uploadMessage, setUploadMessage] = useState('');
    const [showUploadMessage, setShowUploadMessage] = useState(false);
    const [isUploadLoading, setIsUploadLoading] = useState(false); 


    if (!profileData) return null;

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);

        if (isNaN(amount) || amount <= 0) {
            setMessage('Please enter a valid positive amount.');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Authentication token not found. Please log in.');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
            return;
        }

        setIsTopUpLoading(true); 
        setMessage('Processing top-up...'); 
        setShowMessage(true);

        try {
            const res = await axios.put(
                'https://boom-app-backend-production.up.railway.app/api/auth/wallet/topup',
                { amount },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMessage(`Amount ₹${amount} added successfully!`);
            setTopUpAmount(''); 

            if (onProfileUpdate) {
                onProfileUpdate(); 
            }

        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to top up wallet.');
            console.error('Wallet top-up error:', err);
        } finally {
            setIsTopUpLoading(false); 
            setTimeout(() => setShowMessage(false), 3000); 
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        setIsUploadLoading(true); 
        setUploadMessage('Uploading video...'); 
        setShowUploadMessage(true);

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('description', uploadData.description);
        formData.append('type', uploadData.type);

        if (uploadData.type === 'long') {
            const price = parseFloat(uploadData.price);
            if (isNaN(price) || price < 0) {
                setUploadMessage('Please enter a valid non-negative price for long videos.');
                setShowUploadMessage(true);
                setIsUploadLoading(false); 
                setTimeout(() => setShowUploadMessage(false), 3000);
                return;
            }
            formData.append('price', price);
            formData.append('videoUrl', uploadData.videoUrl);
        } else { // Short video
            formData.append('price', 0);
            if (uploadData.videoFile) {
                formData.append('videoFile', uploadData.videoFile);
            } else {
                setUploadMessage('Please select a video file for short videos.');
                setShowUploadMessage(true);
                setIsUploadLoading(false); 
                setTimeout(() => setShowUploadMessage(false), 3000);
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setUploadMessage('Authentication token not found. Please log in to upload.');
            setShowUploadMessage(true);
            setIsUploadLoading(false); 
            setTimeout(() => setShowUploadMessage(false), 3000);
            return;
        }

        try {
            const res = await axios.post('https://determined-peace-production.up.railway.app/api/videos/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadMessage('🎉 Video uploaded successfully!');
            setUploadData({ title: '', description: '', type: 'short', price: '', videoFile: null, videoUrl: '' }); 
            setShowUploadForm(false); 
        } catch (err) {
            setUploadMessage(err.response?.data?.error || 'Upload failed. Please try again.');
            console.error('Video upload error:', err);
        } finally {
            setIsUploadLoading(false); 
            setTimeout(() => setShowUploadMessage(false), 3000); 
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
            <div className={`w-full max-w-xl transform transition-all duration-300 hover:scale-105 ${
                isDarkMode
                    ? 'bg-gray-800 border border-gray-700 shadow-2xl shadow-blue-500/20'
                    : 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl'
            } rounded-2xl p-8 space-y-6`}>

                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-3xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Profile</h2>
                    <button
                        onClick={onBack}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 flex items-center justify-center rounded-full text-white text-3xl font-bold ${
                        isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                        {profileData.username?.[0]?.toUpperCase() || <User size={36} />}
                    </div>
                    <h3 className={`mt-4 text-2xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{profileData.username}</h3>
                    <p className={`text-md ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>@{profileData.email}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center mt-6">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md">
                        <p className="text-xl font-semibold">₹{profileData.walletBalance}</p>
                        <p className="text-sm opacity-80">Wallet Balance</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                        <p className="text-xl font-semibold">{profileData._id.slice(-5)}</p>
                        <p className="text-sm opacity-80">User ID (last 5)</p>
                    </div>
                </div>

                {/* Top-up Wallet Section */}
                <div className={`mt-6 p-6 rounded-lg border shadow-md space-y-4 ${
                    isDarkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Up Wallet</h4>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <input
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            placeholder="Enter amount"
                            value={topUpAmount}
                            onChange={(e) => {
                                const re = /^[0-9\b]+$/;
                                if (e.target.value === '' || re.test(e.target.value)) {
                                    setTopUpAmount(e.target.value);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            disabled={isTopUpLoading} 
                        />
                        <button
                            onClick={handleTopUp}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            disabled={isTopUpLoading} 
                        >
                            {isTopUpLoading ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                <DollarSign size={20} />
                            )}
                            <span>{isTopUpLoading ? 'Processing...' : 'Top Up'}</span>
                        </button>
                    </div>
                    {showMessage && (
                        <p className={`text-sm text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* Upload Video Section */}
                <div className={`pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} space-y-4`}>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-lg ${
                            isDarkMode
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                        disabled={isUploadLoading} 
                    >
                        <UploadCloud size={20} />
                        <span>{showUploadForm ? 'Hide Video Upload' : 'Upload New Video'}</span>
                    </button>

                    {showUploadForm && (
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Video Title"
                                value={uploadData.title}
                                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                required
                                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                                disabled={isUploadLoading} 
                            />

                            <textarea
                                placeholder="Video Description"
                                value={uploadData.description}
                                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                required
                                rows="3"
                                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                                disabled={isUploadLoading} 
                            />

                            <select
                                value={uploadData.type}
                                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                disabled={isUploadLoading} 
                            >
                                <option value="short">Short Video</option>
                                <option value="long">Long Video</option>
                            </select>

                            {uploadData.type === 'short' ? (
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setUploadData({ ...uploadData, videoFile: e.target.files[0] })}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                                            : 'bg-white border-gray-300 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                                    }`}
                                    disabled={isUploadLoading} 
                                />
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        placeholder="Price (₹)"
                                        value={uploadData.price}
                                        onChange={(e) => {
                                            const re = /^[0-9\b]+$/;
                                            if (e.target.value === '' || re.test(e.target.value)) {
                                                setUploadData({ ...uploadData, price: e.target.value });
                                            }
                                        }}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                        disabled={isUploadLoading} 
                                    />
                                    <input
                                        type="text"
                                        placeholder="Video URL (e.g. YouTube, Vimeo, etc.)"
                                        value={uploadData.videoUrl}
                                        onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                        disabled={isUploadLoading} 
                                    />
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                disabled={isUploadLoading} 
                            >
                                {isUploadLoading ? (
                                    <Loader className="animate-spin" size={20} />
                                ) : (
                                    <Video size={20} />
                                )}
                                <span>{isUploadLoading ? 'Uploading...' : 'Upload Video'}</span>
                            </button>

                            {showUploadMessage && (
                                <p className={`text-sm text-center mt-2 ${uploadMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                                    {uploadMessage}
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;