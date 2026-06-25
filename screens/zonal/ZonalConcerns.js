import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function ZonalConcerns({ onBackToHome }) {
  const { currentUser, db } = useContext(DataContext);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Real complaints for this Zonal Head's zone
  const complaints = db.complaints.filter(c => c.zone === currentUser?.data?.zone);

  // Filter timeline remarks for selected concern
  const timeline = db.remarks ? db.remarks.filter(r => r.complaintId === selectedConcern?.id) : [];

  const renderConcernsList = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onBackToHome}>
          <Ionicons name="arrow-back" size={24} color="#611624" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zone Concerns</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Concern Cards */}
      {complaints.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>No concerns found for your zone.</Text>
      ) : (
        complaints.map(c => {
          let statusColor = c.status === 'Resolved' ? '#059669' : c.status === 'In Progress' ? '#D97706' : '#DC2626';
          let statusBg = c.status === 'Resolved' ? '#ECFDF5' : c.status === 'In Progress' ? '#FEF3C7' : '#FEF2F2';
          
          return (
            <TouchableOpacity key={c.id} style={styles.concernCard} onPress={() => setSelectedConcern(c)}>
              <View style={styles.concernHeader}>
                <View style={[styles.concernIconCircle, { backgroundColor: '#611624' }]}>
                  <Ionicons name="alert" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.concernTitleWrapper}>
                  <Text style={styles.concernTitle}>{c.category}</Text>
                  <Text style={styles.concernLocation}>{c.location} • {c.subZone}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{c.status}</Text>
                </View>
              </View>

              <View style={styles.concernFooter}>
                <View>
                  <Text style={styles.metaText}>Raised by : {c.studentId || c.teacherId || 'Staff'}</Text>
                  <Text style={styles.metaText}>Assigned to : {c.subZonalHeadId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
                  <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
                    <Text style={styles.metaDate}>{c.timestamp}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#1F2937" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const renderTimeline = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSelectedConcern(null)}>
          <Ionicons name="arrow-back" size={24} color="#611624" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commit Remarks</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.timelineContainer}>
        {timeline.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>No commit remarks for this concern.</Text>
        ) : (
          timeline.map((item, idx) => {
            let statusColor = item.status === 'Resolved' ? '#059669' : item.status === 'In Progress' ? '#D97706' : '#DC2626';
            let statusBg = item.status === 'Resolved' ? '#ECFDF5' : item.status === 'In Progress' ? '#FEF3C7' : '#FEF2F2';
            
            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Left Thread */}
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.timelineIcon}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                  </View>
                  {idx !== timeline.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Right Card */}
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardHeader}>
                    <View>
                      <Text style={styles.timelineDate}>{item.timestamp}</Text>
                      <Text style={styles.timelineCardTitle}>Remark Added</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineMeta}>By: <Text style={{ fontWeight: 'bold' }}>{item.author}</Text></Text>
                  <Text style={styles.timelineMeta}>Concern : {selectedConcern.category}</Text>
                  <Text style={styles.timelineMeta}>Remark : <Text style={{ color: '#1F2937' }}>{item.remark}</Text></Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  return selectedConcern ? renderTimeline() : renderConcernsList();
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterPill: {
    backgroundColor: '#611624',
    borderColor: '#611624',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  concernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  concernHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  concernIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  concernTitleWrapper: {
    flex: 1,
  },
  concernTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  concernLocation: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  concernFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
    fontWeight: '500',
  },
  metaDate: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 2,
  },
  metaTime: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
  },
  
  // Timeline Styles
  timelineContainer: {
    paddingTop: 10,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeftColumn: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#611624',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#611624',
    marginVertical: -4,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineDate: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  timelineCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  timelineMeta: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 16,
  }
});
