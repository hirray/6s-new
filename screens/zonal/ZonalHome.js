import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function ZonalHome({ onSelectSubZone }) {
  const { currentUser, db, submitZonalReport, staticData } = useContext(DataContext);
  const myZoneName = currentUser?.data?.zone; // e.g., 'Zone 1'
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportComments, setReportComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unique sub-zones for this zone from the backend staticData (or fallback to empty if missing)
  const subZonesSource = staticData?.subZonalHeads || [];
  const subZonesInZone = subZonesSource.filter(h => h.zone === myZoneName || h.zoneNumber == myZoneName?.replace(/\D/g, ''));
  
  // Create a unique list of areas (floor wise data)
  const uniqueAreasMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueAreasMap[h.areasCovered]) {
      uniqueAreasMap[h.areasCovered] = h;
    }
  });

  const uniqueAreas = Object.values(uniqueAreasMap);

  const getLiveStatus = (areaData) => {
    const latestLog = db.checklistSubmissions
      .filter(sub => sub.subZonalHeadId === areaData.id || sub.subZonalHeadId === areaData._id || sub.subZonalHeadId === areaData.email)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
    
    if (!latestLog) return { color: '#DC2626', bg: '#FEE2E2', label: 'Not Done' };
    
    const logDate = new Date(latestLog.createdAt || latestLog.date).toDateString();
    const todayDate = new Date().toDateString();
    
    if (logDate !== todayDate) return { color: '#DC2626', bg: '#FEE2E2', label: 'Not Done' };
    if (latestLog.approved) return { color: '#1A8C4E', bg: '#D1FAE5', label: 'Fully Completed' };
    return { color: '#D97706', bg: '#FEF3C7', label: 'Pending Review' };
  };

  const handleGenerateReport = async () => {
    if (!reportComments.trim()) {
      Alert.alert('Required', 'Please add overall comments for this report.');
      return;
    }
    setIsSubmitting(true);
    const success = await submitZonalReport(myZoneName, reportComments);
    setIsSubmitting(false);
    if (success) {
      Alert.alert('Success', 'Zonal Report submitted to Admin.');
      setReportModalVisible(false);
      setReportComments('');
    } else {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{myZoneName} Overview</Text>
        <Text style={styles.subtitle}>Sub-Zone Progress Summary</Text>
      </View>

      {uniqueAreas.length === 0 ? (
        <Text style={styles.emptyText}>No floor areas found for this zone.</Text>
      ) : (
        uniqueAreas.map((areaData, index) => {
          const status = getLiveStatus(areaData);
          
          // Get the latest log time if available for this specific area
          const areaLatestLog = db.checklistSubmissions
            .filter(sub => sub.subZonalHeadId === areaData.id || sub.subZonalHeadId === areaData._id || sub.subZonalHeadId === areaData.email)
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
          
          let displayTime = 'No data';
          if (areaLatestLog) {
            const dateObj = new Date(areaLatestLog.createdAt || areaLatestLog.date);
            displayTime = dateObj.toLocaleDateString() === new Date().toLocaleDateString() 
              ? `Today, ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
              : dateObj.toLocaleDateString();
          }

          return (
            <TouchableOpacity 
              key={areaData.id} 
              style={[styles.card, { borderLeftColor: status.color, borderLeftWidth: 5 }]}
              onPress={() => onSelectSubZone({ floor: areaData.areasCovered, name: areaData.name, id: areaData.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{areaData.areasCovered}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={styles.areasText} numberOfLines={2}>Coordinator: {areaData.name}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>Last updated: {displayTime}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setReportModalVisible(true)}>
        <Ionicons name="document-text" size={24} color="#FFF" />
        <Text style={styles.fabText}>Generate Report</Text>
      </TouchableOpacity>

      {/* Report Modal */}
      <Modal visible={reportModalVisible} animationType="slide" transparent={true} onRequestClose={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Finalize Zonal Report</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Overall Zone Comments</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter overall comments for the Admin..."
              placeholderTextColor="#9CA3AF"
              multiline={true}
              numberOfLines={4}
              value={reportComments}
              onChangeText={setReportComments}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
              onPress={handleGenerateReport} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit to Admin</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  timeText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#8C1B2F', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  fabText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textArea: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', color: '#111827', marginBottom: 20 },
  submitBtn: { backgroundColor: '#8C1B2F', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
