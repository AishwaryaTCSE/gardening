import { useState } from 'react';
import { FiSearch, FiMessageSquare, FiHeart, FiShare2 } from 'react-icons/fi';

const Community = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for community posts
  const posts = [
    {
      id: 1,
      user: 'GardenLover42',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'Just harvested my first batch of heirloom tomatoes this season! 🍅 #gardening #harvest',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      likes: 24,
      comments: 8,
      timeAgo: '2h ago'
    },
    {
      id: 2,
      user: 'PlantParent',
      avatar: 'https://i.pravatar.cc/150?img=2',
      content: 'My monstera just put out a new leaf with beautiful fenestrations! 🌿 #monstera #plantsofinstagram',
      image: 'https://images.unsplash.com/photo-1593482892291-3dbeca0c2f08?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      likes: 45,
      comments: 12,
      timeAgo: '5h ago'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Community</h1>
        
        {/* Search and Tabs */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search community posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['trending', 'recent', 'following'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Post Header */}
              <div className="p-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={post.avatar}
                    alt={post.user}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{post.user}</p>
                    <p className="text-xs text-gray-500">{post.timeAgo}</p>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="w-full h-64 bg-gray-100">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="px-4 py-2 flex justify-between border-t border-gray-200">
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <FiHeart className="h-5 w-5 mr-1" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <FiMessageSquare className="h-5 w-5 mr-1" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <FiShare2 className="h-5 w-5 mr-1" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Post Button (Fixed at bottom on mobile) */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;