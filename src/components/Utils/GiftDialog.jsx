import React, { useState } from 'react';
import { Gift, XCircle } from 'lucide-react';

const GiftDialog = ({ onConfirm, onCancel, isDarkMode }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleGiftSubmit = () => {
    const giftAmount = parseFloat(amount);
    if (isNaN(giftAmount) || giftAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError('');
    onConfirm(giftAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-4">
      <div className={`
        ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}
        rounded-xl shadow-2xl p-6 w-full max-w-sm relative
        transform transition-all duration-300 scale-100
      `}>
        <button
          onClick={onCancel}
          className={`
            absolute top-3 right-3
            ${isDarkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}
            transition-colors duration-200
          `}
          aria-label="Close dialog"
        >
          <XCircle size={24} />
        </button>

        <div className="text-center">
          <Gift size={48} className="mx-auto text-pink-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Send a Gift</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Enter the amount you wish to gift:
          </p>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            placeholder="e.g., 100"
            className={`
              w-full p-2 mt-4 rounded-md border
              ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}
              focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
              // ADDED THESE CLASSES TO REMOVE SPINNER BUTTONS
              [appearance:textfield] // For Firefox
              [&::-webkit-outer-spin-button]:appearance-none // For Chrome, Safari, Edge
              [&::-webkit-inner-spin-button]:appearance-none // For Chrome, Safari, Edge
            `}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-around space-x-4 mt-6">
          <button
            onClick={onCancel}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200
              ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleGiftSubmit}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200
              ${isDarkMode ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}
            `}
          >
            Gift
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftDialog;