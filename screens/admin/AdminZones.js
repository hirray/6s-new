import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import ZonalSubZoneDetail from '../zonal/ZonalSubZoneDetail';

export default function AdminZones() {
  const { db, staticData, zones } = useContext(DataContext);
  const [expandedZone, setExpandedZone] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubZone, setSelectedSubZone] = useState(null);

  const ZONES_DATA = zones.map((z, index) => {
    const bgColors = ['#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B', '#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B'];
    
    const zh = (staticData?.zonalHeads || []).find(h => h.zone.toString() === z.id.toString());

    const subZones = (staticData?.subZonalHeads || []).filter(szh => szh.zone.toString() === z.id.toString()).map(szh => {
      const szhFloor = szh.subZone || szh.floor || 'Unknown Area';
      const szhComplaints = db.complaints.filter(c => 
        (c.subZone === szhFloor || c.subZone === szh.name)
      );
      const pending = szhComplaints.filter(c => c.status === 'Pending').length;
      const resolved = szhComplaints.filter(c => c.status === 'Resolved').length;
      
      const submissions = db.checklistSubmissions.filter(s => s.subZonalHeadId === szh._id || s.subZonalHeadId === szh.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date));
      const compliance = submissions.length > 0 ? `${submissions[0].score}%` : 'N/A';

      const fullDataMapped = {
        ...szh,
        floor: szhFloor,
        name: szh.name || 'Unassigned'
      };

      return {
        id: szh._id || szh.id || Math.random().toString(),
        name: szhFloor,
        headName: szh.name,
        concerns: szhComplaints.length,
        pending,
        resolved,
        compliance,
        fullData: fullDataMapped
      };
    });

    return {
      id: z.id,
      name: z.name,
      headName: zh ? zh.name : 'Unassigned',
      icon: 'business',
      bgColor: bgColors[index % bgColors.length],
      subZones
    };
  });

  const filteredZones = ZONES_DATA.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.subZones.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())));

  const toggleZone = (id) => {
    setExpandedZone(expandedZone === id ? null : id);
  };

  if (selectedSubZone) {
    return <ZonalSubZoneDetail subZone={selectedSubZone} onBack={() => setSelectedSubZone(null)} />;
  }

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
        {filteredZones.map((zone, zIndex) => {
          const isExpanded = expandedZone === zone.id;
          return (
            <View key={`zone-${zone.id}-${zIndex}`} style={styles.accordionCard}>
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

                  {zone.subZones.map((sub, sIndex) => (
                    <TouchableOpacity 
                      key={`sub-${sub.id}-${sIndex}`} 
                      style={styles.tableRow}
                      onPress={() => setSelectedSubZone(sub.fullData)}
                    >
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
