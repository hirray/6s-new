import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHistory() {
  const { db, currentUser } = useContext(DataContext);

  const zoneSub = currentUser?.data?.zone || currentUser?.zone;
  
  const relevantAdvisories = db.advisories.filter(a => {
    if (a.targetZone === 'All Zones') return true;
    if (zoneSub && a.targetZone && a.targetZone.startsWith(zoneSub)) return true;
    return false;
  }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advisories</Text>
      
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {relevantAdvisories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No advisories available.</Text>
          </View>
        ) : (
          relevantAdvisories.map(adv => (
            <View key={adv.id} style={styles.historyCard}>
              <View style={[styles.historyIconCircle, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="megaphone" size={24} color="#0284C7" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>
                  {adv.author} • {new Date(adv.date || adv.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} IST
                </Text>
                <Text style={styles.historyScore}>{adv.text}</Text>
                <Text style={styles.historyTarget}>Target: {adv.targetZone}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#111827', marginTop: 40, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#6B7280', fontSize: 16, fontStyle: 'italic', marginTop: 12 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyScore: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  historyTarget: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  }
});
