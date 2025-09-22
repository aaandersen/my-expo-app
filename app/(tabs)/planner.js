import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FamilyCalendarService } from '../../services/FamilyCalendarService';

export default function PlannerScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      title: 'Filmaften',
      icon: '🎬',
      duration: 120,
      suggestedTime: '19:30',
      description: 'Se en film sammen hjemme'
    },
    {
      id: 3,
      title: 'Spilaften',
      icon: '🎲',
      duration: 90,
      suggestedTime: '19:00',
      description: 'Brætspil eller kortspil sammen'
    },
    {
      id: 4,
      title: 'Udendørs aktivitet',
      icon: '🏃‍♂️',
      duration: 60,
      suggestedTime: '15:00',
      description: 'Gåtur, cykeltur eller sport'
    },
    {
      id: 5,
      title: 'Kreativ tid',
      icon: '🎨',
      duration: 90,
      suggestedTime: '14:00',
      description: 'Tegning, maling eller håndarbejde'
    },
    {
      id: 6,
      title: 'Læsetid',
      icon: '📚',
      duration: 45,
      suggestedTime: '20:00',
      description: 'Læse sammen eller hver for sig'
    }
  ];

  const familyMembers = ['Mor', 'Far', 'Emma', 'Lucas'];

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

      await FamilyCalendarService.createEvent({
        title: eventForm.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: eventForm.location,
        notes: eventForm.description
      });

      Alert.alert('Succes', 'Begivenheden er oprettet!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Fejl', 'Kunne ikke oprette begivenheden');
      console.error('Error creating event:', error);
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
                <TextInput
                  style={styles.formInput}
                  value={eventForm.date}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
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
});