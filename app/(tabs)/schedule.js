import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    minDuration: 60,
    includeWeekends: true,
    onlyFreeForAll: false,
    timeOfDay: 'any' // 'morning', 'afternoon', 'evening', 'any'
  });

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 22;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = {
        id: `${hour}-${selectedDate.toDateString()}`,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        duration: 60,
        availableMembers: ['Mor', 'Far', 'Emma', 'Lucas'].filter(() => Math.random() > 0.3),
        conflicts: Math.random() > 0.7 ? ['Møde', 'Skole'] : []
      };
      
      if (timeSlot.availableMembers.length > 0) {
        slots.push(timeSlot);
      }
    }
    
    return slots.filter(slot => {
      if (filters.onlyFreeForAll && slot.availableMembers.length < 4) return false;
      if (filters.timeOfDay !== 'any') {
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (filters.timeOfDay === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (filters.timeOfDay === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (filters.timeOfDay === 'evening' && hour < 18) return false;
      }
      return true;
    });
  };

  const timeSlots = generateTimeSlots();

  const getAvailabilityColor = (memberCount) => {
    if (memberCount === 4) return '#4CAF50';
    if (memberCount >= 2) return '#FF9800';
    return '#F44336';
  };

  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity style={styles.timeSlot}>
      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
        <Text style={styles.durationText}>{item.duration} min</Text>
      </View>
      
      <View style={styles.availabilityInfo}>
        <View style={[
          styles.availabilityIndicator, 
          { backgroundColor: getAvailabilityColor(item.availableMembers.length) }
        ]}>
          <Text style={styles.memberCount}>{item.availableMembers.length}/4</Text>
        </View>
        <View style={styles.membersList}>
          <Text style={styles.membersText}>
            {item.availableMembers.join(', ')}
          </Text>
          {item.conflicts.length > 0 && (
            <Text style={styles.conflictsText}>
              Konflikter: {item.conflicts.join(', ')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterSection = () => (
    <View style={styles.filtersSection}>
      <Text style={styles.sectionTitle}>Filtre</Text>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Inkluder weekender</Text>
        <Switch
          value={filters.includeWeekends}
          onValueChange={(value) => setFilters(prev => ({ ...prev, includeWeekends: value }))}
        />
      </View>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Kun når alle er ledige</Text>
        <Switch
          value={filters.onlyFreeForAll}
          onValueChange={(value) => setFilters(prev => ({ ...prev, onlyFreeForAll: value }))}
        />
      </View>
      
      <View style={styles.timeOfDayFilter}>
        <Text style={styles.filterLabel}>Tidspunkt på dagen</Text>
        <View style={styles.timeButtons}>
          {['any', 'morning', 'afternoon', 'evening'].map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeButton,
                filters.timeOfDay === time && styles.timeButtonActive
              ]}
              onPress={() => setFilters(prev => ({ ...prev, timeOfDay: time }))}
            >
              <Text style={[
                styles.timeButtonText,
                filters.timeOfDay === time && styles.timeButtonTextActive
              ]}>
                {time === 'any' ? 'Alle' : 
                 time === 'morning' ? 'Morgen' :
                 time === 'afternoon' ? 'Eftermiddag' : 'Aften'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ledig tid finder</Text>
        <Text style={styles.subtitle}>Find den perfekte tid til familieaktiviteter</Text>
      </View>

      <FilterSection />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tilgængelige tidspunkter ({timeSlots.length})
        </Text>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString('da-DK', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {timeSlots.length > 0 ? (
          <FlatList
            data={timeSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Ingen ledige tider fundet</Text>
            <Text style={styles.emptySubtext}>Prøv at justere dine filtre</Text>
          </View>
        )}
      </View>

      <View style={styles.legendSection}>
        <Text style={styles.sectionTitle}>Forklaring</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Alle familiemedlemmer ledige</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>2-3 familiemedlemmer ledige</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>1 familiemedlem ledig</Text>
        </View>
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
    backgroundColor: '#FF5722',
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
  filtersSection: {
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeOfDayFilter: {
    paddingTop: 15,
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  timeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  timeButtonActive: {
    backgroundColor: '#FF5722',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  timeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  timeSlot: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  availabilityInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  membersList: {
    flex: 1,
  },
  membersText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  conflictsText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  legendSection: {
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});