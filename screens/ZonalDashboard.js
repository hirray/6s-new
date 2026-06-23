import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { DataContext } from '../context/DataContext';
import ZonalSubZoneDetail from './zonal/ZonalSubZoneDetail';

export default function ZonalDashboard() {
  const { currentUser, SZH, db, setDb } = useContext(DataContext);
  const [remarkText, setRemarkText] = useState('');
  const [selectedSubZone, setSelectedSubZone] = useState('');

  const [selectedSZH, setSelectedSZH] = useState(null);

  // 1. Filter Subordinates
  const mySZHs = SZH.filter(s => s.zone === currentUser?.data?.id);
  
  // 2. Filter Complaints
  const myComplaints = db.complaints.filter(c => c.zone === currentUser?.data?.area || (c.zone && c.zone.includes(`Zone ${currentUser?.data?.id}`)));

  // 3. Filter Remarks
  const myRemarks = db.remarks.filter(r => r.author === currentUser?.name);

  const handleApprove = (id) => {
    Alert.alert('Success', `Log for ${id} has been approved.`);
  };

  const handleSendRemark = () => {
    if (!selectedSubZone) {
      Alert.alert('Error', 'Please select a subordinate.');
      return;
    }
    if (!remarkText.trim()) {
      Alert.alert('Error', 'Please enter a remark.');
      return;
    }
    
    // Mock pushing to db.remarks
    const newRemark = {
      id: Date.now().toString(),
      target: selectedSubZone,
      text: remarkText,
      date: new Date().toLocaleString(),
      author: currentUser?.name
    };

    setDb(prev => ({
      ...prev,
      remarks: [newRemark, ...prev.remarks]
    }));

    Alert.alert('Remark Sent', `Your feedback has been sent to ${selectedSubZone}.`);
    setRemarkText('');
    setSelectedSubZone('');
  };

  if (selectedSZH) {
    return <ZonalSubZoneDetail subZone={selectedSZH} onBack={() => setSelectedSZH(null)} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* A. Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.zoneTitle}>Zone {currentUser?.data?.id} — {currentUser?.data?.area}</Text>
        <Text style={styles.headName}>Zonal Head: {currentUser?.name}</Text>
      </View>

      {/* B. Sub-Zonal Logs Table (Card 1) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Sub-Zonal Head Logs</Text>
        {mySZHs.map((sz, index) => {
          // Find latest submission for this SZH
          const latestLog = db.checklistSubmissions
            .filter(sub => sub.subZonalHeadId === sz.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          const hasSubmitted = !!latestLog;
          const score = hasSubmitted ? latestLog.score : 0;
          const statusColor = score >= 85 ? '#1A8C4E' : score >= 60 ? '#B07D10' : '#C0182A';

          return (
            <TouchableOpacity 
              key={sz.id} 
              style={styles.tableRow}
              onPress={() => hasSubmitted ? setSelectedSZH(sz) : Alert.alert('Not Submitted', 'No checklist submitted yet.')}
            >
              <View style={{ flex: 1.5 }}>
                <Text style={styles.floorText}>{sz.floor}</Text>
                <Text style={styles.nameText}>{sz.name}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.timeText}>{hasSubmitted ? latestLog.date.split(',')[1] : 'No Log'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: hasSubmitted ? statusColor : '#A0A0A0' }]}>
                  <Text style={styles.statusBadgeText}>{hasSubmitted ? `${score}%` : 'Pending'}</Text>
                </View>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity 
                  style={[styles.approveBtn, !hasSubmitted && { opacity: 0.5 }]} 
                  onPress={() => hasSubmitted ? handleApprove(sz.id) : null}
                  disabled={!hasSubmitted}
                >
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* C. Send Remark / Feedback (Card 2) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Send Remark / Feedback</Text>
        <Text style={styles.label}>Select Subordinate</Text>
        
        {/* Mock Dropdown / Picker */}
        <View style={styles.mockSelectContainer}>
          {mySZHs.map(sz => (
            <TouchableOpacity 
              key={sz.id} 
              style={[styles.mockOption, selectedSubZone === sz.name && styles.mockOptionSelected]}
              onPress={() => setSelectedSubZone(sz.name)}
            >
              <Text style={[styles.mockOptionText, selectedSubZone === sz.name && styles.mockOptionTextSelected]}>
                {sz.name} ({sz.floor})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Remark</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write your feedback here..."
          placeholderTextColor="#A0A0A0"
          multiline
          numberOfLines={4}
          value={remarkText}
          onChangeText={setRemarkText}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSendRemark}>
          <Text style={styles.submitBtnText}>Send Remark</Text>
        </TouchableOpacity>
      </View>

      {/* D. Remark History (Card 4) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Remark History</Text>
        {myRemarks.length === 0 ? (
          <Text style={styles.mutedText}>You have not sent any remarks yet.</Text>
        ) : (
          myRemarks.map(r => (
            <View key={r.id} style={styles.remarkRow}>
              <View style={styles.remarkHeader}>
                <Text style={styles.remarkTarget}>To: {r.target}</Text>
                <Text style={styles.remarkTime}>{r.date}</Text>
              </View>
              <Text style={styles.remarkText}>{r.text}</Text>
            </View>
          ))
        )}
      </View>

      {/* E. Floor Concerns / Complaints (Card 5) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Zone Concerns</Text>
        {myComplaints.length === 0 ? (
          <Text style={styles.mutedText}>No concerns raised in this zone.</Text>
        ) : (
          myComplaints.map(c => {
            // Find who is in charge of this floor
            const inCharge = mySZHs.find(sz => c.desc.toLowerCase().includes(sz.floor.toLowerCase().split('/')[0]))?.name || 'Assigned Staff';
            return (
              <View key={c.id} style={styles.complaintRow}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.inChargeText}>In-Charge: {inCharge}</Text>
                  <Text style={styles.complaintTime}>{c.date}</Text>
                </View>
                <Text style={styles.complaintDesc}>{c.desc}</Text>
                <View style={styles.actionStatus}>
                  <Text style={styles.actionText}>Action: {c.status}</Text>
                </View>
              </View>
            );
          })
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
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  zoneTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8C1B2F',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  headName: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8C1B2F',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
  },
  floorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C0A0E',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 12,
    color: '#7A4050',
  },
  timeText: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  approveBtn: {
    backgroundColor: '#C4933F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    color: '#1C0A0E',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  mockSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  mockOption: {
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mockOptionSelected: {
    backgroundColor: 'rgba(140,27,47,0.1)',
    borderColor: '#8C1B2F',
  },
  mockOptionText: {
    fontSize: 12,
    color: '#4B5563',
  },
  mockOptionTextSelected: {
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
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#8C1B2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mutedText: {
    color: '#A0A0A0',
    fontSize: 13,
    fontStyle: 'italic',
  },
  complaintRow: {
    backgroundColor: '#F5EFE6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inChargeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8C1B2F',
  },
  complaintDesc: {
    fontSize: 14,
    color: '#1C0A0E',
    marginBottom: 8,
  },
  complaintTime: {
    fontSize: 11,
    color: '#7A4050',
  },
  actionStatus: {
    backgroundColor: 'rgba(176,125,16,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 11,
    color: '#B07D10',
    fontWeight: 'bold',
  },
  remarkRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  remarkTarget: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C0A0E',
  },
  remarkTime: {
    fontSize: 10,
    color: '#7A4050',
  },
  remarkText: {
    fontSize: 13,
    color: '#4B5563',
  }
});
