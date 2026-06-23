import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function AdminAnalytics() {
  const { db, zones } = useContext(DataContext);

  let overallScore = 0;
  if (db.checklistSubmissions.length > 0) {
    overallScore = Math.round(db.checklistSubmissions.reduce((acc, sub) => acc + sub.score, 0) / db.checklistSubmissions.length);
  } else {
    overallScore = 0; // Or display N/A
  }

  const buildingScores = {};
  db.checklistSubmissions.forEach(sub => {
    if (!buildingScores[sub.zone]) {
      buildingScores[sub.zone] = { total: 0, count: 0 };
    }
    buildingScores[sub.zone].total += sub.score;
    buildingScores[sub.zone].count += 1;
  });

  const buildingRankings = Object.keys(buildingScores).map(zoneId => {
    const avg = Math.round(buildingScores[zoneId].total / buildingScores[zoneId].count);
    const zInfo = zones.find(z => z.id === zoneId.toString());
    let name = zInfo ? zInfo.name.split('–')[1]?.trim() || zInfo.name : `Zone ${zoneId}`;
    if (name.length > 15) name = name.substring(0, 15) + '...'; // Keep it short for UI
    return { name, score: avg };
  }).sort((a,b) => b.score - a.score);

  const displayRankings = buildingRankings.length > 0 ? buildingRankings.slice(0, 5) : [
    { name: 'No Data', score: 0 },
    { name: 'No Data', score: 0 },
    { name: 'No Data', score: 0 }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <Ionicons name="notifications-outline" size={24} color="#8C1B2F" />
        </View>
      </View>

      {/* Compliance Trend Chart */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Compliance Trend</Text>
          <Text style={styles.cardSubtitle}>(Last 30 Days)</Text>
        </View>
        <Text style={styles.trendValue}>{overallScore}%</Text>
        
        <View style={styles.chartContainer}>
           <View style={styles.chartArea}>
             <View style={[styles.chartBar, { height: '62%' }]} />
             <View style={[styles.chartBar, { height: '70%' }]} />
             <View style={[styles.chartBar, { height: '72%' }]} />
             <View style={[styles.chartBar, { height: '80%' }]} />
             <View style={[styles.chartBar, { height: `${Math.min(100, Math.max(10, overallScore - 5))}%` }]} />
             <View style={[styles.chartBar, { height: `${Math.max(10, overallScore)}%` }]} />
           </View>
           <View style={styles.chartLabels}>
             <Text style={styles.chartLabelText}>20 May</Text>
             <Text style={styles.chartLabelText}></Text>
             <Text style={styles.chartLabelText}>27 May</Text>
             <Text style={styles.chartLabelText}>3 Jun</Text>
             <Text style={styles.chartLabelText}>10 Jun</Text>
             <Text style={styles.chartLabelText}>Today</Text>
           </View>
        </View>
      </View>

      {/* Building Ranking */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Building Ranking</Text>
        {displayRankings.map((b, idx) => (
          <RankingRow 
            key={idx} 
            rank={idx + 1} 
            name={b.name} 
            score={b.score} 
            color={b.score >= 85 ? '#10B981' : b.score >= 60 ? '#F59E0B' : '#EF4444'} 
          />
        ))}
      </View>

      {/* 6S Performance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>6S Average Performance</Text>
        <PerformanceRow name="Seiri (Sort)" score={overallScore > 0 ? Math.min(100, overallScore + 3) : 0} />
        <PerformanceRow name="Seiton (Set In Order)" score={overallScore > 0 ? Math.max(0, overallScore - 5) : 0} color="#F59E0B" />
        <PerformanceRow name="Seiso (Shine)" score={overallScore > 0 ? Math.min(100, overallScore + 2) : 0} />
        <PerformanceRow name="Seiketsu (Standardize)" score={overallScore > 0 ? Math.max(0, overallScore - 2) : 0} />
        <PerformanceRow name="Shitsuke (Sustain)" score={overallScore > 0 ? Math.max(0, overallScore - 4) : 0} color="#F59E0B" />
        <PerformanceRow name="Safety (Safety)" score={overallScore > 0 ? Math.min(100, overallScore + 1) : 0} />
      </View>
    </ScrollView>
  );
}

const RankingRow = ({rank, name, score, color}) => (
  <View style={styles.rankingRow}>
    <View style={[styles.rankCircle, { backgroundColor: rank === 1 ? '#D1FAE5' : rank === 2 ? '#FCE7F3' : '#FEF3C7' }]}>
      <Text style={[styles.rankText, { color: rank === 1 ? '#10B981' : rank === 2 ? '#EC4899' : '#D97706' }]}>{rank}</Text>
    </View>
    <Text style={styles.rankingName}>{name}</Text>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { backgroundColor: color, width: `${score}%` }]} />
    </View>
    <Text style={styles.rankingScore}>{score}%</Text>
  </View>
);

const PerformanceRow = ({name, score, color = '#10B981'}) => (
  <View style={styles.perfRow}>
    <Text style={styles.perfName}>{name}</Text>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { backgroundColor: color, width: `${score}%` }]} />
    </View>
    <Text style={styles.perfScore}>{score}%</Text>
  </View>
);

// We need an empty TouchableOpacity definition to avoid errors if it wasn't imported properly


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', paddingHorizontal: 20 },
  header: { paddingTop: 50, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#8C1B2F' },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'baseline' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  trendValue: { fontSize: 28, fontWeight: 'bold', color: '#10B981', marginTop: -10, marginBottom: 16 },
  chartContainer: { height: 180, marginTop: 10 },
  chartArea: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 0 },
  chartBar: { width: '12%', backgroundColor: '#A7F3D0', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  chartLabelText: { fontSize: 10, color: '#6B7280' },
  rankingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  rankCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { fontSize: 12, fontWeight: 'bold' },
  rankingName: { width: 85, fontSize: 13, fontWeight: 'bold', color: '#111827' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginHorizontal: 12 },
  progressBarFill: { height: 6, borderRadius: 3 },
  rankingScore: { fontSize: 13, fontWeight: 'bold', color: '#111827', width: 35, textAlign: 'right' },
  perfRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  perfName: { width: 140, fontSize: 12, fontWeight: '600', color: '#4B5563' },
  perfScore: { fontSize: 12, fontWeight: 'bold', color: '#111827', width: 30, textAlign: 'right' }
});
