import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Map, Sparkles } from 'lucide-react';

const ItineraryView = ({ itinerary, selectedLocation, setSelectedLocation, isProcessing }) => {

  if (isProcessing) {
    return (
      <div className="itinerary-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="processing-state"
          style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-color)' }}
        >
          <div className="loading-spinner" style={{ margin: '0 auto 1.5rem auto', width: '40px', height: '40px', borderWidth: '4px' }}></div>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} />
            Crafting Your Journey
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>Analyzing destinations and routes...</p>
        </motion.div>
      </div>
    );
  }

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="itinerary-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No itinerary planned yet.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Ask the assistant to create your personalized journey!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-container">
      <AnimatePresence>
        {itinerary.map((item, index) => {
          const isSelected = selectedLocation?.title === item.title;

          return (
            <motion.div 
              key={index} 
              className="itinerary-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Timeline connector visual */}
              {index < itinerary.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '42px',
                  top: '40px',
                  bottom: '-25px',
                  width: '2px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  zIndex: 0
                }} />
              )}

              <div className="itinerary-time">
                {item.time}
              </div>
              
              <div 
                className={`itinerary-content ${isSelected ? 'selected' : ''}`} 
                style={{ position: 'relative', zIndex: 1 }}
                onClick={() => setSelectedLocation(item)}
              >
                <h3>
                  <Clock size={18} style={{ color: 'var(--accent-color)' }} />
                  {item.title}
                </h3>
                <p>{item.description}</p>
                
                {item.location && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}>
                      <MapPin size={14} style={{ color: 'var(--accent-color)' }} />
                      {item.location}
                    </div>

                    <button 
                      className={`location-btn ${isSelected ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation(item);
                      }}
                    >
                      <Map size={14} />
                      View on Map
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryView;
