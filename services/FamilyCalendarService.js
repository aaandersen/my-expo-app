import * as Calendar from "expo-calendar";

export class FamilyCalendarService {
  static async getEvents() {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        return [];
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(cal => cal.id);
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
      return events;
    } catch (error) {
      console.error("Error getting events:", error);
      return [];
    }
  }

  static async createEvent(eventData) {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Calendar permission not granted");
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isVisible && cal.allowsModifications);
      
      if (!defaultCalendar) {
        throw new Error("No writable calendar found");
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
      console.error("Error creating event:", error);
      throw error;
    }
  }
}
