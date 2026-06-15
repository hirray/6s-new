import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DataContext } from '../context/DataContext';

export default function StudentReport() {
  const { zones, SZH, submitComplaint, db } = useContext(DataContext);
  
  const [selectedZone, setSelectedZone] = useState('Select Block/Hostel');
  const [showPicker, setShowPicker] = useState(false);

  const [selectedSubZone, setSelectedSubZone] = useState('Select Floor/Wing');
  const [showSubPicker, setShowSubPicker] = useState(false);

  const [issueText, setIssueText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const activeZoneData = zones.find(z => z.name === selectedZone);
  const zoneNumberMatch = selectedZone.match(/Zone (\d+)/);
  const zoneNumber = zoneNumberMatch ? parseInt(zoneNumberMatch[1], 10) : null;
  
  const availableSubZones = zoneNumber ? SZH.filter(s => s.zone === zoneNumber) : [];

  const handleSubmit = () => {
    if (selectedZone === 'Select Block/Hostel') {
      Alert.alert('Error', 'Please select your block or hostel first.');
      return;
    }
    if (selectedSubZone === 'Select Floor/Wing' && availableSubZones.length > 0) {
      Alert.alert('Error', 'Please select a specific floor or wing.');
      return;
    }
    if (!issueText.trim()) {
      Alert.alert('Error', 'Please describe the issue.');
      return;
    }
    
    submitComplaint(selectedZone, selectedSubZone, issueText, imageUri);
    Alert.alert('Report Submitted', `Your issue regarding ${selectedZone} (${selectedSubZone}) has been submitted.`);
    setIssueText('');
    setImageUri(null);
    setSelectedZone('Select Block/Hostel');
    setSelectedSubZone('Select Floor/Wing');
    setShowPicker(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Zone Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Block Status</Text>
        <Text style={styles.label}>Select your Block/Hostel to view its 6S status:</Text>
        
        <TouchableOpacity 
          style={styles.mockSelect} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.mockSelectText}>{selectedZone}</Text>
          <Ionicons name="chevron-down" size={18} color="#7A4050" />
        </TouchableOpacity>
        
        <Modal visible={showPicker} transparent={true} animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Block/Hostel</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {zones.map(z => (
                  <TouchableOpacity key={z.id} style={styles.modalItem} onPress={() => { 
                    setSelectedZone(z.name); 
                    setSelectedSubZone('Select Floor/Wing');
                    setShowPicker(false); 
                  }}>
                    <Text style={[styles.modalItemText, selectedZone === z.name && styles.modalItemTextSelected]}>{z.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {activeZoneData && (
          <View style={styles.statusDisplay}>
            <Text style={styles.statusLabel}>Current Compliance Score: <Text style={{fontWeight: 'bold'}}>{activeZoneData.score}%</Text></Text>
            <View style={[styles.statusBadge, { backgroundColor: activeZoneData.color }]}>
              <Text style={styles.statusBadgeText}>{activeZoneData.status} Zone</Text>
            </View>
          </View>
        )}
      </View>

      {/* Report Issue Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report a New Concern</Text>
        
        {availableSubZones.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Floor/Wing</Text>
            <TouchableOpacity 
              style={styles.mockSelect} 
              onPress={() => setShowSubPicker(true)}
            >
              <Text style={styles.mockSelectText}>{selectedSubZone}</Text>
              <Ionicons name="chevron-down" size={18} color="#7A4050" />
            </TouchableOpacity>

            <Modal visible={showSubPicker} transparent={true} animationType="fade" onRequestClose={() => setShowSubPicker(false)}>
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubPicker(false)}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeader}>Select Floor/Wing</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {availableSubZones.map((sz, idx) => (
                      <TouchableOpacity key={idx} style={styles.modalItem} onPress={() => { setSelectedSubZone(sz.floor); setShowSubPicker(false); }}>
                        <Text style={[styles.modalItemText, selectedSubZone === sz.floor && styles.modalItemTextSelected]}>{sz.floor}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Describe the Issue</Text>
          <TextInput
            style={styles.textArea}
            placeholder="E.g., Broken dustbin on 2nd floor, lights flickering in corridor..."
            placeholderTextColor="#7A4050"
            multiline
            numberOfLines={5}
            value={issueText}
            onChangeText={setIssueText}
          />
        </View>

        <View style={styles.imageAttachRow}>
          <TouchableOpacity 
            style={[styles.attachButton, imageUri && styles.attachButtonActive]}
            onPress={pickImage}
          >
            <Text style={[styles.attachButtonText, imageUri && styles.attachButtonTextActive]}>
              {imageUri ? '📸 Image Attached' : '📷 Attach Image'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Previous Concerns</Text>
        {db.complaints.map(complaint => (
          <View key={complaint.id} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyZone}>{complaint.zone}</Text>
                {complaint.subZone && <Text style={styles.historySubZone}>{complaint.subZone}</Text>}
              </View>
              <View style={[styles.statusBadgeSmall, complaint.status === 'Resolved' ? styles.statusResolved : styles.statusPending]}>
                <Text style={styles.statusBadgeTextSmall}>{complaint.status}</Text>
              </View>
            </View>
            <Text style={styles.historyDesc}>{complaint.desc}</Text>
            <View style={styles.historyFooter}>
              <Text style={styles.historyDate}>{complaint.date}</Text>
              {complaint.imageUri && <Text style={styles.historyAttachment}>📎 Image Attached</Text>}
            </View>

            {/* Sub-Zonal Head Remarks / Resolution */}
            {complaint.remarks && complaint.remarks.length > 0 && (
              <View style={styles.resolutionContainer}>
                <Text style={styles.resolutionTitle}>Official Response:</Text>
                {complaint.remarks.map((rmk, idx) => (
                  <View key={idx} style={styles.remarkItem}>
                    <Text style={styles.remarkAuthor}>{rmk.author} <Text style={styles.remarkDate}>({rmk.date})</Text></Text>
                    <Text style={styles.remarkText}>{rmk.text}</Text>
                    {rmk.photoProof && (
                      <View style={styles.photoProofBadge}>
                        <Ionicons name="image-outline" size={14} color="#1A8C4E" />
                        <Text style={styles.photoProofText}>Resolution Photo Attached</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F2',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
    marginBottom: 20,
    shadowColor: 'rgba(28,10,14,0.12)',
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8C1B2F',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#1C0A0E',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  mockSelect: {
    backgroundColor: '#FBF7F2',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.22)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockSelectText: {
    color: '#1C0A0E',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8C1B2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4B5563',
  },
  modalItemTextSelected: {
    color: '#8C1B2F',
    fontWeight: 'bold',
  },
  statusDisplay: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,27,47,0.12)',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    color: '#1C0A0E',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textArea: {
    backgroundColor: '#FBF7F2',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.22)',
    borderRadius: 8,
    padding: 12,
    color: '#1C0A0E',
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#8C1B2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  imageAttachRow: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  attachButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C4933F',
    backgroundColor: '#FBF7F2',
  },
  attachButtonActive: {
    backgroundColor: '#C4933F',
  },
  attachButtonText: {
    color: '#C4933F',
    fontWeight: '600',
    fontSize: 13,
  },
  attachButtonTextActive: {
    color: '#FFFFFF',
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyZone: {
    fontWeight: 'bold',
    color: '#8C1B2F',
    fontSize: 14,
  },
  historySubZone: {
    fontSize: 12,
    color: '#7A4050',
    marginTop: 2,
  },
  statusBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#B07D10',
  },
  statusResolved: {
    backgroundColor: '#1A8C4E',
  },
  statusBadgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyDesc: {
    fontSize: 14,
    color: '#1C0A0E',
    marginBottom: 12,
    lineHeight: 20,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: '#7A4050',
  },
  historyAttachment: {
    fontSize: 12,
    color: '#B07D10',
    fontWeight: '600',
  },
  resolutionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  resolutionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A8C4E',
    marginBottom: 6,
  },
  remarkItem: {
    backgroundColor: 'rgba(26,140,78,0.05)',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  remarkAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C0A0E',
    marginBottom: 4,
  },
  remarkDate: {
    fontWeight: 'normal',
    color: '#7A4050',
    fontSize: 10,
  },
  remarkText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  photoProofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1A8C4E',
  },
  photoProofText: {
    fontSize: 11,
    color: '#1A8C4E',
    fontWeight: 'bold',
    marginLeft: 4,
  }
});
