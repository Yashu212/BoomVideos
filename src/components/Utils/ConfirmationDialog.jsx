import {AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ message, onConfirm, onCancel, isDarkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1200] p-4">
      <div className={`
        ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}
        rounded-xl shadow-2xl p-6 w-full max-w-sm space-y-6
        transform transition-all duration-300 scale-100
      `}>
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Confirm Action</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
        </div>
        <div className="flex justify-around space-x-4">
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
            onClick={onConfirm}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200
              ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}
            `}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationDialog;