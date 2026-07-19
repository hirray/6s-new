import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { getChecklistForUser } from '../utils/checklistMapper';

const getStatusColor = (status) => {
  const config = {
    green: '#28A745',
    yellow: '#DAA520',
    red: '#DC3545'
  };
  return config[status?.toLowerCase()] || config.green;
};

export default function SubZonalComplianceTable() {
  const { staticData, db } = useContext(DataContext);
  const SZH = staticData?.subZonalHeads || [];

  const [selectedSubZone, setSelectedSubZone] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRowPress = (item) => {
    setSelectedSubZone(item);
    setModalVisible(true);
  };

  const renderModalContent = () => {
    if (!selectedSubZone) return null;
    
    // Generate read-only checklist for this specific sub-zone
    const checklistData = getChecklistForUser(selectedSubZone, staticData?.checklists || []);
    const categories = Object.keys(checklistData);

    // Fetch the latest submission for this sub-zone head to get remarks
    const latestSubmission = db.checklistSubmissions
      .filter(sub => sub.subZonalHeadId === selectedSubZone.id || sub.subZonalHeadId === selectedSubZone.email)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0];

    const remarks = latestSubmission?.remarks || [];

    return (
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text style={styles.modalTitle}>{selectedSubZone.name}'s Checklist</Text>
              <Text style={styles.modalSubtitle}>{selectedSubZone.areasCovered} (Sub-Zone {selectedSubZone.subZone})</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {remarks.length > 0 && (
              <View style={styles.remarksCard}>
                <Text style={styles.remarksCardTitle}>Remarks from Latest Audit</Text>
                {remarks.map((rem, idx) => (
                  <View key={idx} style={styles.remarkItem}>
                    <Text style={styles.remarkTask}>• {rem.task}</Text>
                    <Text style={styles.remarkComment}>Reason: {rem.comment}</Text>
                  </View>
                ))}
              </View>
            )}

            {categories.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={60} color="#9CA3AF" />
                <Text style={styles.emptyText}>No checklist criteria found for this area.</Text>
              </View>
            ) : (
              categories.map(cat => (
                <View key={cat} style={styles.catCard}>
                  <Text style={styles.catTitle}>{cat}</Text>
                  {checklistData[cat].map((criteria, idx) => (
                    <View key={idx} style={styles.criteriaRow}>
                      <Ionicons name="checkbox" size={20} color="#1A8C4E" />
                      <Text style={styles.criteriaText}>{criteria}</Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>ZONE</Text>
      </View>
      <View style={{ flex: 1.8, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>SUB-ZONE AREA</Text>
      </View>
      <View style={{ flex: 1.4, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>HEAD</Text>
      </View>
    </View>
  );

  const renderRow = ({ item, index }) => {
    // Extract Zone Number safely
    const zoneMatch = item.zone?.match(/\d+/);
    const zNum = zoneMatch ? zoneMatch[0] : '?';
    
    // For demo purposes, we randomly assign green/yellow/red, or use item.status if available
    const szSts = ['green', 'green', 'yellow', 'green', 'green', 'red', 'yellow', 'green'];
    const assignedStatus = item.status || szSts[index % szSts.length];

    return (
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => handleRowPress(item)}
        activeOpacity={0.6}
      >
        <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
          <View style={[styles.zoneBadge, { backgroundColor: getStatusColor(assignedStatus) }]}>
            <Text style={styles.zoneBadgeText}>Z{zNum}</Text>
          </View>
        </View>
        <View style={{ flex: 1.8, alignItems: 'flex-start', paddingRight: 8 }}>
          <Text style={styles.cellFloor}>{item.areasCovered || 'Unknown Area'}</Text>
          <Text style={styles.cellSubZone}>Sub-Zone {item.subZone}</Text>
        </View>
        <View style={{ flex: 1.4, alignItems: 'flex-start', paddingRight: 8 }}>
          <Text style={styles.cellHead}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardTitleContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={20} color="#8C1B2F" />
        </View>
        <Text style={styles.cardTitle}>Sub-Zonal Compliance (All Zones)</Text>
      </View>

      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={SZH}
          keyExtractor={(item) => item.id || item.email}
          renderItem={renderRow}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      
      {renderModalContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8C1B2F',
    fontFamily: 'serif',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#1C0A0E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5EFE6',
    borderBottomWidth: 1,
    borderColor: '#EFE5D8',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8C1B2F',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5EFE6',
  },
  cellFloor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C0A0E',
  },
  cellSubZone: {
    fontSize: 12,
    color: '#7A4050',
    marginTop: 2,
  },
  cellHead: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500'
  },
  zoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  catCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8C1B2F',
    marginBottom: 12,
  },
  remarksCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  remarksCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  remarkItem: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  remarkTask: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F1D1D',
    marginBottom: 4,
  },
  remarkComment: {
    fontSize: 14,
    color: '#991B1B',
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  criteriaText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 10,
  }
});
