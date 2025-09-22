import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FamilyOverviewScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const familyMembers = [
    { 
      id: 1, 
      name: 'Mor', 
      status: 'ledig', 
      nextEvent: 'Møde kl. 14:00',
      weeklyHours: 35,
      freeHours: 8
    },
    { 
      id: 2, 
      name: 'Far', 
      status: 'optaget', 
      nextEvent: 'Arbejde til 17:00',
      weeklyHours: 40,
      freeHours: 12
    },
    { 
      id: 3, 
      name: 'Emma', 
      status: 'ledig', 
      nextEvent: 'Fodbold kl. 16:00',
      weeklyHours: 25,
      freeHours: 15
    },
    { 
      id: 4, 
      name: 'Lucas', 
      status: 'skole', 
      nextEvent: 'Hjem kl. 15:30',
      weeklyHours: 30,
      freeHours: 10
    }
  ];

  const quickActions = [
    { id: 1, title: 'Planlæg familietid', icon: '👨‍👩‍👧‍👦', action: 'plan' },
    { id: 2, title: 'Find ledig tid', icon: '⏰', action: 'schedule' },
    { id: 3, title: 'Opret begivenhed', icon: '📅', action: 'create' },
    { id: 4, title: 'Se ugeoversigt', icon: '📊', action: 'overview' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ledig': return '#4CAF50';
      case 'optaget': return '#F44336';
      case 'skole': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ledig': return '✅';
      case 'optaget': return '❌';
      case 'skole': return '🎓';
      default: return '❓';
    }
  };

  const renderFamilyMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <Text style={styles.memberName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.nextEvent}>{item.nextEvent}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.weeklyHours}t</Text>
          <Text style={styles.statLabel}>Denne uge</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.freeHours}t</Text>
          <Text style={styles.statLabel}>Ledig tid</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity style={styles.actionCard}>
      <Text style={styles.actionIcon}>{item.icon}</Text>
      <Text style={styles.actionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Familieoversigt</Text>
        <Text style={styles.subtitle}>Status lige nu</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Familiemedlemmer</Text>
        <FlatList
          data={familyMembers}
          renderItem={renderFamilyMember}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hurtige handlinger</Text>
        <FlatList
          data={quickActions}
          renderItem={renderQuickAction}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.actionRow}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ugestatistik</Text>
        <View style={styles.weekStats}>
          <View style={styles.weekStatItem}>
            <Text style={styles.weekStatNumber}>24t</Text>
            <Text style={styles.weekStatLabel}>Total familietid</Text>
          </View>
          <View style={styles.weekStatItem}>
            <Text style={styles.weekStatNumber}>6</Text>
            <Text style={styles.weekStatLabel}>Planlagte aktiviteter</Text>
          </View>
          <View style={styles.weekStatItem}>
            <Text style={styles.weekStatNumber}>12t</Text>
            <Text style={styles.weekStatLabel}>Fælles ledig tid</Text>
          </View>
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
    backgroundColor: '#9C27B0',
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
  memberCard: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  nextEvent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  actionRow: {
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 0.48,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  weekStatItem: {
    alignItems: 'center',
  },
  weekStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  weekStatLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
});