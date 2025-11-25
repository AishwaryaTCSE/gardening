import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const JournalEntry = ({ entry, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  
  const handleUpdate = () => {
    onUpdate(entry.id, editedContent);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedContent(entry.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {format(new Date(entry.date), 'MMMM d, yyyy')}
        </h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                title="Save"
              >
                <FiCheck className="h-5 w-5" />
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                title="Cancel"
              >
                <FiX className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                title="Edit"
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                title="Delete"
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2 h-32"
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;