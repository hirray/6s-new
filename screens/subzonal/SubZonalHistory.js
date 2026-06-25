import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHistory() {
  const { db, currentUser } = useContext(DataContext);

  const mySubmissions = db.checklistSubmissions.filter(s => s.subZonalHeadId === currentUser?.id);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Audit History</Text>
      {mySubmissions.length === 0 ? (
        <Text style={styles.emptyText}>No audits submitted yet.</Text>
      ) : (
        mySubmissions.map(sub => (
          <View key={sub.id} style={styles.card}>
            <Text style={styles.date}>{new Date(sub.date || sub.createdAt).toLocaleString()}</Text>
            <Text style={styles.score}>Score: {sub.score}%</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  emptyText: { color: '#6B7280', fontSize: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  date: { fontSize: 14, color: '#6B7280' },
  score: { fontSize: 16, fontWeight: 'bold', color: '#8C1B2F', marginTop: 4 }
});
