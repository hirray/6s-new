import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

export default function ZonalProfile() {
  const { currentUser, logout } = useContext(DataContext);
  const data = currentUser?.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#8C1B2F" />
        </View>
        <Text style={styles.name}>{currentUser?.name}</Text>
        <Text style={styles.role}>Zonal Head</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data?.email || currentUser?.email}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assignment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Zone:</Text>
          <Text style={styles.value}>{data?.zone}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Area Description:</Text>
          <Text style={styles.valueMulti}>{data?.area}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, paddingTop: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3E8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  role: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#8C1B2F', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  col: { flexDirection: 'column', marginBottom: 12 },
  label: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500' },
  valueMulti: { fontSize: 14, color: '#111827', fontWeight: '500', marginTop: 4, lineHeight: 20 },
  logoutButton: { flexDirection: 'row', backgroundColor: '#8C1B2F', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 40 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
