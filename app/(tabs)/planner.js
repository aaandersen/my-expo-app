import { useContext, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventContext } from '../../contexts/EventContext';
import { FamilyCalendarService } from '../../services/FamilyCalendarService';

export default function PlannerScreen() {
  const { addEventDirectly } = useContext(EventContext);
  const insets = useSafeAreaInsets();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'custom'
  });

  console.log('PlannerScreen rendered, showCreateModal:', showCreateModal);
  console.log('PlannerScreen showDatePicker:', showDatePicker);
  console.log('PlannerScreen showTimePicker:', showTimePicker);

  const activityTemplates = [
    { id: 1, title: 'Familie middag', emoji: '🍽️', type: 'meal' },
    { id: 2, title: 'Film aften', emoji: '🎬', type: 'entertainment' },
    { id: 3, title: 'Spil tid', emoji: '🎮', type: 'game' },
    { id: 4, title: 'Gå tur', emoji: '🚶', type: 'exercise' },
    { id: 5, title: 'Læse sammen', emoji: '📚', type: 'educational' },
    { id: 6, title: 'Bage/Lave mad', emoji: '👨‍🍳', type: 'cooking' },
    { id: 7, title: 'Besøg familie', emoji: '👨‍👩‍👧‍👦', type: 'family' },
    { id: 8, title: 'Sport aktivitet', emoji: '⚽', type: 'sports' },
  ];

  const getDateOptions = () => [
    { id: 1, label: 'I dag', date: new Date().toISOString().split('T')[0], subtitle: new Date().toLocaleDateString('da-DK') },
    { id: 2, label: 'I morgen', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], subtitle: new Date(Date.now() + 86400000).toLocaleDateString('da-DK') },
    { id: 3, label: 'Denne weekend', date: getNextWeekendDate(), subtitle: 'Lørdag eller søndag' },
    { id: 4, label: 'Næste uge', date: getNextWeekDate(), subtitle: 'Mandag næste uge' }
  ];

  const getTimeOptions = () => [
    { id: 1, label: 'Morgen', time: '08:00', subtitle: 'Start dagen sammen' },
    { id: 2, label: 'Frokost', time: '12:00', subtitle: 'Middag pause' },
    { id: 3, label: 'Eftermiddag', time: '15:00', subtitle: 'Efter skole/arbejde' },
    { id: 4, label: 'Aften', time: '18:00', subtitle: 'Middag tid' },
    { id: 5, label: 'Nat', time: '20:00', subtitle: 'Hygge tid' }
  ];

  const getNextWeekendDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    const saturday = new Date(today.getTime() + daysUntilSaturday * 86400000);
    return saturday.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextMonday = 8 - dayOfWeek;
    const nextMonday = new Date(today.getTime() + daysUntilNextMonday * 86400000);
    return nextMonday.toISOString().split('T')[0];
  };

  const handleTemplateSelect = (template) => {
    setEventForm({
      title: template.title,
      description: `Familie aktivitet: ${template.title}`,
      date: '',
      time: '',
      type: template.type
    });
    setShowCreateModal(true);
    console.log('Modal shown:', true);
  };

  const handleDateSelect = (date) => {
    console.log('Date selected:', date);
    setEventForm(prev => ({ ...prev, date }));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time) => {
    console.log('Time selected:', time);
    setEventForm(prev => ({ ...prev, time }));
    setShowTimePicker(false);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      Alert.alert('Fejl', 'Udfyld venligst alle felter');
      return;
    }

    try {
      // Convert date and time to proper Date objects
      const startDate = new Date(`${eventForm.date}T${eventForm.time}`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        notes: eventForm.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: ''
      };

      // Save to storage first
      const eventId = await FamilyCalendarService.createEvent(eventData);
      
      // Create event for context with startDate format for compatibility
      const event = {
        id: eventId,
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: eventForm.description,
        // Keep original fields for backward compatibility
        date: eventForm.date,
        time: eventForm.time,
        type: eventForm.type
      };
      
      // Then add to context
      addEventDirectly(event);
      
      setShowCreateModal(false);
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'custom'
      });
      Alert.alert('Succes', 'Begivenhed oprettet!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette begivenhed');
    }
  };

  const renderTemplate = ({ item }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => handleTemplateSelect(item)}
    >
      <Text style={styles.templateEmoji}>{item.emoji}</Text>
      <Text style={styles.templateTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Show date picker if it's open
  if (showDatePicker) {
    return (
      <SafeAreaView style={styles.datePickerModal} edges={['top', 'bottom']}>
        <View style={styles.datePickerHeader}>
          <Text style={styles.datePickerTitle}>Vælg dato</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('Date picker closing');
              setShowDatePicker(false);
            }}
            style={styles.closeButton}
          >
            <Text style={styles.cancelButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.datePickerContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <Text style={styles.datePickerSectionTitle}>Hurtig vælger</Text>
          {getDateOptions().map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dateOption,
                eventForm.date === option.date && styles.dateOptionSelected
              ]}
              onPress={() => {
                console.log('Date option selected:', option);
                handleDateSelect(option.date);
              }}
            >
              <View style={styles.dateOptionContent}>
                <Text style={[
                  styles.dateOptionLabel,
                  eventForm.date === option.date && styles.dateOptionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.dateOptionSubtitle,
                  eventForm.date === option.date && styles.dateOptionSubtitleSelected
                ]}>
                  {option.subtitle}
                </Text>
              </View>
              {eventForm.date === option.date && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          
          <Text style={styles.datePickerSectionTitle}>Manuel indtastning</Text>
          <View style={styles.manualDateInput}>
            <TextInput
              style={styles.manualDateTextInput}
              value={eventForm.date}
              onChangeText={(text) => {
                console.log('Manual date input:', text);
                setEventForm(prev => ({ ...prev, date: text }));
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.manualDateButton}
              onPress={() => {
                console.log('Manual date saved:', eventForm.date);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.manualDateButtonText}>Gem</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show time picker if it's open
  if (showTimePicker) {
    return (
      <SafeAreaView style={styles.datePickerModal} edges={['top', 'bottom']}>
        <View style={styles.datePickerHeader}>
          <Text style={styles.datePickerTitle}>Vælg tidspunkt</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('Time picker closing');
              setShowTimePicker(false);
            }}
            style={styles.closeButton}
          >
            <Text style={styles.cancelButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.datePickerContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <Text style={styles.datePickerSectionTitle}>Hurtig vælger</Text>
          {getTimeOptions().map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dateOption,
                eventForm.time === option.time && styles.dateOptionSelected
              ]}
              onPress={() => {
                console.log('Time option selected:', option);
                handleTimeSelect(option.time);
              }}
            >
              <View style={styles.dateOptionContent}>
                <Text style={[
                  styles.dateOptionLabel,
                  eventForm.time === option.time && styles.dateOptionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.dateOptionSubtitle,
                  eventForm.time === option.time && styles.dateOptionSubtitleSelected
                ]}>
                  {option.time} - {option.subtitle}
                </Text>
              </View>
              {eventForm.time === option.time && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          
          <Text style={styles.datePickerSectionTitle}>Manuel indtastning</Text>
          <View style={styles.manualDateInput}>
            <TextInput
              style={styles.manualDateTextInput}
              value={eventForm.time}
              onChangeText={(text) => setEventForm(prev => ({ ...prev, time: text }))}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.manualDateButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.manualDateButtonText}>Gem</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={[styles.header, { paddingTop: 20 }]}>
          <Text style={styles.title}>Familietidsplanlægger</Text>
        </View>

        <View style={styles.section}>
          <FlatList
            data={activityTemplates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.templateRow}
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.customEventButton}
            onPress={() => {
              setEventForm({
                title: '',
                description: '',
                date: '',
                time: '',
                type: 'custom'
              });
              setShowCreateModal(true);
            }}
          >
            <Text style={styles.customEventButtonText}>+ Opret brugerdefineret begivenhed</Text>
          </TouchableOpacity>
        </View>

        {/* Create Event Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelButton}>Annuller</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ny begivenhed</Text>
              <TouchableOpacity onPress={handleCreateEvent}>
                <Text style={styles.saveButton}>Gem</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titel</Text>
                <TextInput
                  style={styles.textInput}
                  value={eventForm.title}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                  placeholder="Indtast titel..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Beskrivelse</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={eventForm.description}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                  placeholder="Indtast beskrivelse..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dato</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('Date picker button pressed');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={eventForm.date ? styles.dateTimeButtonTextFilled : styles.dateTimeButtonText}>
                    {eventForm.date || 'Vælg dato'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tidspunkt</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('Time picker button pressed');
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={eventForm.time ? styles.dateTimeButtonTextFilled : styles.dateTimeButtonText}>
                    {eventForm.time || 'Vælg tidspunkt'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
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
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 9999,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  templateRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  customEventButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  customEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#999',
  },
  dateTimeButtonTextFilled: {
    fontSize: 16,
    color: '#333',
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  datePickerContent: {
    flex: 1,
    padding: 20,
  },
  datePickerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateOptionLabelSelected: {
    color: '#007AFF',
  },
  dateOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dateOptionSubtitleSelected: {
    color: '#007AFF',
  },
  checkIcon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  manualDateInput: {
    flexDirection: 'row',
    gap: 10,
  },
  manualDateTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  manualDateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  manualDateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});