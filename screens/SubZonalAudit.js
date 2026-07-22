import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DataContext } from '../context/DataContext';

export default function SubZonalAudit() {
  const { currentUser, CL_TASKS, db, setDb, resolveComplaint, submitChecklist } = useContext(DataContext);
  const [checkedItems, setCheckedItems] = useState([]);
  
  const [resolutions, setResolutions] = useState({});
  const [photoProofs, setPhotoProofs] = useState({});

  const pickImage = async (complaintId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoProofs({...photoProofs, [complaintId]: result.assets[0].uri});
    }
  };

  const myZone = currentUser?.data?.zone || 'All Zones';

  const extractZoneNumber = (zoneStr) => {
    if (!zoneStr) return null;
    const match = zoneStr.match(/Zone\s*0?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const myComplaints = db.complaints.filter(c => {
    if (currentUser?.role === 'Admin') return true;
    const myZoneNum = currentUser?.data ? extractZoneNumber(currentUser.data.zone) : null;
    if (!myZoneNum) return true;
    return extractZoneNumber(c.zone) === myZoneNum;
  });

  const toggleCheck = (index) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(checkedItems.filter(i => i !== index));
    } else {
      setCheckedItems([...checkedItems, index]);
    }
  };

  const progressPercentage = Math.round((checkedItems.length / CL_TASKS.length) * 100);

  const handleSubmit = async () => {
    if (checkedItems.length === 0) {
      Alert.alert('Incomplete', 'Please check at least one inspection item.');
      return;
    }

    await submitChecklist(currentUser?.id, myZone, progressPercentage, []);

    Alert.alert('Sent for Approval', `Daily inspection submitted for Zonal Head approval. Score: ${progressPercentage}%. You will be able to submit again in 48 hours.`);
    setCheckedItems([]);
  };

  const mySubmissions = db.checklistSubmissions
    .filter(s => s.subZonalHeadId === currentUser?.id || s.subZonalHeadId === currentUser?.data?._id)
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  
  const lastSub = mySubmissions[0];
  let checklistStatus = 'RED'; 
  let formattedLastSubDate = '';

  if (lastSub) {
    const lastSubDate = new Date(lastSub.date || lastSub.createdAt);
    const hoursSince = (new Date() - lastSubDate) / (1000 * 60 * 60);
    
    formattedLastSubDate = lastSubDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' IST';
    
    if (hoursSince <= 48) {
      checklistStatus = 'GREEN';
    } else if (hoursSince <= 72) {
      checklistStatus = 'YELLOW';
    } else {
      checklistStatus = 'RED';
    }
  }

  const isGreen = checklistStatus === 'GREEN';

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerSection}>
        <Text style={styles.headName}>Sub-Zonal Head: {currentUser?.name || 'Mr. Rajesh Patel'}</Text>
        <Text style={styles.zoneTitle}>{myZone} — Ground Floor</Text>
      </View>

      {/* Checklist Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Daily 6S Inspection</Text>
        <Text style={styles.cardSubtitle}>Complete your daily floor checklist to maintain compliance.</Text>

        {!isGreen && checklistStatus !== 'GREEN' && mySubmissions.length > 0 && (
          <View style={{ padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: checklistStatus === 'YELLOW' ? '#FEF3C7' : '#FEE2E2', borderWidth: 1, borderColor: checklistStatus === 'YELLOW' ? '#F59E0B' : '#EF4444' }}>
            <Text style={{ color: checklistStatus === 'YELLOW' ? '#92400E' : '#991B1B', fontWeight: 'bold', fontSize: 14 }}>
              {checklistStatus === 'YELLOW' ? '⚠️ Warning: Overdue (48-72 hrs)' : '🚨 Critical: Overdue (72+ hrs)'}
            </Text>
            <Text style={{ color: checklistStatus === 'YELLOW' ? '#B45309' : '#B91C1C', fontSize: 12, marginTop: 4 }}>
              Last submitted: {formattedLastSubDate}
            </Text>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Completion Status</Text>
            <Text style={styles.progressValue}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: progressPercentage === 100 ? '#1A8C4E' : '#B07D10' }]} />
          </View>
        </View>

        {/* 8-Item Checklist or Block Message */}
        {isGreen ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Inspection Up to Date</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 12 }}>
              Work already done at {formattedLastSubDate}
            </Text>

            {lastSub?.approvalStatus === 'APPROVED' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#10B981' }}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" style={{ marginRight: 6 }} />
                <Text style={{ color: '#059669', fontSize: 12, fontWeight: 'bold' }}>
                  Approved by {lastSub.approvedBy || 'Admin'}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B' }}>
                <Ionicons name="time" size={14} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={{ color: '#D97706', fontSize: 12, fontWeight: 'bold' }}>
                  Pending Admin Approval
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.checklistContainer}>
            {CL_TASKS.map((task, index) => {
              const isChecked = checkedItems.includes(index);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.checklistItem, isChecked && styles.checklistItemActive]}
                  onPress={() => toggleCheck(index)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.checklistText, isChecked && styles.checklistTextActive]}>{task}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!isGreen && (
          <TouchableOpacity 
            style={[styles.primaryButton, checkedItems.length === 0 && { opacity: 0.6 }]} 
            onPress={handleSubmit}
          >
            <Text style={styles.primaryButtonText}>Send for Approval</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Floor Concerns (Card 3) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 My Floor Concerns</Text>
        <Text style={styles.cardSubtitle}>Complaints submitted by students regarding your specific floor.</Text>
        {myComplaints.length === 0 ? (
          <Text style={styles.mutedText}>No active concerns for your floor.</Text>
        ) : (
          myComplaints.map(c => (
            <View key={c.id} style={styles.complaintRow}>
              <View style={styles.complaintHeader}>
                <View style={[styles.complaintStatus, c.status === 'Resolved' && styles.complaintStatusResolved]}>
                  <Text style={[styles.complaintStatusText, c.status === 'Resolved' && styles.complaintStatusTextResolved]}>{c.status}</Text>
                </View>
                <Text style={styles.complaintTime}>{c.date}</Text>
              </View>
              <Text style={styles.complaintDesc}>{c.desc}</Text>
              
              {c.status === 'Pending' && (
                <View style={styles.resolveContainer}>
                  <TextInput 
                    style={styles.resolveInput}
                    placeholder="Write resolution remark..."
                    value={resolutions[c.id] || ''}
                    onChangeText={(val) => setResolutions({...resolutions, [c.id]: val})}
                  />
                  <View style={styles.resolveActions}>
                    <TouchableOpacity 
                      style={[styles.attachBtn, photoProofs[c.id] && styles.attachBtnActive]}
                      onPress={() => pickImage(c.id)}
                    >
                      <Ionicons name={photoProofs[c.id] ? "image" : "image-outline"} size={16} color={photoProofs[c.id] ? "#FFFFFF" : "#C4933F"} />
                      <Text style={[styles.attachBtnText, photoProofs[c.id] && styles.attachBtnTextActive]}>Photo Proof</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.resolveSubmitBtn}
                      onPress={() => {
                        if(!resolutions[c.id]) {
                          Alert.alert('Error', 'Please enter a resolution remark.');
                          return;
                        }
                        resolveComplaint(c.id, resolutions[c.id], photoProofs[c.id] || null);
                        Alert.alert('Success', 'Concern resolved successfully.');
                      }}
                    >
                      <Text style={styles.resolveSubmitText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
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
  headerSection: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headName: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  zoneTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8C1B2F',
    fontFamily: 'serif',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1C0A0E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8C1B2F',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7A4050',
    marginBottom: 20,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C0A0E',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8C1B2F',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F5EFE6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  checklistContainer: {
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBF7F2',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.1)',
  },
  checklistItemActive: {
    backgroundColor: 'rgba(26,140,78,0.05)',
    borderColor: '#1A8C4E',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C4933F',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#1A8C4E',
    borderColor: '#1A8C4E',
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  checklistTextActive: {
    color: '#1C0A0E',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#8C1B2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mutedText: {
    color: '#A0A0A0',
    fontSize: 13,
    fontStyle: 'italic',
  },
  complaintRow: {
    backgroundColor: '#FBF7F2',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintStatus: {
    backgroundColor: 'rgba(176,125,16,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  complaintStatusResolved: {
    backgroundColor: 'rgba(26,140,78,0.1)',
  },
  complaintStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B07D10',
  },
  complaintStatusTextResolved: {
    color: '#1A8C4E',
  },
  complaintTime: {
    fontSize: 11,
    color: '#7A4050',
  },
  complaintDesc: {
    fontSize: 14,
    color: '#1C0A0E',
    lineHeight: 20,
  },
  resolveContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
    paddingTop: 12,
  },
  resolveInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.22)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  resolveActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C4933F',
  },
  attachBtnActive: {
    backgroundColor: '#C4933F',
  },
  attachBtnText: {
    fontSize: 12,
    color: '#C4933F',
    fontWeight: '600',
    marginLeft: 4,
  },
  attachBtnTextActive: {
    color: '#FFFFFF',
  },
  resolveSubmitBtn: {
    backgroundColor: '#1A8C4E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resolveSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
