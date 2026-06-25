import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function SubZonalConcerns() {
  const { currentUser, db, resolveComplaint } = useContext(DataContext);
  const [resolutions, setResolutions] = useState({});

  const extractZoneNumber = (zoneStr) => {
    if (!zoneStr) return null;
    const match = zoneStr.match(/Zone\s*0?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const myComplaints = db.complaints.filter(c => {
    if (!currentUser?.data) return false;
    const cZoneNum = extractZoneNumber(c.zone);
    const userZoneNum = extractZoneNumber(currentUser.data.zone);
    // c.subZone contains a long string like "Sub-Zone 1: ... Main Entrance...", so we check if it includes the area
    return (cZoneNum === userZoneNum) && (
      !currentUser.data.areasCovered || 
      (c.subZone && c.subZone.includes(currentUser.data.areasCovered))
    );
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sub-Zone Concerns</Text>
        <Text style={styles.headerSubtitle}>
          {currentUser?.data?.zone} - Sub-Zone {currentUser?.data?.subZone}
        </Text>
      </View>

      {myComplaints.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={60} color="#1A8C4E" />
          <Text style={styles.emptyText}>No active concerns for your sub-zone!</Text>
        </View>
      ) : (
        myComplaints.map(c => (
          <View key={c.id} style={styles.complaintCard}>
            <View style={styles.complaintHeader}>
              <View style={[styles.statusBadge, c.status === 'Resolved' && styles.statusBadgeResolved]}>
                <Text style={[styles.statusText, c.status === 'Resolved' && styles.statusTextResolved]}>{c.status}</Text>
              </View>
              <Text style={styles.dateText}>{c.timestamp}</Text>
            </View>
            
            <Text style={styles.subZoneText}>{c.category} - {c.subZone}</Text>
            <Text style={styles.descText}>{c.desc}</Text>
            {c.imageUri && (
              <Image source={{ uri: c.imageUri }} style={styles.concernImage} resizeMode="cover" />
            )}

            {c.status === 'Pending' && (
              <View style={styles.resolveSection}>
                <TextInput 
                  style={styles.resolveInput}
                  placeholder="Enter resolution remarks..."
                  value={resolutions[c.id] || ''}
                  onChangeText={(val) => setResolutions({...resolutions, [c.id]: val})}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.resolveButton}
                  onPress={() => {
                    if(!resolutions[c.id]) {
                      Alert.alert('Required', 'Please enter remarks to resolve this concern.');
                      return;
                    }
                    resolveComplaint(c.id, resolutions[c.id], null);
                    Alert.alert('Resolved', 'Concern has been marked as resolved.');
                  }}
                >
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  complaintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeResolved: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextResolved: {
    color: '#059669',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  subZoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  descText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  concernImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6'
  },
  resolveSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resolveInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  resolveButton: {
    backgroundColor: '#8C1B2F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
