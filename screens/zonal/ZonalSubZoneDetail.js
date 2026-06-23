import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ZonalSubZoneDetail({ subZone, onBack }) {
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    Alert.alert("Approved", `Sub-Zone ${subZone.floor} daily checklist approved successfully.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Sub-Zone {subZone.floor}</Text>
          <Text style={styles.subtitle}>In-Depth Report ({subZone.name})</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Areas Covered</Text>
        <Text style={styles.desc}>{subZone.floor}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Daily 6S Checklist</Text>
        
        <View style={styles.taskRow}>
          <Ionicons name="checkmark-circle" size={20} color="#1A8C4E" />
          <Text style={styles.taskText}>1S Sort: Unnecessary items removed.</Text>
        </View>
        <View style={styles.taskRow}>
          <Ionicons name="checkmark-circle" size={20} color="#1A8C4E" />
          <Text style={styles.taskText}>2S Set in Order: Items organized properly.</Text>
        </View>
        <View style={styles.taskRow}>
          <Ionicons name="alert-circle" size={20} color="#D97706" />
          <Text style={styles.taskText}>3S Shine: Cleaning in progress.</Text>
        </View>
        <View style={styles.taskRow}>
          <Ionicons name="checkmark-circle" size={20} color="#1A8C4E" />
          <Text style={styles.taskText}>4S Standardize: Procedures followed.</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.approveBtn, approved && styles.approvedBtn]}
        onPress={handleApprove}
        disabled={approved}
      >
        <Ionicons name={approved ? "checkmark-done" : "checkmark"} size={20} color="#FFF" style={{marginRight: 8}} />
        <Text style={styles.approveBtnText}>{approved ? "Approved" : "Approve Daily Checklist"}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingTop: 10 },
  backBtn: { marginRight: 16, padding: 8, backgroundColor: '#E5E7EB', borderRadius: 20 },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#8C1B2F', marginBottom: 8 },
  desc: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  taskText: { fontSize: 14, color: '#111827', marginLeft: 8 },
  approveBtn: { flexDirection: 'row', backgroundColor: '#8C1B2F', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  approvedBtn: { backgroundColor: '#1A8C4E' },
  approveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
