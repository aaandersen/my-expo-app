import * as Calendar from "expo-calendar";

export class FamilyCalendarService {
  // Array to store user-created events
  static mockEvents = [];

  // Event listeners for real-time updates
  static listeners = [];

  // Load events from localStorage on service initialization
  static {
    // Clear localStorage for clean start - remove this line after testing
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('famtime-events');
      console.log('Cleared localStorage for clean start');
    }
    this.loadFromStorage();
  }

  static loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('famtime-events');
        console.log('Loading from storage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate each event has proper date structure
          this.mockEvents = parsed.filter(event => {
            const hasValidDate = event.startDate || (event.date && event.time);
            if (!hasValidDate) {
              console.warn('Filtering out invalid event:', event);
            }
            return hasValidDate;
          });
          console.log('Loaded valid events from storage:', this.mockEvents.length);
        }
      }
    } catch (error) {
      console.log('Could not load events from storage, clearing:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('famtime-events');
      }
      this.mockEvents = [];
    }
  }

  static saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('Saving to storage:', this.mockEvents.length, 'events');
        localStorage.setItem('famtime-events', JSON.stringify(this.mockEvents));
      }
    } catch (error) {
      console.log('Could not save events to storage:', error);
    }
  }

  static addListener(callback) {
    this.listeners.push(callback);
  }

  static removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  static notifyListeners() {
    console.log('Notifying listeners, count:', this.listeners.length);
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in listener callback:', error);
      }
    });
  }

  static async getEvents() {
    try {
      // Always reload from storage first to ensure fresh data
      this.loadFromStorage();
      
      // Filter out any events with invalid dates before returning
      this.mockEvents = this.mockEvents.filter(event => {
        try {
          if (event.startDate) {
            const testDate = new Date(event.startDate);
            if (isNaN(testDate.getTime())) {
              console.warn('Removing event with invalid startDate:', event);
              return false;
            }
            // Extra check for toISOString
            testDate.toISOString();
            return true;
          } else if (event.date && event.time) {
            const testDate = new Date(`${event.date}T${event.time}`);
            if (isNaN(testDate.getTime())) {
              console.warn('Removing event with invalid date/time:', event);
              return false;
            }
            // Extra check for toISOString
            testDate.toISOString();
            return true;
          } else {
            console.warn('Removing event with no valid date:', event);
            return false;
          }
        } catch (error) {
          console.error('Error validating event, removing:', error, event);
          return false;
        }
      });
      
      // Save cleaned data back to storage
      this.saveToStorage();
      
      // Try to use real Calendar API first
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        console.log("Calendar permission not granted, using cleaned mock data");
        return this.mockEvents;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(cal => cal.id);
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
      
      // Combine real events with cleaned mock events
      return [...events, ...this.mockEvents];
    } catch (error) {
      console.error("Error getting events, using cleaned mock data:", error);
      return this.mockEvents;
    }
  }

  static async createEvent(eventData) {
    try {
      // Try to use real Calendar API first
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        console.log("Calendar permission not granted, adding to mock data");
        
        // Add to mock events for testing
        const newEvent = {
          id: `mock-${Date.now()}`,
          title: eventData.title,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          location: eventData.location,
          notes: eventData.notes || eventData.description
        };
        
        this.mockEvents.push(newEvent);
        console.log('Added new event (no permission), total events:', this.mockEvents.length);
        this.saveToStorage(); // Save to localStorage
        this.notifyListeners(); // Notify calendar to refresh
        return newEvent.id;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isVisible && cal.allowsModifications);
      
      if (!defaultCalendar) {
        // Fallback to mock data
        const newEvent = {
          id: `mock-${Date.now()}`,
          title: eventData.title,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          location: eventData.location,
          notes: eventData.notes || eventData.description
        };
        
        this.mockEvents.push(newEvent);
        this.saveToStorage(); // Save to localStorage
        this.notifyListeners(); // Notify calendar to refresh
        return newEvent.id;
      }

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: eventData.title,
        notes: eventData.notes || eventData.description,
        location: eventData.location,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      this.notifyListeners(); // Notify calendar to refresh
      return eventId;
    } catch (error) {
      console.error("Error creating event, adding to mock data:", error);
      
      // Always fallback to mock data so the UI works
      const newEvent = {
        id: `mock-${Date.now()}`,
        title: eventData.title,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        notes: eventData.notes || eventData.description
      };
      
      this.mockEvents.push(newEvent);
      this.saveToStorage(); // Save to localStorage
      this.notifyListeners(); // Notify calendar to refresh
      return newEvent.id;
    }
  }

  static async deleteEvent(eventId) {
    console.log('FamilyCalendarService.deleteEvent called with ID:', eventId);
    console.log('Current mockEvents before deletion:', this.mockEvents.length);
    console.log('All events:', this.mockEvents.map(e => ({ id: e.id, title: e.title })));
    
    try {
      // Try to delete from real Calendar API first
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        // Only attempt to delete from real calendar if it's not a mock event
        if (!eventId.includes('mock')) {
          try {
            await Calendar.deleteEventAsync(eventId);
            console.log('Event deleted from real calendar:', eventId);
          } catch (error) {
            console.log('Could not delete from real calendar, continuing with mock deletion:', error.message);
          }
        }
      }

      // Always remove from mock events (handles both mock and real events stored locally)
      const initialLength = this.mockEvents.length;
      this.mockEvents = this.mockEvents.filter(event => event.id !== eventId);
      
      console.log('After filtering: mockEvents length changed from', initialLength, 'to', this.mockEvents.length);
      console.log('Remaining events:', this.mockEvents.map(e => ({ id: e.id, title: e.title })));
      
      const wasRemoved = this.mockEvents.length < initialLength;
      
      if (wasRemoved) {
        console.log('Event successfully removed from mock data:', eventId);
        this.saveToStorage();
        this.notifyListeners();
        return true;
      } else {
        console.log('Event not found in mock data with ID:', eventId);
        return false;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      
      // Fallback: always try to remove from mock data
      const initialLength = this.mockEvents.length;
      this.mockEvents = this.mockEvents.filter(event => event.id !== eventId);
      
      const wasRemoved = this.mockEvents.length < initialLength;
      if (wasRemoved) {
        console.log('Event removed in fallback:', eventId);
        this.saveToStorage();
        this.notifyListeners();
        return true;
      }
      return false;
    }
  }

  static clearAllEvents() {
    this.mockEvents = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}
