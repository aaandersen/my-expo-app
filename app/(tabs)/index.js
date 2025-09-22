import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FamilyCalendarService } from '../../services/FamilyCalendarService';

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date();
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === today.toDateString();
  });

  // Filter for upcoming family events (within next 7 days AND contains family keywords)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const isUpcoming = eventDate > today && eventDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isFamilyEvent = event.title.toLowerCase().includes('familie') || 
                         event.title.toLowerCase().includes('family') ||
                         event.title.toLowerCase().includes('fam');
    return isUpcoming && isFamilyEvent;
  });

  // All family events (regardless of date)
  const familyEvents = events.filter(event => 
    event.title.toLowerCase().includes('familie') || 
    event.title.toLowerCase().includes('family') ||
    event.title.toLowerCase().includes('fam')
  );

  useEffect(() => {
    loadEvents();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    try {
      const calendarEvents = await FamilyCalendarService.getEvents();
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventTime}>
        {new Date(item.startDate).toLocaleTimeString('da-DK', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
        {item.endDate && ` - ${new Date(item.endDate).toLocaleTimeString('da-DK', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`}
      </Text>
      {item.location && <Text style={styles.eventLocation}>{item.location}</Text>}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Familiekalender</Text>
        <Text style={styles.subtitle}>
          {today.toLocaleDateString('da-DK', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I dag ({todayEvents.length})</Text>
        {todayEvents.length > 0 ? (
          <FlatList
            data={todayEvents}
            renderItem={renderEvent}
            keyExtractor={(item, index) => `today-${index}`}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>Ingen begivenheder i dag</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kommende uges familietid ({upcomingEvents.length})</Text>
        {upcomingEvents.length > 0 ? (
          <FlatList
            data={upcomingEvents}
            renderItem={renderEvent}
            keyExtractor={(item, index) => `upcoming-${index}`}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>Ingen kommende begivenheder</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Familiebegivenheder ({familyEvents.length})</Text>
        {familyEvents.length > 0 ? (
          <FlatList
            data={familyEvents}
            renderItem={renderEvent}
            keyExtractor={(item, index) => `family-${index}`}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>Ingen familiebegivenheder</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6B73FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  eventItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B73FF',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});