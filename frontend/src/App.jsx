import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Map, Globe2 } from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import ItineraryView from './components/ItineraryView';
import InteractiveMap from './components/InteractiveMap';
import './index.css';

function App() {
  const [itinerary, setItinerary] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="layout-wrapper">
      {/* Sidebar Chat */}
      <motion.aside 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sidebar-chat"
      >
        <div className="sidebar-header">
          <h2>Travel Assistant</h2>
        </div>
        <ChatAssistant 
          setItinerary={setItinerary} 
          setIsProcessing={setIsProcessing} 
        />
      </motion.aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="modern-header">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="logo-container"
          >
            <div className="logo-icon-wrapper">
              <Globe2 className="globe-icon" size={28} />
              <Plane className="plane-icon" size={20} />
            </div>
            <h1 className="gradient-text">Odyssey Travel Engine</h1>
          </motion.div>
          <p className="subtitle">AI-Powered Journey Crafting</p>
        </header>
        
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="content-panel glass-panel" 
        >
          <div className="panel-header">
            <Map size={24} className="header-icon" />
            <h2>Your Journey</h2>
          </div>
          
          <div className="map-wrapper">
            <InteractiveMap 
              itinerary={itinerary} 
              selectedLocation={selectedLocation} 
              setSelectedLocation={setSelectedLocation} 
            />
          </div>
          
          <ItineraryView 
            itinerary={itinerary} 
            selectedLocation={selectedLocation} 
            setSelectedLocation={setSelectedLocation}
            isProcessing={isProcessing}
          />
        </motion.section>

        <footer className="modern-footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} Odyssey Travel Engine. All rights reserved.</p>
            <div className="footer-links">
              <span>Powered by Gemini & Google Maps</span>
              <span className="dot">•</span>
              <a href="#">Privacy</a>
              <span className="dot">•</span>
              <a href="#">Terms</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
