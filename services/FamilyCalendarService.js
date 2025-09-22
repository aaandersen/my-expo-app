import * as Calendar from "expo-calendar";

export class FamilyCalendarService {
  // Array to store user-created events
  static mockEvents = [];

  // Event listeners for real-time updates
  static listeners = [];

  // Load events from localStorage on service initialization
  static {
    this.loadFromStorage();
  }

  static loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('famtime-events');
        console.log('Loading from storage:', stored);
        if (stored) {
          this.mockEvents = JSON.parse(stored);
          console.log('Loaded events from storage:', this.mockEvents.length);
        }
      }
    } catch (error) {
      console.log('Could not load events from storage:', error);
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
      
      // Try to use real Calendar API first
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        console.log("Calendar permission not granted, using mock data");
        return this.mockEvents;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(cal => cal.id);
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
      
      // Combine real events with mock events
      return [...events, ...this.mockEvents];
    } catch (error) {
      console.error("Error getting events, using mock data:", error);
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

  static clearAllEvents() {
    this.mockEvents = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}
