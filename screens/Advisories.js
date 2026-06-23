import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';

export default function Advisories() {
  const { currentUser, db, publishAdvisory, addAdvisoryReply, SZH } = useContext(DataContext);
  
  const [advisoryText, setAdvisoryText] = useState('');
  
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [showPicker, setShowPicker] = useState(false);

  const [selectedSubZone, setSelectedSubZone] = useState('All Sub-Zones');
  const [showSubPicker, setShowSubPicker] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);

  // Extract Zone Number for Sub-Zone filtering
  const zoneMatch = selectedZone.match(/Zone (\d+)/);
  const zoneNumber = zoneMatch ? parseInt(zoneMatch[1], 10) : null;

  // Filter Sub-Zones based on selected zone
  const availableSubZones = zoneNumber 
    ? SZH.filter(s => s.zone === zoneNumber)
    : [];

  const handlePublish = () => {
    if (!advisoryText.trim()) {
      Alert.alert('Error', 'Please enter advisory content.');
      return;
    }
    
    publishAdvisory(selectedZone, selectedSubZone, advisoryText);
    setAdvisoryText('');
    setSelectedZone('All Zones');
    setSelectedSubZone('All Sub-Zones');
    Alert.alert('Success', `Advisory published and notification sent to ${selectedSubZone}!`);
  };

  const handleReply = (id) => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply.');
      return;
    }
    addAdvisoryReply(id, replyText);
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Publish Form */}
      {currentUser?.role === 'Admin' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Publish Global Advisory</Text>
        
        {/* Target Zone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Zone</Text>
          <TouchableOpacity 
            style={styles.mockSelect} 
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.mockSelectText}>{selectedZone}</Text>
            <Ionicons name="chevron-down" size={18} color="#7A4050" />
          </TouchableOpacity>
          
          <Modal visible={showPicker} transparent={true} animationType="fade" onRequestClose={() => setShowPicker(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Select Target Zone</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {[
                    "All Zones",
                    "Zone 1 – Anviksha",
                    "Zone 2 – School of Technology",
                    "Zone 3 – Common Amenities",
                    "Zone 4 – Kasturba Bhavan",
                    "Zone 5 – Vikram Sarabhai Bhavan",
                    "Zone 6 – Swami Vivekananda Bhavan",
                    "Zone 7 – FirePlex",
                    "Zone 8 – School of Science / Management"
                  ].map((zoneName, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.modalItem} 
                      onPress={() => { 
                        setSelectedZone(zoneName); 
                        setSelectedSubZone('All Sub-Zones'); // Reset SubZone
                        setShowPicker(false); 
                      }}
                    >
                      <Text style={[styles.modalItemText, selectedZone === zoneName && styles.modalItemTextSelected]}>
                        {zoneName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Target Sub-Zone */}
        {selectedZone !== 'All Zones' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Sub-Zone</Text>
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
                  <Text style={styles.modalHeader}>Select Target Sub-Zone</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedSubZone('All Sub-Zones'); setShowSubPicker(false); }}>
                      <Text style={[styles.modalItemText, selectedSubZone === 'All Sub-Zones' && styles.modalItemTextSelected]}>All Sub-Zones</Text>
                    </TouchableOpacity>
                    {availableSubZones.map((sz, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={styles.modalItem} 
                        onPress={() => { setSelectedSubZone(sz.floor); setShowSubPicker(false); }}
                      >
                        <Text style={[styles.modalItemText, selectedSubZone === sz.floor && styles.modalItemTextSelected]}>
                          {sz.floor} ({sz.name})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Advisory Content</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Type advisory message here…"
            placeholderTextColor="#7A4050"
            multiline
            numberOfLines={4}
            value={advisoryText}
            onChangeText={setAdvisoryText}
          />
        </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handlePublish}>
            <Text style={styles.primaryButtonText}>Publish & Notify →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History & Replies */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advisory History & Replies</Text>
        {db.advisories.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <View style={styles.tagGroup}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.targetZone}</Text>
                </View>
                {item.targetSubZone !== 'All Sub-Zones' && (
                  <View style={styles.tagSub}>
                    <Text style={styles.tagSubText}>{item.targetSubZone}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            
            <Text style={styles.advisoryBody}>
              {item.text}
            </Text>
            <Text style={styles.authorText}>Issued by: {item.author}</Text>

            {/* Replies Section */}
            <View style={styles.repliesSection}>
              {item.replies.map((reply, idx) => (
                <View key={idx} style={styles.replyBox}>
                  <View style={styles.replyHeader}>
                    <Text style={styles.replyAuthor}>{reply.author}</Text>
                    <Text style={styles.replyDate}>{reply.date}</Text>
                  </View>
                  <Text style={styles.replyText}>{reply.text}</Text>
                </View>
              ))}

              {/* Reply Input */}
              {replyingToId === item.id ? (
                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Type your comment/reply..."
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity onPress={() => setReplyingToId(null)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReply(item.id)} style={styles.submitReplyBtn}>
                      <Text style={styles.submitReplyBtnText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setReplyingToId(item.id)} style={styles.replyButton}>
                  <Ionicons name="chatbubble-outline" size={14} color="#8C1B2F" />
                  <Text style={styles.replyButtonText}>Add Comment / Reply</Text>
                </TouchableOpacity>
              )}
            </View>

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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#1C0A0E',
    fontWeight: '600',
    marginBottom: 6,
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
  historyItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  tagGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(196,147,63,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C4933F',
  },
  tagText: {
    color: '#A87830',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tagSub: {
    backgroundColor: 'rgba(26,140,78,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1A8C4E',
  },
  tagSubText: {
    color: '#1A8C4E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 11,
    color: '#7A4050',
    marginLeft: 8,
  },
  advisoryBody: {
    fontSize: 14,
    color: '#1C0A0E',
    marginBottom: 8,
    lineHeight: 22,
  },
  authorText: {
    fontSize: 12,
    color: '#7A4050',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  repliesSection: {
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    paddingTop: 12,
  },
  replyBox: {
    backgroundColor: '#FBF7F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8C1B2F',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C0A0E',
  },
  replyDate: {
    fontSize: 10,
    color: '#7A4050',
  },
  replyText: {
    fontSize: 13,
    color: '#4B5563',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  replyButtonText: {
    color: '#8C1B2F',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  replyInputContainer: {
    marginTop: 8,
  },
  replyInput: {
    backgroundColor: '#FBF7F2',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.22)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#1C0A0E',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: '#7A4050',
    fontSize: 13,
    fontWeight: '600',
  },
  submitReplyBtn: {
    backgroundColor: '#8C1B2F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitReplyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  }
});
