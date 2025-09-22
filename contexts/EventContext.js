import React, { createContext, useContext, useEffect, useState } from 'react';
import { FamilyCalendarService } from '../services/FamilyCalendarService';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const calendarEvents = await FamilyCalendarService.getEvents();
      console.log('EventContext: Loaded events:', calendarEvents.length);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('EventContext: Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEvents = () => {
    loadEvents();
  };

  useEffect(() => {
    loadEvents();
    
    // Listen for event updates
    const handleEventUpdate = () => {
      console.log('EventContext: Received event update notification');
      loadEvents();
    };
    
    FamilyCalendarService.addListener(handleEventUpdate);
    
    // Cleanup listener on unmount
    return () => {
      FamilyCalendarService.removeListener(handleEventUpdate);
    };
  }, []);

  const value = {
    events,
    isLoading,
    refreshEvents,
    loadEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};