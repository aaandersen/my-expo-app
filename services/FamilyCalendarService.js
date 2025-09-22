import * as Calendar from "expo-calendar";

export class FamilyCalendarService {
  // Mock events for testing (since Calendar API doesn't work in browser)
  static mockEvents = [
    {
      id: 'mock-1',
      title: 'Familieudflyt til zoo',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      location: 'Københavns Zoo',
      notes: 'En hyggelig dag sammen'
    }
  ];

  static async getEvents() {
    try {
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
      return newEvent.id;
    }
  }
}
