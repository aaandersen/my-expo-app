import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FamilyCalendarService } from '../services/FamilyCalendarService';

const EventContext = createContext();

export { EventContext };

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

  const loadEvents = useCallback(async () => {
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
  }, []);

  const refreshEvents = useCallback(() => {
    console.log('EventContext: Explicit refresh called');
    loadEvents();
  }, [loadEvents]);

  const addEventDirectly = useCallback((newEvent) => {
    console.log('EventContext: Adding event directly:', newEvent.title);
    setEvents(prevEvents => [...prevEvents, newEvent]);
  }, []);

  const removeEventDirectly = useCallback((eventId) => {
    console.log('=== EventContext: removeEventDirectly called ===');
    console.log('EventContext: Removing event directly:', eventId);
    console.log('EventContext: Event ID type:', typeof eventId);
    
    setEvents(prevEvents => {
      console.log('EventContext: Previous events count:', prevEvents.length);
      console.log('EventContext: All event IDs and types:', prevEvents.map(e => ({ 
        id: e.id, 
        idType: typeof e.id,
        title: e.title 
      })));
      
      // Filter out the event by ID (ensure both are strings for comparison)
      const filtered = prevEvents.filter(event => String(event.id) !== String(eventId));
      
      console.log('EventContext: Events after removal:', filtered.length);
      const removed = prevEvents.length > filtered.length;
      console.log('EventContext: Successfully removed:', removed);
      
      if (removed) {
        console.log('EventContext: Event removed successfully from context');
      } else {
        console.log('EventContext: No event found with ID:', eventId);
        console.log('EventContext: Available IDs:', prevEvents.map(e => e.id));
      }
      
      return filtered;
    });
    
    // Force a re-render
    console.log('EventContext: Forcing re-render...');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('EventContext: Re-render completed');
    }, 100);
  }, []);

  // Listen for event updates - must be defined outside useEffect
  const handleEventUpdate = useCallback(() => {
    console.log('EventContext: Received event update notification');
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    // Force reload from storage first
    FamilyCalendarService.loadFromStorage();
    loadEvents();
    
    FamilyCalendarService.addListener(handleEventUpdate);
    
    // Cleanup listener on unmount
    return () => {
      FamilyCalendarService.removeListener(handleEventUpdate);
    };
  }, [loadEvents, handleEventUpdate]);

  const value = {
    events,
    isLoading,
    refreshEvents,
    loadEvents,
    addEventDirectly,
    removeEventDirectly
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};