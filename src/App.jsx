import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PlantProvider } from './context/PlantContext';
import { TaskProvider } from './context/TaskContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import PlantLibrary from './pages/PlantLibrary';
import PlantDetail from './pages/PlantDetail';
import AddEditPlant from './pages/AddEditTask.jsx';
import TaskList from './pages/TaskList';
import AddEditTask from './pages/AddEditTask';
import Journal from './pages/Journal';
import Weather from './pages/Weather';
import Community from './pages/Community';
import GardenLayout from './pages/GardenLayout';
import PestDisease from './pages/PestDisease';
import NotFound from './pages/NotFound';
import Alert from './components/Alert';
import { AnimatePresence } from 'framer-motion';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppProvider>
        <PlantProvider>
          <TaskProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar 
                isMobileMenuOpen={isMobileMenuOpen} 
                toggleMobileMenu={toggleMobileMenu} 
              />
              
              <main className="flex-grow pt-16 pb-8 md:pt-20">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/plants" element={<PlantLibrary />} />
                    <Route path="/plants/add" element={<AddEditPlant />} />
                    <Route path="/plants/:id" element={<PlantDetail />} />
                    <Route path="/plants/edit/:id" element={<AddEditPlant />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/tasks/add" element={<AddEditTask />} />
                    <Route path="/tasks/edit/:id" element={<AddEditTask />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/garden" element={<GardenLayout />} />
                    <Route path="/pest-disease" element={<PestDisease />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </AnimatePresence>
              </main>

              <Footer />
              <Alert />
            </div>
          </TaskProvider>
        </PlantProvider>
      </AppProvider>
    </Router>
  );
};

export default App;