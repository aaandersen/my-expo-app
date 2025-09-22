import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../../contexts/EventContext';
import { FamilyCalendarService } from '../../services/FamilyCalendarService';

export default function CalendarScreen() {
  const { events, isLoading, refreshEvents, removeEventDirectly } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      console.log('Calendar screen focused, refreshing events');
      refreshEvents();
    }, [refreshEvents])
  );

  const onRefresh = async () => {
    refreshEvents();
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const removeEventByObject = useCallback((eventToRemove) => {
    console.log('Removing event by object:', eventToRemove);
    const { events: currentEvents, refreshEvents: refresh } = useEvents();
    
    // Force state update by filtering out the exact event object
    refresh();
    
    // Also try to remove from service
    if (eventToRemove.id) {
      FamilyCalendarService.deleteEvent(eventToRemove.id).catch(console.error);
    }
  }, []);

  const handleDeleteEvent = async () => {
    if (!selectedEvent) {
      console.log('No selected event to delete');
      return;
    }

    console.log('Delete button pressed for event:', selectedEvent);
    console.log('Event ID:', selectedEvent.id);
    console.log('Event type:', typeof selectedEvent.id);

    Alert.alert(
      'Fjern begivenhed',
      `Er du sikker på at du vil fjerne "${selectedEvent.title}"?`,
      [
        {
          text: 'Annuller',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled by user')
        },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            console.log('=== DELETE CONFIRMED ===');
            console.log('Delete confirmed for event:', selectedEvent.title);
            console.log('Event ID to delete:', selectedEvent.id);
            
            try {
              // Store event to delete before closing modal
              const eventToDelete = { ...selectedEvent };
              console.log('Event copy created:', eventToDelete.id);
              
              // Close modal immediately to provide instant feedback
              closeEventModal();
              console.log('Modal closed');
              
              // Remove from storage and notify listeners
              console.log('Calling FamilyCalendarService.deleteEvent...');
              const deleted = await FamilyCalendarService.deleteEvent(eventToDelete.id);
              console.log('FamilyCalendarService.deleteEvent returned:', deleted);
              
              if (deleted) {
                console.log('Successfully deleted event from service');
                // Force refresh to update UI
                console.log('Calling refreshEvents...');
                refreshEvents();
                Alert.alert('Succes', 'Begivenheden er fjernet');
              } else {
                console.log('Event not found in service, trying context removal');
                // Fallback: remove directly from context
                console.log('Calling removeEventDirectly...');
                removeEventDirectly(eventToDelete.id);
                Alert.alert('Succes', 'Begivenheden er fjernet');
              }
              
            } catch (error) {
              console.error('Error deleting event:', error);
              console.log('Using final fallback...');
              
              // Final fallback: force remove and refresh
              removeEventDirectly(selectedEvent.id);
              refreshEvents();
              Alert.alert('Info', 'Begivenhed fjernet (fallback)');
            }
            
            console.log('=== DELETE PROCESS COMPLETED ===');
          },
        },
      ]
    );
  };

  // Group events by date
  const groupEventsByDate = () => {
    if (!events || events.length === 0) return [];
    
    // Create a map to group events by date
    const eventsByDate = new Map();
    
    events.forEach(event => {
      // Handle both startDate (from calendar API/mock) and date (from new format)
      let eventDate;
      try {
        if (event.startDate) {
          eventDate = new Date(event.startDate);
        } else if (event.date && event.time) {
          eventDate = new Date(`${event.date}T${event.time}`);
        } else {
          console.warn('Event has no valid date:', event);
          return; // Skip this event
        }
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid date created from event:', event);
          return; // Skip this event
        }
        
        // Extra safety check before calling toISOString
        let dateKey;
        try {
          dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch (error) {
          console.error('Error converting date to ISO string:', error, 'eventDate:', eventDate, 'original event:', event);
          return; // Skip this event
        }
      
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, {
            date: eventDate,
            dateKey,
            events: []
          });
        }
        
        eventsByDate.get(dateKey).events.push(event);
      } catch (error) {
        console.error('Error processing event in groupEventsByDate:', error, event);
      }
    });

    // Convert to array and sort by date
    const groupedEvents = Array.from(eventsByDate.values()).sort((a, b) => 
      new Date(a.dateKey) - new Date(b.dateKey)
    );

    return groupedEvents;
  };

  const formatDateHeader = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(date);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'I dag';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'I morgen';
    } else {
      return eventDate.toLocaleDateString('da-DK', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventTime}>
        {item.startDate ? 
          new Date(item.startDate).toLocaleTimeString('da-DK', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) :
          item.time ? item.time : 'Ingen tid'
        }
      </Text>
    </TouchableOpacity>
  );

  const renderDateSection = ({ item }) => (
    <View style={styles.dateSection}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>{formatDateHeader(item.date)}</Text>
        <Text style={styles.dateSubtitle}>
          {item.date.toLocaleDateString('da-DK', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </Text>
      </View>
      <FlatList
        data={item.events}
        renderItem={renderEvent}
        keyExtractor={(event, index) => `${item.dateKey}-${index}`}
        scrollEnabled={false}
      />
    </View>
  );

  const groupedEvents = groupEventsByDate();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={[styles.header, { paddingTop: 20 }]}>
          <Text style={styles.title}>Familiekalender</Text>
        </View>

      {groupedEvents.length > 0 ? (
        <FlatList
          data={groupedEvents}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.dateKey}
          scrollEnabled={false}
          style={styles.calendarList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ingen begivenheder planlagt</Text>
          <Text style={styles.emptySubtext}>Gå til Planlæg-tabben for at oprette begivenheder</Text>
        </View>
      )}

      {/* Event Detail Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Begivenhedsdetaljer</Text>
            <TouchableOpacity onPress={closeEventModal}>
              <Text style={styles.closeButton}>Luk</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedEvent && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Titel</Text>
                  <Text style={styles.detailValue}>{selectedEvent.title}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Dato</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.startDate ? 
                      new Date(selectedEvent.startDate).toLocaleDateString('da-DK', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) :
                      selectedEvent.date ? 
                        new Date(selectedEvent.date).toLocaleDateString('da-DK', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : 
                        'Ingen dato'
                    }
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tidspunkt</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.startDate ? 
                      new Date(selectedEvent.startDate).toLocaleTimeString('da-DK', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) :
                      selectedEvent.time ? selectedEvent.time : 'Ingen tid'
                    }
                    {selectedEvent.endDate && ` - ${new Date(selectedEvent.endDate).toLocaleTimeString('da-DK', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}`}
                  </Text>
                </View>

                {selectedEvent.location && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Sted</Text>
                    <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                  </View>
                )}

                {selectedEvent.notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Beskrivelse</Text>
                    <Text style={styles.detailValue}>{selectedEvent.notes}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Varighed</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.endDate && selectedEvent.startDate ? 
                      `${Math.round((new Date(selectedEvent.endDate) - new Date(selectedEvent.startDate)) / (1000 * 60))} minutter` :
                      'Ikke angivet'
                    }
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Oprettet</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.id ? selectedEvent.id.includes('mock') ? 'Lokalt i appen' : 'Kalender API' : 'Ukendt'}
                  </Text>
                </View>

                {/* Delete Button */}
                <View style={styles.deleteSection}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={handleDeleteEvent}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
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
  calendarList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  dateSection: {
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dateHeader: {
    backgroundColor: '#6B73FF',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  dateSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  eventItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#6B73FF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B73FF',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  deleteSection: {
    marginTop: 30,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFE5E5',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 24,
  },
});