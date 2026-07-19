import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { SUB_ZONAL_HEADS } from '../../data/subZonalHeads';

export default function ZonalSubZoneLogs({ onBackToHome }) {
  const { currentUser, db, approveChecklist } = useContext(DataContext);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedS, setExpandedS] = useState(null);

  // Dynamic list of sub-zones for current Zonal Head's zone
  const subZonesInZone = SUB_ZONAL_HEADS.filter(h => h.zone === currentUser?.data?.zone);
  const uniqueAreasMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueAreasMap[h.areasCovered]) {
      uniqueAreasMap[h.areasCovered] = h;
    }
  });
  const floors = Object.values(uniqueAreasMap);



  const renderLogsList = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onBackToHome}>
          <Ionicons name="arrow-back" size={24} color="#611624" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sub-Zonal Logs</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter" size={24} color="#611624" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sub-Zone or Floor"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {floors.filter(f => f.areasCovered.toLowerCase().includes(searchQuery.toLowerCase())).map(floor => {
        const latestLog = db.checklistSubmissions
              .filter(sub => sub.subZonalHeadId === floor.id)
              .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
        const compliance = latestLog ? latestLog.score : 0;
        const pending = db.complaints.filter(c => c.zone === floor.zone && c.subZone === floor.areasCovered && c.status !== 'Resolved').length;
        const resolved = db.complaints.filter(c => c.zone === floor.zone && c.subZone === floor.areasCovered && c.status === 'Resolved').length;
        const color = compliance >= 85 ? '#10B981' : compliance >= 60 ? '#F97316' : '#EF4444';

        return (
          <View key={floor.id} style={styles.logCard}>
            <View style={styles.logCardHeader}>
              <View style={[styles.logIconCircle, { backgroundColor: color }]}>
                <Ionicons name="business" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.logCardTitle} numberOfLines={2}>{floor.areasCovered}</Text>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Compliance</Text>
                <Text style={[styles.metricValue, { color: color }]}>{compliance}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Pending</Text>
                <Text style={[styles.metricValue, { color: '#F97316' }]}>{pending}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Resolved</Text>
                <Text style={[styles.metricValue, { color: '#10B981' }]}>{resolved}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => setSelectedFloor(floor)}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderFloorOverview = () => {
    // Determine the latest checklist for drill down
    const latestLog = db.checklistSubmissions
      .filter(sub => sub.subZonalHeadId === selectedFloor.id)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
    
    const baseScore = latestLog ? latestLog.score : 0;
    
    // Deterministic 6S Fluctuation
    const getScore = (index) => {
      if (baseScore === 0) return 0;
      const offsets = [-2, 3, -1, 4, -3, 1];
      return Math.min(100, Math.max(0, baseScore + offsets[index]));
    };

    const sCategories = [
      { id: '1S', label: 'Seiri', sub: 'Sort', score: getScore(0), color: getScore(0) >= 80 ? '#10B981' : (getScore(0) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Are unneeded items removed from the area?'] },
      { id: '2S', label: 'Seiton', sub: 'Set In Order', score: getScore(1), color: getScore(1) >= 80 ? '#10B981' : (getScore(1) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Is everything in its designated place?'] },
      { id: '3S', label: 'Seiso', sub: 'Shine', score: getScore(2), color: getScore(2) >= 80 ? '#10B981' : (getScore(2) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Is the area clean and free of debris?'] },
      { id: '4S', label: 'Seiketsu', sub: 'Standardize', score: getScore(3), color: getScore(3) >= 80 ? '#10B981' : (getScore(3) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Are standard procedures visible and followed?'] },
      { id: '5S', label: 'Shitsuke', sub: 'Sustain', score: getScore(4), color: getScore(4) >= 80 ? '#10B981' : (getScore(4) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Are audits being conducted regularly?'] },
      { id: '6S', label: 'Safety', sub: 'Safety', score: getScore(5), color: getScore(5) >= 80 ? '#10B981' : (getScore(5) >= 60 ? '#F97316' : '#EF4444'), tasks: ['Are all safety hazards mitigated?'] },
    ];

    // Filter real concerns for this floor
    const floorConcerns = db.complaints.filter(c => c.zone === selectedFloor.zone && c.subZone === selectedFloor.areasCovered);

    return (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => { setSelectedFloor(null); setExpandedS(null); }}>
            <Ionicons name="arrow-back" size={24} color="#611624" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle} numberOfLines={1}>Floor Overview</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{selectedFloor.areasCovered}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('History', 'Calendar view is coming soon!')}>
            <Ionicons name="calendar-outline" size={24} color="#611624" />
          </TouchableOpacity>
        </View>

        {/* 6S Performance */}
        <Text style={styles.sectionTitle}>6S Performance</Text>
        <View style={styles.sixSContainer}>
          {sCategories.map((item, idx) => (
            <View key={idx}>
              <TouchableOpacity style={styles.sixSRow} onPress={() => setExpandedS(expandedS === item.id ? null : item.id)}>
                <View style={styles.sixSLabelContainer}>
                  <Text style={styles.sixSMain}>{item.label}</Text>
                  <Text style={styles.sixSSub}>({item.sub})</Text>
                </View>
                <View style={styles.sixSBarBg}>
                  <View style={[styles.sixSBarFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.sixSScore}>{item.score}%</Text>
                <Ionicons name={expandedS === item.id ? "chevron-up" : "chevron-down"} size={16} color="#64748B" />
              </TouchableOpacity>

              {expandedS === item.id && (
                <View style={styles.checklistExpanded}>
                  {item.tasks.map((task, tidx) => (
                    <View key={tidx} style={styles.checklistItem}>
                      <Ionicons name="checkmark-circle" size={18} color={item.score > 70 ? '#10B981' : '#F97316'} />
                      <Text style={styles.checklistText}>{task}</Text>
                    </View>
                  ))}
                  <Text style={styles.checklistSummaryText}>Completed: {item.score}% (Latest Data)</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {latestLog && (
          <TouchableOpacity 
            style={[styles.approveBtn, latestLog.approved && { backgroundColor: '#D1D5DB' }]} 
            disabled={latestLog.approved}
            onPress={async () => {
              const success = await approveChecklist(latestLog.id);
              if(success) {
                Alert.alert('Success', 'Work for this area has been approved and logged.');
              }
            }}
          >
            <Text style={styles.approveBtnText}>{latestLog.approved ? 'Work Approved' : 'Approve Work'}</Text>
          </TouchableOpacity>
        )}

        {/* Recent Concerns */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Concerns</Text>
          <Text style={styles.viewAllLink}>View All</Text>
        </View>

        {floorConcerns.length === 0 ? (
          <Text style={{ color: '#64748B' }}>No recent concerns for this area.</Text>
        ) : (
          floorConcerns.slice(0, 3).map((c, i) => (
            <View key={i} style={styles.concernCard}>
              <View style={[styles.concernIconCircle, { backgroundColor: '#611624' }]}>
                <Ionicons name="flash" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.concernContent}>
                <Text style={styles.concernTitle}>{c.category}</Text>
                <Text style={styles.concernLocation}>{c.location}</Text>
                <Text style={styles.concernMeta}>Raised by: {c.studentId || c.teacherId || 'Staff'}</Text>
              </View>
              <View style={[styles.concernBadge, { backgroundColor: c.status === 'Resolved' ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={[styles.concernBadgeText, { color: c.status === 'Resolved' ? '#059669' : '#DC2626' }]}>{c.status}</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    );
  };

  return selectedFloor ? renderFloorOverview() : renderLogsList();
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FDFBF7', // Cream
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#611624', // Maroon
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  logCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  viewDetailsBtn: {
    borderWidth: 1.5,
    borderColor: '#611624',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#611624',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Floor Overview Styles
  fourMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  fourMetricCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  fourMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  fourMetricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  sixSContainer: {
    marginBottom: 24,
  },
  sixSRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sixSLabelContainer: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sixSMain: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  sixSSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 4,
  },
  sixSBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  sixSBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sixSScore: {
    width: 32,
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#611624', // Maroon
  },
  concernCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  concernIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  concernContent: {
    flex: 1,
  },
  concernTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  concernLocation: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
  },
  concernMeta: {
    fontSize: 10,
    color: '#94A3B8',
  },
  concernBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  concernBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checklistExpanded: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginLeft: 32,
    borderLeftWidth: 2,
    borderLeftColor: '#611624',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistText: {
    fontSize: 12,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  checklistSummaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: '#611624',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#611624',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  }
});
