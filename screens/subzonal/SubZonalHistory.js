import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHistory() {
  const { db, currentUser } = useContext(DataContext);
  const formatDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));
  const flatListRef = useRef(null);

  // Generate dates: 30 days in the past
  const dateList = Array.from({length: 30}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  useEffect(() => {
    // Scroll to end (today) when mounted
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);


  const mySubmissions = db.checklistSubmissions
    .filter(s => {
      const isUser = s.subZonalHeadId === currentUser?.id || s.subZonalHeadId === 'unknown_id';
      try {
        const subDate = new Date(s.createdAt || s.date);
        const subDateStr = formatDateString(subDate);
        return isUser && subDateStr === selectedDate;
      } catch(e) {
        return false;
      }
    })
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  const renderDateItem = ({ item }) => {
    const dateStr = formatDateString(item);
    const isSelected = dateStr === selectedDate;
    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = item.getDate();

    return (
      <TouchableOpacity 
        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
        onPress={() => setSelectedDate(dateStr)}
      >
        <Text style={[styles.dayName, isSelected && styles.dateTextSelected]}>{dayName}</Text>
        <Text style={[styles.dayNum, isSelected && styles.dateTextSelected]}>{dayNum}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audit History</Text>
      
      <View style={styles.calendarContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dateList}
          keyExtractor={(item) => formatDateString(item)}
          renderItem={renderDateItem}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {mySubmissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No audits on this date.</Text>
          </View>
        ) : (
          mySubmissions.map(sub => (
            <View key={sub.id} style={styles.historyCard}>
              <View style={styles.historyIconCircle}>
                <Ionicons name="document-text" size={24} color="#8C1B2F" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>
                  {sub.date ? new Date(sub.date).toLocaleString() : new Date(sub.createdAt).toLocaleString()}
                </Text>
                <Text style={styles.historyScore}>Overall Score: {sub.score}%</Text>
              </View>
              <View style={[styles.historyBadge, { backgroundColor: sub.score >= 80 ? '#ECFDF5' : (sub.score >= 60 ? '#FFFBEB' : '#FEF2F2') }]}>
                <Text style={[styles.historyBadgeText, { color: sub.score >= 80 ? '#059669' : (sub.score >= 60 ? '#D97706' : '#DC2626') }]}>
                  {sub.score >= 80 ? 'Excellent' : (sub.score >= 60 ? 'Good' : 'Needs Action')}
                </Text>
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
  calendarContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  dateCard: {
    width: 60,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  dateCardSelected: {
    backgroundColor: '#8C1B2F',
    shadowColor: '#8C1B2F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
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
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  historyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
