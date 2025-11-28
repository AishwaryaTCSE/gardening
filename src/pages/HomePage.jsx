
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiExternalLink,
  FiArrowUp,
  FiSun,
  FiDroplet,
  FiShield,
  FiClock,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiImage,
  FiCloud,
  FiMessageSquare,
  FiBookOpen,
  FiSearch,
  FiAward
} from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  // State for interactive features
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [gardenProgress, setGardenProgress] = useState(35);
  const [searchTerm, setSearchTerm] = useState('');
  const [weather, setWeather] = useState({
    temp: 22,
    condition: 'Sunny',
    humidity: 65,
    wind: 12
  });

  // Refs for smooth scrolling
  const topRef = useRef(null);
  const sectionRefs = {
    gettingStarted: useRef(null),
    soil: useRef(null),
    plantSelection: useRef(null),
    planting: useRef(null),
    watering: useRef(null),
    pestControl: useRef(null),
    seasonal: useRef(null),
    container: useRef(null),
    composting: useRef(null),
    tools: useRef(null),
    maintenance: useRef(null),
    harvesting: useRef(null),
    design: useRef(null),
    sustainability: useRef(null)
  };

  // Smooth scroll to section (null-safe)
  const scrollToSection = (ref) => {
    if (!ref || !ref.current) return;
    window.scrollTo({
      top: ref.current.offsetTop - 80, // Account for fixed header
      behavior: 'smooth'
    });
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Show/hide scroll to top button
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={topRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative"
    >
      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-green-700 mb-6">
          Welcome to Your Ultimate Gardening Guide
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover the joy of gardening with our comprehensive resource for
          gardeners of all levels
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/garden"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center"
          >
            Start Your Garden <FiArrowRight className="ml-2" />
          </Link>
          {/* use scrollToSection instead of raw anchor */}
          <button
            onClick={() => scrollToSection(sectionRefs.gettingStarted)}
            className="bg-white hover:bg-gray-50 text-green-700 font-medium py-3 px-6 rounded-lg border border-green-200 transition duration-200"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* New Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-10">
          Interactive Gardening Tools
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Plant Care Calendar */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <FiCalendar className="text-green-600 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Plant Care Calendar</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">{currentMonth} Tasks</h4>
                <button className="text-sm text-green-600 hover:text-green-800">
                  View All
                </button>
              </div>
              <ul className="space-y-2">
                {[
                  'Start indoor seeds',
                  'Prune fruit trees',
                  'Prepare garden beds'
                ].map((task, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <button
                onClick={() => scrollToSection(sectionRefs.seasonal)}
                className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
              >
                View Seasonal Guide <FiArrowRight className="ml-1" />
              </button>
            </div>
          </div>

          {/* Garden Progress */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <FiAward className="text-green-600 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">My Garden Progress</h3>
            </div>
            <div className="text-center py-4">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${gardenProgress}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {gardenProgress}%
                  </span>
                  <span className="text-xs text-gray-500">Complete</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {gardenProgress < 30
                  ? "Let's get started on your gardening journey!"
                  : gardenProgress < 70
                  ? 'Great progress! Keep it up!'
                  : 'Almost there! Your garden is thriving!'}
              </p>
              <button
                onClick={() =>
                  setGardenProgress((prev) => Math.min(prev + 10, 100))
                }
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Log Progress
              </button>
            </div>
          </div>

          {/* Plant Identifier */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <FiImage className="text-green-600 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Plant Identifier</h3>
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a plant..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              {searchTerm && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white">
                  {[
                    { id: 1, name: 'Tomato', type: 'Vegetable' },
                    { id: 2, name: 'Rose', type: 'Flower' },
                    { id: 3, name: 'Basil', type: 'Herb' }
                  ]
                    .filter(
                      (plant) =>
                        plant.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        plant.type
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((plant) => (
                      <div
                        key={plant.id}
                        className="p-2 hover:bg-gray-50 flex items-center"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-3" />
                        <div>
                          <div className="font-medium">{plant.name}</div>
                          <div className="text-xs text-gray-500">
                            {plant.type}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <button className="w-full bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center">
              <FiImage className="mr-2" /> Upload Plant Photo
            </button>
          </div>

          {/* Weather Widget */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiCloud className="text-blue-500 text-2xl mr-2" />
                <h3 className="text-xl font-semibold">Local Weather</h3>
              </div>
              <span className="text-sm text-gray-500">Your Location</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl font-bold">{weather.temp}°C</div>
              <div className="text-right">
                <div className="text-lg font-medium">
                  {weather.condition}
                </div>
                <div className="text-sm text-gray-500">
                  H: {weather.humidity}% • W: {weather.wind} km/h
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => scrollToSection(sectionRefs.seasonal)}
                className="text-sm text-blue-600 hover:underline"
              >
                View 5-day forecast
              </button>
            </div>
          </div>

          {/* Garden Journal */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <FiBookOpen className="text-green-600 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Garden Journal</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Document your gardening journey, track plant growth, and record
              important observations.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Last Entry</div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                </div>
                <button className="text-green-600 hover:text-green-800">
                  <FiMessageSquare className="text-xl" />
                </button>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                New Journal Entry
              </button>
            </div>
          </div>

          {/* Community Forum */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <FiMessageSquare className="text-green-600 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Community Forum</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Connect with fellow gardeners, ask questions, and share your
              experiences.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                {[
                  'Best plants for beginners',
                  'Pest control solutions',
                  'Organic fertilizers discussion'
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{topic}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      24+
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                View All Discussions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <nav className="bg-green-50 p-6 rounded-xl mb-16 sticky top-4 z-10 shadow-sm">
        <h2 className="text-2xl font-semibold text-green-800 mb-6">
          Complete Gardening Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => scrollToSection(sectionRefs.gettingStarted)}
            className="text-left p-3 bg-white rounded-lg hover:bg-green-100 transition-colors flex items-start"
          >
            <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
              <FiZap className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Getting Started</h3>
              <p className="text-sm text-gray-600 mt-1">
                Beginner&apos;s guide to gardening
              </p>
            </div>
          </button>

          <button
            onClick={() => scrollToSection(sectionRefs.plantSelection)}
            className="text-left p-3 bg-white rounded-lg hover:bg-green-100 transition-colors flex items-start"
          >
            <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
              <FiAward className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Plant Selection</h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose the right plants
              </p>
            </div>
          </button>

          <button
            onClick={() => scrollToSection(sectionRefs.seasonal)}
            className="text-left p-3 bg-white rounded-lg hover:bg-green-100 transition-colors flex items-start"
          >
            <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
              <FiCalendar className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Seasonal Guide</h3>
              <p className="text-sm text-gray-600 mt-1">
                Year-round gardening calendar
              </p>
            </div>
          </button>

          <button
            onClick={() => scrollToSection(sectionRefs.pestControl)}
            className="text-left p-3 bg-white rounded-lg hover:bg-green-100 transition-colors flex items-start"
          >
            <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
              <FiShield className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Pest Control</h3>
              <p className="text-sm text-gray-600 mt-1">
                Organic solutions &amp; prevention
              </p>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <article className="prose lg:prose-xl max-w-none">
        {/* Section 1: Getting Started */}
        <section ref={sectionRefs.gettingStarted} id="getting-started" className="mb-20 scroll-mt-24 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiZap className="text-green-600 text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-800">Getting Started with Gardening</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Welcome to the wonderful world of gardening! Whether you have a spacious backyard or just a small balcony, 
              anyone can enjoy the benefits of growing plants. This guide will help you get started on your gardening journey.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3">Essential Tools</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Hand trowel for digging and planting</li>
                  <li>Pruning shears for trimming</li>
                  <li>Watering can or hose</li>
                  <li>Gardening gloves</li>
                  <li>Rake and hoe</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Start with easy-to-grow plants</li>
                  <li>Choose the right location with proper sunlight</li>
                  <li>Water plants according to their needs</li>
                  <li>Learn about your hardiness zone</li>
                  <li>Be patient and enjoy the process</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Plant Selection */}
        <section ref={sectionRefs.plantSelection} id="plant-selection" className="mb-20 scroll-mt-24 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiAward className="text-green-600 text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-800">Plant Selection Guide</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Choosing the right plants for your garden is crucial for success. Consider your climate, 
              soil type, and available sunlight when selecting plants.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3">Best Plants for Beginners</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Tomatoes - Great for beginners, need full sun</li>
                  <li>Marigolds - Hardy flowers that deter pests</li>
                  <li>Basil - Easy-to-grow herb for kitchen use</li>
                  <li>Zinnias - Colorful and low-maintenance</li>
                  <li>Lettuce - Quick growing, perfect for containers</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Planting Zones</h3>
                <p className="text-gray-700 mb-4">
                  Knowing your USDA hardiness zone helps determine which plants will thrive in your area. 
                  Check your zone before selecting plants.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Find My Zone
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Seasonal Guide */}
        <section ref={sectionRefs.seasonal} id="seasonal-guide" className="mb-20 scroll-mt-24 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiCalendar className="text-green-600 text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-800">Seasonal Gardening Guide</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Stay on top of seasonal gardening tasks with this monthly guide to keep your garden thriving year-round.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3">Spring Tasks</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Prepare garden beds</li>
                  <li>Start seeds indoors</li>
                  <li>Prune winter-damaged plants</li>
                  <li>Plant cool-season vegetables</li>
                  <li>Apply mulch to garden beds</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Summer Care</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Water deeply and regularly</li>
                  <li>Harvest vegetables frequently</li>
                  <li>Deadhead flowers</li>
                  <li>Watch for pests</li>
                  <li>Apply mulch to retain moisture</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Pest Control */}
        <section ref={sectionRefs.pestControl} id="pest-control" className="mb-20 scroll-mt-24 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiShield className="text-green-600 text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-800">Pest Control Solutions</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Keep your garden healthy with these organic pest control methods that are safe for your plants and the environment.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-3">Common Garden Pests</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Aphids - Use insecticidal soap or neem oil</li>
                  <li>Slugs and snails - Set up beer traps or use copper tape</li>
                  <li>Whiteflies - Use yellow sticky traps</li>
                  <li>Caterpillars - Handpick or use Bt (Bacillus thuringiensis)</li>
                  <li>Japanese beetles - Handpick or use neem oil</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Prevention Tips</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Encourage beneficial insects</li>
                  <li>Practice crop rotation</li>
                  <li>Keep garden clean of debris</li>
                  <li>Use row covers</li>
                  <li>Plant pest-resistant varieties</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default HomePage;
