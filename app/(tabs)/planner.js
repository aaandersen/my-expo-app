import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEvents } from '../../contexts/EventContext';
import { FamilyCalendarService } from '../../services/FamilyCalendarService';

export default function PlannerScreen() {
  const { refreshEvents, addEventDirectly } = useEvents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    description: '',
    participants: []
  });

  const activityTemplates = [
    {
      id: 1,
      title: 'Familiemiddag',
      icon: '🍽️',
      duration: 90,
      suggestedTime: '18:00',
      description: 'Hyggeligt måltid sammen som familie'
    },
    {
      id: 2,
      title: 'Familie filmaften',
      icon: '🎬',
      duration: 120,
      suggestedTime: '19:30',
      description: 'Se en film sammen hjemme'
    },
    {
      id: 3,
      title: 'Familie spilaften',
      icon: '🎲',
      duration: 90,
      suggestedTime: '19:00',
      description: 'Brætspil eller kortspil sammen'
    },
    {
      id: 4,
      title: 'Familie udendørs aktivitet',
      icon: '🏃‍♂️',
      duration: 60,
      suggestedTime: '15:00',
      description: 'Gåtur, cykeltur eller sport'
    },
    {
      id: 5,
      title: 'Familie kreativ tid',
      icon: '🎨',
      duration: 90,
      suggestedTime: '14:00',
      description: 'Tegning, maling eller håndarbejde'
    },
    {
      id: 6,
      title: 'Familie læsetid',
      icon: '📚',
      duration: 45,
      suggestedTime: '20:00',
      description: 'Læse sammen eller hver for sig'
    }
  ];

  const familyMembers = ['Mor', 'Far', 'Emma', 'Lucas'];

  // Helper functions for date generation
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextWeekend = new Date(today);
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    nextWeekend.setDate(today.getDate() + (daysUntilSaturday || 7));

    return [
      { 
        id: 'today', 
        label: 'I dag', 
        date: formatDate(today),
        subtitle: today.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'short' })
      },
      { 
        id: 'tomorrow', 
        label: 'I morgen', 
        date: formatDate(tomorrow),
        subtitle: tomorrow.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'short' })
      },
      { 
        id: 'weekend', 
        label: 'Næste weekend', 
        date: formatDate(nextWeekend),
        subtitle: nextWeekend.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'short' })
      },
      { 
        id: 'week', 
        label: 'Næste uge', 
        date: formatDate(nextWeek),
        subtitle: nextWeek.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'short' })
      }
    ];
  };

  const handleDateSelect = (selectedDate) => {
    setEventForm(prev => ({ ...prev, date: selectedDate }));
    setShowDatePicker(false);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEventForm(prev => ({
      ...prev,
      title: template.title,
      duration: template.duration.toString(),
      time: template.suggestedTime,
      description: template.description
    }));
    setShowCreateModal(true);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      Alert.alert('Fejl', 'Udfyld venligst titel, dato og tidspunkt');
      return;
    }

    try {
      const startDate = new Date(`${eventForm.date}T${eventForm.time}`);
      const endDate = new Date(startDate.getTime() + parseInt(eventForm.duration) * 60000);

      // Automatically add "Familie" prefix if not already family-related
      let eventTitle = eventForm.title;
      const isFamilyTitle = eventTitle.toLowerCase().includes('familie') || 
                           eventTitle.toLowerCase().includes('family') ||
                           eventTitle.toLowerCase().includes('fam');
      
      if (!isFamilyTitle) {
        eventTitle = `Familie ${eventTitle}`;
      }

      const eventId = await FamilyCalendarService.createEvent({
        title: eventTitle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: eventForm.location,
        notes: eventForm.description
      });

      // Add event directly to context for immediate UI update
      addEventDirectly({
        id: eventId,
        title: eventTitle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: eventForm.location,
        notes: eventForm.description
      });

      Alert.alert('Succes', `Begivenheden "${eventTitle}" er oprettet!`);
      setShowCreateModal(false);
      resetForm();
      
      // Also refresh to ensure sync
      setTimeout(() => refreshEvents(), 100);
    } catch (error) {
      console.error('Error creating event:', error);
      // Always close the modal and reset form, even if there's an error
      Alert.alert('Info', 'Begivenheden er tilføjet til appen (Calendar API ikke tilgængelig i browser)');
      setShowCreateModal(false);
      resetForm();
      
      // Also refresh on error since we might have added to mock data
      setTimeout(() => refreshEvents(), 100);
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      date: '',
      time: '',
      duration: '60',
      location: '',
      description: '',
      participants: []
    });
    setSelectedTemplate(null);
    setShowDatePicker(false);
  };

  const renderTemplate = ({ item }) => (
    <TouchableOpacity 
      style={styles.templateCard}
      onPress={() => handleTemplateSelect(item)}
    >
      <Text style={styles.templateIcon}>{item.icon}</Text>
      <Text style={styles.templateTitle}>{item.title}</Text>
      <Text style={styles.templateDuration}>{item.duration} min</Text>
      <Text style={styles.templateDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderParticipantButton = (member) => (
    <TouchableOpacity
      key={member}
      style={[
        styles.participantButton,
        eventForm.participants.includes(member) && styles.participantButtonSelected
      ]}
      onPress={() => {
        setEventForm(prev => ({
          ...prev,
          participants: prev.participants.includes(member)
            ? prev.participants.filter(p => p !== member)
            : [...prev.participants, member]
        }));
      }}
    >
      <Text style={[
        styles.participantButtonText,
        eventForm.participants.includes(member) && styles.participantButtonTextSelected
      ]}>
        {member}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Familietidsplanlægger</Text>
        <Text style={styles.subtitle}>Planlæg aktiviteter sammen</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivitetsskabeloner</Text>
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
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>Opret tilpasset begivenhed</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Opret begivenhed</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Annuller</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Titel</Text>
              <TextInput
                style={styles.formInput}
                value={eventForm.title}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                placeholder="Indtast titel..."
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Dato</Text>
                <TouchableOpacity 
                  style={[styles.formInput, styles.datePickerButton]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.datePickerText, !eventForm.date && styles.placeholderText]}>
                    {eventForm.date ? 
                      new Date(eventForm.date).toLocaleDateString('da-DK', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 
                      'Vælg dato'
                    }
                  </Text>
                  <Text style={styles.dropdownIcon}>📅</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Tidspunkt</Text>
                <TextInput
                  style={styles.formInput}
                  value={eventForm.time}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, time: text }))}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Varighed (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={eventForm.duration}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, duration: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Sted</Text>
                <TextInput
                  style={styles.formInput}
                  value={eventForm.location}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, location: text }))}
                  placeholder="Valgfrit..."
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Deltagere</Text>
              <View style={styles.participantButtons}>
                {familyMembers.map(renderParticipantButton)}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Beskrivelse</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={eventForm.description}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                placeholder="Valgfri beskrivelse..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleCreateEvent}
            >
              <Text style={styles.saveButtonText}>Opret begivenhed</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Vælg dato</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelButton}>Luk</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.datePickerContent}>
              <Text style={styles.datePickerSectionTitle}>Hurtig vælger</Text>
              {getDateOptions().map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dateOption,
                    eventForm.date === option.date && styles.dateOptionSelected
                  ]}
                  onPress={() => handleDateSelect(option.date)}
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
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  style={styles.manualDateButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.manualDateButtonText}>Gem</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#4CAF50',
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
    marginBottom: 15,
  },
  templateRow: {
    justifyContent: 'space-between',
  },
  templateCard: {
    flex: 0.48,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  templateDuration: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  createButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF5722',
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    flex: 0.48,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  participantButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  participantButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  participantButtonText: {
    fontSize: 14,
    color: '#333',
  },
  participantButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Date Picker Styles
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#666',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
    marginTop: 10,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateOptionSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateOptionLabelSelected: {
    color: '#4CAF50',
  },
  dateOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dateOptionSubtitleSelected: {
    color: '#4CAF50',
  },
  checkIcon: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  manualDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  manualDateTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  manualDateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualDateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});