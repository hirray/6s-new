import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { SUB_ZONAL_HEADS } from '../../data/subZonalHeads';

export default function ZonalHome({ onSelectSubZone }) {
  const { currentUser } = useContext(DataContext);
  const myZoneName = currentUser?.data?.zone; // e.g., 'Zone 1'

  // Get unique sub-zones for this zone
  const subZonesInZone = SUB_ZONAL_HEADS.filter(h => h.zone === myZoneName);
  
  // Create a unique list of subzones
  const uniqueSubZonesMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueSubZonesMap[h.subZone]) {
      uniqueSubZonesMap[h.subZone] = [];
    }
    // Avoid duplicate areas in string
    if(!uniqueSubZonesMap[h.subZone].includes(h.areasCovered)) {
      uniqueSubZonesMap[h.subZone].push(h.areasCovered);
    }
  });

  const uniqueSubZones = Object.keys(uniqueSubZonesMap).map(szNum => ({
    subZone: szNum,
    areas: uniqueSubZonesMap[szNum].join(', ')
  }));

  // For demo, assign mock status (red, yellow, green)
  const getMockStatus = (index) => {
    if (index % 3 === 0) return { color: '#1A8C4E', bg: '#D1FAE5', label: 'Fully Completed', text: 'Green' };
    if (index % 3 === 1) return { color: '#D97706', bg: '#FEF3C7', label: 'Half Way', text: 'Yellow' };
    return { color: '#DC2626', bg: '#FEE2E2', label: 'Not Done', text: 'Red' };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{myZoneName} Overview</Text>
        <Text style={styles.subtitle}>Sub-Zone Progress Summary</Text>
      </View>

      {uniqueSubZones.length === 0 ? (
        <Text style={styles.emptyText}>No sub-zones found for this zone.</Text>
      ) : (
        uniqueSubZones.map((sz, index) => {
          const status = getMockStatus(index);
          return (
            <TouchableOpacity 
              key={sz.subZone} 
              style={[styles.card, { borderLeftColor: status.color, borderLeftWidth: 5 }]}
              onPress={() => onSelectSubZone(sz)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Sub-Zone {sz.subZone}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={styles.areasText} numberOfLines={2}>{sz.areas}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>Last updated: Today, 10:{30 + index} AM</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  header: { marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  emptyText: { color: '#6B7280', fontSize: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  areasText: { fontSize: 13, color: '#4B5563', marginBottom: 12, lineHeight: 18 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: '#6B7280', marginLeft: 4 }
});
