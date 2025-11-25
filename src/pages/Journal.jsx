import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiCalendar } from 'react-icons/fi';
import JournalEntry from '../components/JournalEntry';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState('');

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      content: newEntry.trim()
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
    setShowForm(false);
  };

  const updateEntry = (id, content) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, content } : entry
    ));
  };

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garden Journal</h1>
          <p className="text-gray-600">Record your gardening journey and observations</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <FiPlus className="mr-2" />
            New Entry
          </button>
        </div>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Journal Entry</h2>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write your journal entry here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addEntry}
              disabled={!newEntry.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No journal entries</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'No entries match your search.'
                : 'Get started by creating a new journal entry.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;