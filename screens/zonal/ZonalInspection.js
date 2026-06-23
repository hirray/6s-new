import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';

export default function ZonalInspection() {
  const { currentUser, db } = useContext(DataContext);
  
  // Filter complaints based on the current user's zone. 
  const myComplaints = db.complaints.filter(c => {
    if (!currentUser?.data) return true; 
    return c.zone.includes(currentUser.data.zone) || currentUser.data.zone.includes(c.zone);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zone Inspections</Text>
        <Text style={styles.headerSubtitle}>Overview of all sub-zone concerns</Text>
      </View>

      {myComplaints.length === 0 ? (
        <Text style={styles.emptyText}>No concerns raised in your zone.</Text>
      ) : (
        myComplaints.map(c => {
          const isResolved = c.status === 'Resolved' || c.status === 'Approved';
          const resolutionDesc = c.remarks && c.remarks.length > 0 ? c.remarks[c.remarks.length - 1].text : 'No description provided';
          const resolutionTime = c.remarks && c.remarks.length > 0 ? c.remarks[c.remarks.length - 1].date : '';

          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, isResolved && styles.statusBadgeResolved]}>
                  <Text style={[styles.statusText, isResolved && styles.statusTextResolved]}>{c.status}</Text>
                </View>
                <Text style={styles.dateText}>{c.date}</Text>
              </View>
              <Text style={styles.subZoneText}>{c.subZone}</Text>
              <Text style={styles.descText}>{c.desc}</Text>
              
              {isResolved && (
                <View style={styles.resolutionBox}>
                  <Text style={styles.resolutionLabel}>Resolution Details:</Text>
                  <Text style={styles.resolutionDesc}>{resolutionDesc}</Text>
                  {resolutionTime ? <Text style={styles.resolutionTime}>Completed on: {resolutionTime}</Text> : null}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  header: { marginBottom: 20, paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  emptyText: { color: '#6B7280', fontSize: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeResolved: { backgroundColor: '#D1FAE5' },
  statusText: { color: '#D97706', fontSize: 12, fontWeight: 'bold' },
  statusTextResolved: { color: '#059669' },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  subZoneText: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 4 },
  descText: { fontSize: 15, color: '#111827', lineHeight: 22 },
  resolutionBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8 },
  resolutionLabel: { fontSize: 12, fontWeight: 'bold', color: '#1A8C4E', marginBottom: 4 },
  resolutionDesc: { fontSize: 14, color: '#374151', marginBottom: 4 },
  resolutionTime: { fontSize: 11, color: '#9CA3AF' }
});
