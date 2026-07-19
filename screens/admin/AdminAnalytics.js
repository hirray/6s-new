import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminAnalytics({ onNavigate }) {
  const { db, zones } = useContext(DataContext);
  const insets = useSafeAreaInsets();

  let overallScore = 0;
  if (db.checklistSubmissions.length > 0) {
    overallScore = Math.round(db.checklistSubmissions.reduce((acc, sub) => acc + sub.score, 0) / db.checklistSubmissions.length);
  } else {
    overallScore = 0; // Or display N/A
  }

  const buildingScores = {};
  db.checklistSubmissions.forEach(sub => {
    if (!buildingScores[sub.zone]) {
      buildingScores[sub.zone] = { total: 0, count: 0, sScores: { '1S':0, '2S':0, '3S':0, '4S':0, '5S':0, '6S':0 } };
    }
    buildingScores[sub.zone].total += sub.score;
    buildingScores[sub.zone].count += 1;
    
    // Accumulate individual 'S' scores if available from backend, otherwise fallback to overall score
    ['1S', '2S', '3S', '4S', '5S', '6S'].forEach(s => {
      buildingScores[sub.zone].sScores[s] += (sub.scores && sub.scores[s]) ? sub.scores[s] : sub.score;
    });
  });

  const buildingRankings = zones.map(z => {
    // Attempt to find the zone's score in buildingScores
    const scoreData = buildingScores[z.id] || buildingScores[z.name] || buildingScores[`Zone ${z.id}`];
    
    let avg = 0;
    let sAvg = { '1S':0, '2S':0, '3S':0, '4S':0, '5S':0, '6S':0 };
    
    if (scoreData) {
      avg = Math.round(scoreData.total / scoreData.count);
      ['1S', '2S', '3S', '4S', '5S', '6S'].forEach(s => {
        sAvg[s] = Math.round(scoreData.sScores[s] / scoreData.count);
      });
    } else {
      // Fallback: search for any key that contains the zone ID
      const matchingKey = Object.keys(buildingScores).find(key => {
        const match = key.match(/Zone\s*0?(\d+)/i) || key.match(/^(\d+)$/);
        return match && match[1] === z.id;
      });
      if (matchingKey) {
        avg = Math.round(buildingScores[matchingKey].total / buildingScores[matchingKey].count);
        ['1S', '2S', '3S', '4S', '5S', '6S'].forEach(s => {
          sAvg[s] = Math.round(buildingScores[matchingKey].sScores[s] / buildingScores[matchingKey].count);
        });
      }
    }

    let name = z.name.replace(/Zone \d+ [-–]\s*/, '');
    if (name.length > 15) name = name.substring(0, 15) + '...'; // Keep it short for UI
    
    return { name, score: avg, sAvg };
  }).sort((a,b) => b.score - a.score);

  const displayRankings = buildingRankings.length > 0 ? buildingRankings.slice(0, 5) : [
    { name: 'No Data', score: 0 },
    { name: 'No Data', score: 0 },
    { name: 'No Data', score: 0 }
  ];

  const getTrendData = () => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i * 6); // approx 30 days total
      
      const start = new Date(d);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(end.getDate() + 5);
      end.setHours(23,59,59,999);
      
      const subsInPeriod = db.checklistSubmissions.filter(s => {
        const sd = new Date(s.date);
        return sd >= start && sd <= end;
      });
      
      let score = 0;
      if (subsInPeriod.length > 0) {
        score = Math.round(subsInPeriod.reduce((acc, sub) => acc + sub.score, 0) / subsInPeriod.length);
      } else if (i < 5 && data.length > 0) {
        // Carry over previous score if no data to make chart look continuous instead of dropping to 0
        score = data[data.length - 1].score;
      }
      
      data.push({
        label: i === 0 ? 'Today' : (i === 5 ? '30d ago' : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })),
        score: score
      });
    }
    return data;
  };
  const trendData = getTrendData();
  const pendingComplaints = db.complaints.filter(c => c.status === 'Pending').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('Home')}>
            <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <TouchableOpacity style={{ position: 'relative' }} onPress={() => alert('No new notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#8C1B2F" />
            {pendingComplaints > 0 && (
              <View style={{ position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 8, fontWeight: 'bold' }}>{pendingComplaints}</Text>
              </View>
            )}
          </TouchableOpacity>
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
             {trendData.map((d, i) => (
               <View key={i} style={[styles.chartBar, { height: `${Math.max(2, d.score)}%` }]} />
             ))}
           </View>
           <View style={styles.chartLabels}>
             {trendData.map((d, i) => (
               <Text key={i} style={styles.chartLabelText}>{d.label}</Text>
             ))}
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

      {/* 6S Performance Table */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>6S Performance by Zone</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: 100, textAlign: 'left' }]}>Zone</Text>
              {['1S', '2S', '3S', '4S', '5S', '6S'].map(s => (
                <Text key={s} style={[styles.tableCell, styles.tableCellHeader, { width: 45 }]}>{s}</Text>
              ))}
            </View>
            {buildingRankings.map((b, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 100, textAlign: 'left', fontWeight: '500' }]} numberOfLines={1}>{b.name}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['1S'] >= 85 ? '#10B981' : b.sAvg['1S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['1S']}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['2S'] >= 85 ? '#10B981' : b.sAvg['2S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['2S']}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['3S'] >= 85 ? '#10B981' : b.sAvg['3S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['3S']}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['4S'] >= 85 ? '#10B981' : b.sAvg['4S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['4S']}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['5S'] >= 85 ? '#10B981' : b.sAvg['5S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['5S']}</Text>
                <Text style={[styles.tableCell, { width: 45, color: b.sAvg['6S'] >= 85 ? '#10B981' : b.sAvg['6S'] >= 60 ? '#F59E0B' : '#EF4444' }]}>{b.sAvg['6S']}</Text>
              </View>
            ))}
            {buildingRankings.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#6B7280', padding: 20 }}>No data available</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
    </View>
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
  header: { paddingTop: 10, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#8C1B2F' },
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
  perfScore: { fontSize: 12, fontWeight: 'bold', color: '#111827', width: 30, textAlign: 'right' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 12, alignItems: 'center' },
  tableHeader: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tableCell: { fontSize: 13, color: '#374151', textAlign: 'center' },
  tableCellHeader: { fontWeight: 'bold', color: '#6B7280', fontSize: 11, textTransform: 'uppercase' }
});
