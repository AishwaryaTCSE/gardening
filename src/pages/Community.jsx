import { useEffect, useState } from 'react';
import { FiSearch, FiMessageSquare, FiHeart, FiShare2, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

// Fallback to localStorage if Firebase is not configured
const STORAGE_KEY = 'community_posts';
const USE_FIREBASE = import.meta.env.VITE_FIREBASE_DATABASE_URL && 
                     import.meta.env.VITE_FIREBASE_DATABASE_URL !== "https://your-project-default-rtdb.firebaseio.com";

const getPostsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [
      {
        id: '1',
        user: 'GardenLover42',
        avatar: 'https://i.pravatar.cc/150?img=1',
        content: 'Just harvested my first batch of heirloom tomatoes this season! 🍅 #gardening #harvest',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        likes: 24,
        likedBy: [],
        comments: [],
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
        timeAgo: '2h ago'
      },
      {
        id: '2',
        user: 'PlantParent',
        avatar: 'https://i.pravatar.cc/150?img=2',
        content: 'My monstera just put out a new leaf with beautiful fenestrations! 🌿 #monstera #plantsofinstagram',
        image: 'https://images.unsplash.com/photo-1593482892291-3dbeca0c2f08?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        likes: 45,
        likedBy: [],
        comments: [],
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
        timeAgo: '5h ago'
      }
    ];
  } catch {
    return [];
  }
};

const savePostsToStorage = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save posts:', err);
  }
};

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Community = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState(() => {
    // In a real app, this would come from Firebase Auth
    return localStorage.getItem('community_user') || `User${Math.floor(Math.random() * 1000)}`;
  });

  useEffect(() => {
    if (USE_FIREBASE) {
      // Use Firebase Realtime Database
      const postsRef = ref(realtimeDb, 'community/posts');
      setIsLoading(true);
      
      const unsubscribe = onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const postsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setPosts(postsArray);
        } else {
          setPosts([]);
        }
        setIsLoading(false);
      }, (error) => {
        console.error('Error loading posts:', error);
        // Fallback to localStorage
        const loaded = getPostsFromStorage();
        setPosts(loaded);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Use localStorage
      const loaded = getPostsFromStorage();
      setPosts(loaded);
      setIsLoading(false);
    }
  }, []);

  const handleLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(currentUser);
    
    const newLikedBy = isLiked 
      ? likedBy.filter(user => user !== currentUser)
      : [...likedBy, currentUser];
    
    const newLikes = newLikedBy.length;
    const updates = {
      likes: newLikes,
      likedBy: newLikedBy
    };

    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}`);
      update(postRef, updates).catch(error => {
        console.error('Error updating like:', error);
      });
    } else {
      const updated = posts.map(p =>
        p.id === postId ? { ...p, ...updates } : p
      );
      setPosts(updated);
      savePostsToStorage(updated);
    }
  };

  const handleShare = (postId) => {
    const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    navigator.clipboard?.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please copy manually: ' + url);
    });
  };

  const handleAddComment = (postId) => {
    const text = commentDrafts[postId];
    if (!text?.trim()) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
      id: Date.now().toString(),
      text: text.trim(),
      user: currentUser,
      createdAt: Date.now(),
      timeAgo: 'just now'
    };

    const updatedComments = [...(post.comments || []), newComment];

    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}/comments`);
      const commentsRef = ref(realtimeDb, `community/posts/${postId}`);
      update(commentsRef, { comments: updatedComments }).catch(error => {
        console.error('Error adding comment:', error);
      });
    } else {
      const updated = posts.map(p =>
        p.id === postId ? { ...p, comments: updatedComments } : p
      );
      setPosts(updated);
      savePostsToStorage(updated);
    }

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleEditComment = (postId, commentId, newText) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const updatedComments = (post.comments || []).map(c =>
      c.id === commentId ? { ...c, text: newText, edited: true } : c
    );

    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}`);
      update(postRef, { comments: updatedComments }).catch(error => {
        console.error('Error editing comment:', error);
      });
    } else {
      const updated = posts.map(p =>
        p.id === postId ? { ...p, comments: updatedComments } : p
      );
      setPosts(updated);
      savePostsToStorage(updated);
    }

    setEditingComment(null);
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const updatedComments = (post.comments || []).filter(c => c.id !== commentId);

    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}`);
      update(postRef, { comments: updatedComments }).catch(error => {
        console.error('Error deleting comment:', error);
      });
    } else {
      const updated = posts.map(p =>
        p.id === postId ? { ...p, comments: updatedComments } : p
      );
      setPosts(updated);
      savePostsToStorage(updated);
    }
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newPostObj = {
      user: currentUser,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      content: newPost.trim(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: Date.now(),
      timeAgo: 'just now'
    };

    if (USE_FIREBASE) {
      const postsRef = ref(realtimeDb, 'community/posts');
      push(postsRef, newPostObj).catch(error => {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
      });
    } else {
      const updated = [{ ...newPostObj, id: Date.now().toString() }, ...posts];
      setPosts(updated);
      savePostsToStorage(updated);
    }

    setNewPost("");
  };

  const handleEditPost = (postId, newContent) => {
    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}`);
      update(postRef, { content: newContent, edited: true }).catch(error => {
        console.error('Error editing post:', error);
      });
    } else {
      const updated = posts.map(p =>
        p.id === postId ? { ...p, content: newContent, edited: true } : p
      );
      setPosts(updated);
      savePostsToStorage(updated);
    }
    setEditingPost(null);
  };

  const handleDeletePost = (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    if (USE_FIREBASE) {
      const postRef = ref(realtimeDb, `community/posts/${postId}`);
      remove(postRef).catch(error => {
        console.error('Error deleting post:', error);
      });
    } else {
      const updated = posts.filter(p => p.id !== postId);
      setPosts(updated);
      savePostsToStorage(updated);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.user.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Community</h1>

        {/* Create Post */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <textarea
            className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Share an update..."
            rows="3"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition disabled:opacity-60"
              disabled={!newPost.trim()}
            >
              Share
            </button>
          </div>
        </div>
        
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Posts */}
        {!isLoading && (
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                No posts found. Be the first to share!
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={post.avatar}
                          alt={post.user}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{post.user}</p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(post.createdAt || Date.now())}
                            {post.edited && <span className="ml-1 text-gray-400">(edited)</span>}
                          </p>
                        </div>
                      </div>
                      {post.user === currentUser && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPost(post.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit post"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete post"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingPost === post.id ? (
                      <div className="mt-3">
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          defaultValue={post.content}
                          rows="3"
                          ref={(el) => {
                            if (el) el.focus();
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value !== post.content) {
                              handleEditPost(post.id, e.target.value.trim());
                            } else {
                              setEditingPost(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              if (e.target.value.trim() && e.target.value !== post.content) {
                                handleEditPost(post.id, e.target.value.trim());
                              } else {
                                setEditingPost(null);
                              }
                            }
                            if (e.key === 'Escape') {
                              setEditingPost(null);
                            }
                          }}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              const textarea = document.querySelector(`textarea[defaultValue="${post.content}"]`);
                              if (textarea?.value.trim() && textarea.value !== post.content) {
                                handleEditPost(post.id, textarea.value.trim());
                              } else {
                                setEditingPost(null);
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPost(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-700">{post.content}</p>
                    )}
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
                    <button
                      className={`flex items-center ${
                        (post.likedBy || []).includes(currentUser)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <FiHeart className={`h-5 w-5 mr-1 ${(post.likedBy || []).includes(currentUser) ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-gray-700">
                      <FiMessageSquare className="h-5 w-5 mr-1" />
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                    <button
                      className="flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => handleShare(post.id)}
                    >
                      <FiShare2 className="h-5 w-5 mr-1" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="px-4 py-3 border-t border-gray-200 space-y-2">
                    {(post.comments || []).map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(comment.createdAt || Date.now())}
                              {comment.edited && <span className="ml-1 text-gray-400">(edited)</span>}
                            </span>
                          </div>
                          {editingComment?.id === comment.id ? (
                            <div className="mt-1">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                defaultValue={comment.text}
                                autoFocus
                                onBlur={(e) => {
                                  if (e.target.value.trim() && e.target.value !== comment.text) {
                                    handleEditComment(post.id, comment.id, e.target.value.trim());
                                  } else {
                                    setEditingComment(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (e.target.value.trim() && e.target.value !== comment.text) {
                                      handleEditComment(post.id, comment.id, e.target.value.trim());
                                    } else {
                                      setEditingComment(null);
                                    }
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingComment(null);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          )}
                        </div>
                        {comment.user === currentUser && editingComment?.id !== comment.id && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setEditingComment({ id: comment.id, postId: post.id })}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit comment"
                            >
                              <FiEdit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete comment"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Add a comment..."
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
