import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function ZonalAnalytics({ onBackToHome }) {
  const { currentUser, db } = useContext(DataContext);
  
  // Real data calculations
  const zoneSubmissions = db.checklistSubmissions.filter(sub => sub.zone === currentUser?.data?.zone);
  const overallScore = zoneSubmissions.length > 0 ? 
    Math.round(zoneSubmissions.reduce((acc, sub) => acc + sub.score, 0) / zoneSubmissions.length) : 0;
    
  let bestFloor = { name: 'N/A', score: 0 };
  let lowestFloor = { name: 'N/A', score: 100 };
  
  if (zoneSubmissions.length > 0) {
    zoneSubmissions.forEach(sub => {
      if (sub.score > bestFloor.score) { bestFloor = { name: sub.subZonalHeadId, score: sub.score }; }
      if (sub.score < lowestFloor.score) { lowestFloor = { name: sub.subZonalHeadId, score: sub.score }; }
    });
  }

  // Trend data points (last 6 submissions or fallback)
  const recentSubs = [...zoneSubmissions].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)).slice(-6);
  const trendPoints = [50, 70, 75, 85, 90, 92]; // Fallback mock trend
  if (recentSubs.length > 0) {
    recentSubs.forEach((sub, i) => {
      if (i < 6) trendPoints[i] = sub.score;
    });
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onBackToHome}>
          <Ionicons name="arrow-back" size={24} color="#611624" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>6S Analytics</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewTextContent}>
          <Text style={styles.overviewLabel}>Overall Score</Text>
          <Text style={styles.overviewScoreText}>{overallScore}%</Text>
          <Text style={styles.overviewTrendText}>
            <Ionicons name="arrow-up" size={12} color="#10B981" /> 6% from last 30 days
          </Text>
        </View>
      </View>

      <View style={styles.performanceCardsRow}>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>Best Performing</Text>
          <Text style={[styles.performanceFloorName, { color: '#10B981' }]} numberOfLines={1}>{bestFloor.name}</Text>
          <Text style={styles.performanceScoreText}>{bestFloor.score}%</Text>
        </View>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>Lowest Performing</Text>
          <Text style={[styles.performanceFloorName, { color: '#EF4444' }]} numberOfLines={1}>{lowestFloor.name}</Text>
          <Text style={styles.performanceScoreText}>{lowestFloor.score}%</Text>
        </View>
      </View>

      {/* Mocked Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Compliance Trend (Last 30 Days)</Text>
        <View style={styles.mockChartArea}>
          <View style={styles.chartYAxis}>
            <Text style={styles.chartAxisLabel}>100%</Text>
            <Text style={styles.chartAxisLabel}>80%</Text>
            <Text style={styles.chartAxisLabel}>60%</Text>
            <Text style={styles.chartAxisLabel}>40%</Text>
            <Text style={styles.chartAxisLabel}>20%</Text>
            <Text style={styles.chartAxisLabel}>0%</Text>
          </View>
          <View style={styles.chartGrid}>
            <View style={styles.chartGridLine} />
            <View style={styles.chartGridLine} />
            <View style={styles.chartGridLine} />
            <View style={styles.chartGridLine} />
            <View style={styles.chartGridLine} />
            
            {/* Fake Area Path using a skewed box */}
            <View style={styles.mockAreaPath} />
            
            {/* Points driven by data */}
            <View style={[styles.chartPoint, { left: '0%', bottom: `${trendPoints[0]}%` }]} />
            <View style={[styles.chartPoint, { left: '20%', bottom: `${trendPoints[1]}%` }]} />
            <View style={[styles.chartPoint, { left: '40%', bottom: `${trendPoints[2]}%` }]} />
            <View style={[styles.chartPoint, { left: '60%', bottom: `${trendPoints[3]}%` }]} />
            <View style={[styles.chartPoint, { left: '80%', bottom: `${trendPoints[4]}%` }]} />
            <View style={[styles.chartPoint, { left: '100%', bottom: `${trendPoints[5]}%` }]} />

            <View style={styles.chartXAxis}>
              <Text style={styles.chartAxisLabel}>20 May</Text>
              <Text style={styles.chartAxisLabel}>27 May</Text>
              <Text style={styles.chartAxisLabel}>3 Jun</Text>
              <Text style={styles.chartAxisLabel}>10 Jun</Text>
              <Text style={styles.chartAxisLabel}>17 Jun</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 6S Performance */}
      <Text style={styles.sectionTitle}>6S Performance</Text>
      <View style={styles.sixSContainer}>
        {[
          { label: 'Seiri', sub: 'Sort', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
          { label: 'Seiton', sub: 'Set In Order', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
          { label: 'Seiso', sub: 'Shine', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
          { label: 'Seiketsu', sub: 'Standardize', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
          { label: 'Shitsuke', sub: 'Sustain', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
          { label: 'Safety', sub: 'Safety', score: overallScore, color: overallScore >= 80 ? '#10B981' : '#F97316' },
        ].map((item, idx) => (
          <View key={idx} style={styles.sixSRow}>
            <View style={styles.sixSLabelContainer}>
              <Text style={styles.sixSMain}>{item.label}</Text>
              <Text style={styles.sixSSub}>({item.sub})</Text>
            </View>
            <View style={styles.sixSBarBg}>
              <View style={[styles.sixSBarFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
            </View>
            <Text style={styles.sixSScore}>{item.score}%</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FDFBF7', // Cream
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#611624', // Maroon
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  overviewScoreText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  overviewTrendText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  performanceCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  performanceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  performanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 14,
  },
  performanceFloorName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  performanceScoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  performanceIconWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  chartContainer: {
    marginBottom: 32,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  mockChartArea: {
    flexDirection: 'row',
    height: 150,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  chartAxisLabel: {
    fontSize: 9,
    color: '#94A3B8',
  },
  chartGrid: {
    flex: 1,
    justifyContent: 'space-between',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 2,
  },
  chartGridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: -20,
    width: '100%',
  },
  mockAreaPath: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(140, 27, 47, 0.1)',
    borderTopWidth: 2,
    borderTopColor: '#611624',
    borderTopRightRadius: 50, // rough mockup of curve
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#611624',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -4,
    marginBottom: -4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  sixSContainer: {
    marginBottom: 24,
  },
  sixSRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sixSLabelContainer: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sixSMain: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  sixSSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 4,
  },
  sixSBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  sixSBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sixSScore: {
    width: 32,
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
  }
});
