import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ZONES_DATA = [
  {
    id: 2,
    name: 'SOT - School of Technology',
    icon: 'business',
    bgColor: '#8C1B2F',
    subZones: [
      { id: '2.1', name: 'Floor 1', concerns: 21, pending: 3, resolved: 18, compliance: '92%' },
      { id: '2.2', name: 'Floor 2', concerns: 20, pending: 5, resolved: 15, compliance: '88%' },
      { id: '2.3', name: 'Floor 3', concerns: 26, pending: 1, resolved: 25, compliance: '95%' },
    ]
  },
  {
    id: 1,
    name: 'SOS - School of Science',
    icon: 'business',
    bgColor: '#1C75FF',
    subZones: [
      { id: '1.1', name: 'Floor 1', concerns: 24, pending: 4, resolved: 20, compliance: '90%' },
      { id: '1.2', name: 'Floor 2', concerns: 22, pending: 6, resolved: 16, compliance: '85%' },
      { id: '1.3', name: 'Floor 3', concerns: 25, pending: 3, resolved: 22, compliance: '89%' },
    ]
  },
  {
    id: 4,
    name: 'Zone 4 - Kasturba Bhavan',
    icon: 'business',
    bgColor: '#00B94A',
    subZones: [
      { id: '4.1', name: 'Hostel Block A', concerns: 15, pending: 2, resolved: 13, compliance: '86%' },
      { id: '4.2', name: 'Mess Area', concerns: 8, pending: 0, resolved: 8, compliance: '100%' },
    ]
  }
];

export default function AdminZones() {
  const [expandedZone, setExpandedZone] = useState(2); // Expand SOT by default to match mockup
  const [searchQuery, setSearchQuery] = useState('');

  const toggleZone = (id) => {
    setExpandedZone(expandedZone === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
        </TouchableOpacity>
        <Text style={styles.title}>Concerns</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#8C1B2F" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {ZONES_DATA.map(zone => {
          const isExpanded = expandedZone === zone.id;
          return (
            <View key={zone.id} style={styles.accordionCard}>
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleZone(zone.id)}>
                <View style={[styles.zoneIconCircle, { backgroundColor: zone.bgColor }]}>
                  <Ionicons name={zone.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#111827" />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.accordionBody}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.thEmpty}></Text>
                    <Text style={styles.th}>Concerns</Text>
                    <Text style={styles.th}>Pendings</Text>
                    <Text style={styles.th}>Resolved</Text>
                    <Text style={styles.thIcon}></Text>
                  </View>

                  {zone.subZones.map(sub => (
                    <TouchableOpacity key={sub.id} style={styles.tableRow}>
                      <Text style={styles.tdLabel}>{sub.name}</Text>
                      <Text style={[styles.tdValue, {color: '#10B981', fontWeight: 'bold'}]}>{sub.compliance}</Text>
                      <Text style={[styles.tdValue, {color: '#F59E0B', fontWeight: 'bold'}]}>{sub.pending}</Text>
                      <Text style={[styles.tdValue, {color: '#10B981', fontWeight: 'bold'}]}>{sub.resolved}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#111827" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#8C1B2F' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, paddingHorizontal: 16, height: 50, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  scrollView: { paddingHorizontal: 20 },
  accordionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  zoneIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  zoneName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#111827' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  tableHeaderRow: { flexDirection: 'row', marginBottom: 12 },
  thEmpty: { flex: 1 },
  th: { flex: 1, fontSize: 11, color: '#6B7280', textAlign: 'center' },
  thIcon: { width: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tdLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  tdValue: { flex: 1, fontSize: 14, textAlign: 'center' }
});
