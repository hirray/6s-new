import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminZones() {
  const { db, staticData, zones } = useContext(DataContext);
  const [expandedZone, setExpandedZone] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubZone, setExpandedSubZone] = useState(null);
  const [selectedPrinciple, setSelectedPrinciple] = useState(null);

  const ZONES_DATA = zones.map((z, index) => {
    const bgColors = ['#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B', '#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B'];
    
    const zh = (staticData?.zonalHeads || []).find(h => h.zone.toString() === z.id.toString());

    const subZones = (staticData?.subZonalHeads || []).filter(szh => {
      const szhZoneNum = szh.zone ? szh.zone.toString().replace(/\D/g, '') : '';
      return szhZoneNum === z.id.toString();
    }).map(szh => {
      const szhFloor = szh.subZone || szh.floor || szh.areasCovered || 'Unknown Area';
      const szhComplaints = db.complaints.filter(c => 
        (c.subZone === szhFloor || c.subZone === szh.name)
      );
      const pending = szhComplaints.filter(c => c.status === 'Pending').length;
      const resolved = szhComplaints.filter(c => c.status === 'Resolved').length;
      
      const submissions = db.checklistSubmissions.filter(s => s.subZonalHeadId === szh._id || s.subZonalHeadId === szh.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date));
      const latestSub = submissions.length > 0 ? submissions[0] : null;
      const compliance = latestSub ? latestSub.score : 0;

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
        latestSub,
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedZone(expandedZone === id ? null : id);
  };

  const toggleSubZone = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubZone(expandedSubZone === id ? null : id);
    setSelectedPrinciple(null); // Reset selected 'S' when changing sub-zone
  };

  const renderDetailedChecklist = (sub, principleId) => {
    // mock real-time checklist items for that principle
    const items = [
      `Are standard procedures for ${principleId} visible and followed?`,
      `Is the team actively engaged in ${principleId} practices?`,
      `Any immediate hazards identified during ${principleId}?`
    ];

    // Find if we have complaints for this subzone to provide analysis context
    const analysisContext = sub.pending > 0 
      ? `Analysis: There are ${sub.pending} pending concerns that might negatively affect this score.` 
      : `Analysis: Excellent! This zone has a clean record with 0 pending concerns affecting this principle.`;

    // A mock real-time score for this 'S'
    const sScore = sub.latestSub?.scores ? (sub.latestSub.scores[principleId] || 80) : 80;
    
    return (
      <View style={styles.detailedChecklistContainer}>
        <View style={styles.checklistHeader}>
          <Text style={styles.checklistTitle}>{principleId} Real-Time Checklist</Text>
          <Text style={[styles.checklistScore, { color: sScore >= 85 ? '#1A8C4E' : sScore >= 60 ? '#B07D10' : '#C0182A' }]}>Score: {sScore}%</Text>
        </View>

        {items.map((item, idx) => {
          // just pseudo-randomizing a failure check for realism
          const isFailed = idx === 2 && sScore < 85;
          return (
            <View key={idx} style={styles.checklistItemRow}>
              <Ionicons name={isFailed ? "close-circle" : "checkmark-circle"} size={20} color={isFailed ? "#C0182A" : "#1A8C4E"} />
              <Text style={styles.checklistItemText}>{item}</Text>
            </View>
          );
        })}

        <View style={styles.analysisBox}>
          <Ionicons name="analytics" size={18} color="#8C1B2F" style={{marginRight: 6}} />
          <Text style={styles.analysisText}>{analysisContext}</Text>
        </View>
      </View>
    );
  };

  const render6SPrinciples = (sub) => {
    const principles = [
      { id: '1S', name: 'Sort', desc: 'Remove unnecessary', color: '#1C75FF', icon: 'layers' },
      { id: '2S', name: 'Set in Order', desc: 'Organize Everything', color: '#0F766E', icon: 'grid' },
      { id: '3S', name: 'Shine', desc: 'Clean and inspect', color: '#1A8C4E', icon: 'sparkles' },
      { id: '4S', name: 'Standardize', desc: 'Create rules', color: '#E11D48', icon: 'document-text' },
      { id: '5S', name: 'Sustain', desc: 'Maintain discipline', color: '#D97706', icon: 'bar-chart' },
      { id: '6S', name: 'Safety', desc: 'Ensure safety', color: '#CA8A04', icon: 'shield-checkmark' }
    ];

    return (
      <View style={{ marginTop: 10, paddingBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.principlesScroll}>
          {principles.map((p, idx) => {
            const isSelected = selectedPrinciple === p.id;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.principleCard, { borderColor: p.color }, isSelected && { backgroundColor: p.color + '15' }]}
                onPress={() => setSelectedPrinciple(isSelected ? null : p.id)}
              >
                <View style={[styles.principleIconWrapper, { backgroundColor: p.color + '20' }]}>
                  <Ionicons name={p.icon} size={20} color={p.color} />
                </View>
                <Text style={[styles.principleName, { color: p.color }]}>{p.name}</Text>
                <Text style={styles.principleDesc}>{p.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {selectedPrinciple && renderDetailedChecklist(sub, selectedPrinciple)}
      </View>
    );
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
          placeholder="Search concerns..."
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

                  {zone.subZones.map((sub, sIndex) => {
                    const isSubExpanded = expandedSubZone === sub.id;
                    const compColor = sub.compliance >= 85 ? '#1A8C4E' : sub.compliance >= 60 ? '#B07D10' : '#C0182A';

                    return (
                      <View key={`sub-${sub.id}-${sIndex}`} style={styles.subZoneWrapper}>
                        <TouchableOpacity 
                          style={styles.tableRow}
                          onPress={() => toggleSubZone(sub.id)}
                        >
                          <Text style={styles.tdLabel} numberOfLines={2}>{sub.name}</Text>
                          <Text style={[styles.tdValue, {color: compColor, fontWeight: 'bold'}]}>{sub.compliance}%</Text>
                          <Text style={[styles.tdValue, {color: '#F59E0B', fontWeight: 'bold'}]}>{sub.pending}</Text>
                          <Text style={[styles.tdValue, {color: '#10B981', fontWeight: 'bold'}]}>{sub.resolved}</Text>
                          <Ionicons name={isSubExpanded ? "chevron-up" : "chevron-forward"} size={16} color="#111827" />
                        </TouchableOpacity>

                        {isSubExpanded && (
                          <View style={styles.subZoneDetails}>
                            <Text style={styles.subZoneManager}>Manager: {sub.headName}</Text>
                            {render6SPrinciples(sub)}
                          </View>
                        )}
                      </View>
                    );
                  })}
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
  subZoneWrapper: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tdLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  tdValue: { flex: 1, fontSize: 14, textAlign: 'center' },
  subZoneDetails: { backgroundColor: '#F9FAFB', paddingTop: 15, paddingBottom: 5 },
  subZoneManager: { fontSize: 13, color: '#4B5563', marginBottom: 5, fontStyle: 'italic', paddingHorizontal: 20 },
  principlesScroll: { paddingHorizontal: 20, paddingBottom: 10 },
  principleCard: { width: 130, borderWidth: 1.5, borderRadius: 12, padding: 12, marginRight: 12, backgroundColor: '#FFFFFF' },
  principleIconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  principleName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  principleDesc: { fontSize: 11, color: '#6B7280' },
  detailedChecklistContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 10, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  checklistTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  checklistScore: { fontSize: 14, fontWeight: 'bold' },
  checklistItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  checklistItemText: { fontSize: 13, color: '#4B5563', marginLeft: 8, flex: 1, lineHeight: 18 },
  analysisBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  analysisText: { fontSize: 12, color: '#991B1B', flex: 1 }
});
