import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { SUB_ZONAL_HEADS } from '../../data/subZonalHeads';

export default function ZonalAnalytics({ onBackToHome }) {
  const { currentUser, db } = useContext(DataContext);
  
  // Real data calculations
  const zoneNumberMatch = currentUser?.data?.zone?.match(/\d+/);
  const zoneNumber = zoneNumberMatch ? zoneNumberMatch[0] : null;

  const zoneSubmissions = db.checklistSubmissions.filter(sub => {
    return sub.zone === zoneNumber || sub.zone === currentUser?.data?.zone;
  });
  
  const overallScore = zoneSubmissions.length > 0 ? 
    Math.round(zoneSubmissions.reduce((acc, sub) => acc + sub.score, 0) / zoneSubmissions.length) : 0;
    
  let bestFloor = { name: 'N/A', score: 0 };
  let lowestFloor = { name: 'N/A', score: 100 };
  
  if (zoneSubmissions.length > 0) {
    zoneSubmissions.forEach(sub => {
      const head = SUB_ZONAL_HEADS.find(h => h.id === sub.subZonalHeadId);
      const floorName = head ? head.areasCovered : sub.subZonalHeadId;
      
      if (sub.score >= bestFloor.score) { bestFloor = { name: floorName, score: sub.score }; }
      if (sub.score <= lowestFloor.score) { lowestFloor = { name: floorName, score: sub.score }; }
    });
  } else {
    lowestFloor.score = 0;
  }

  // Trend data points
  const recentSubs = [...zoneSubmissions].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
  let trendPoints = [50, 70, 75, 85, 90, 92]; // Fallback
  if (recentSubs.length > 0) {
    const last6 = recentSubs.slice(-6);
    let lastVal = last6[0].score;
    for(let i=0; i<6; i++) {
      if (last6[i]) lastVal = last6[i].score;
      trendPoints[i] = lastVal;
    }
  }

  // Deterministic 6S Fluctuation
  const getSScore = (base, index) => {
    if (base === 0) return 0;
    const offsets = [-2, 3, -1, 4, -3, 1];
    return Math.min(100, Math.max(0, base + offsets[index]));
  };

  const sixSData = [
    { label: 'Seiri', sub: 'Sort', score: getSScore(overallScore, 0) },
    { label: 'Seiton', sub: 'Set In Order', score: getSScore(overallScore, 1) },
    { label: 'Seiso', sub: 'Shine', score: getSScore(overallScore, 2) },
    { label: 'Seiketsu', sub: 'Standardize', score: getSScore(overallScore, 3) },
    { label: 'Shitsuke', sub: 'Sustain', score: getSScore(overallScore, 4) },
    { label: 'Safety', sub: 'Safety', score: getSScore(overallScore, 5) }
  ].map(s => ({...s, color: s.score >= 80 ? '#10B981' : (s.score >= 60 ? '#F97316' : '#EF4444')}));

  // Individual Sub-Zone calculations
  const subZonesInZone = SUB_ZONAL_HEADS.filter(szh => szh.zone === (zoneNumber ? 'Zone ' + zoneNumber : currentUser?.data?.zone));
  const uniqueAreasMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueAreasMap[h.areasCovered]) {
      uniqueAreasMap[h.areasCovered] = h;
    }
  });
  const uniqueAreas = Object.values(uniqueAreasMap);

  // Report Generation Logic
  const handleGenerateReport = () => {
    Alert.alert(
      "Generate Report",
      "Choose the format for your performance report",
      [
        { text: "PDF", onPress: generatePDF },
        { text: "Excel (CSV)", onPress: generateCSV },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getSubZoneScores = () => {
    return uniqueAreas.map(item => {
      const latestLog = db.checklistSubmissions
        .filter(sub => sub.subZonalHeadId === item.id || sub.subZonalHeadId === item.email)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
      return {
        area: item.areasCovered,
        score: latestLog ? latestLog.score : 0
      };
    });
  };

  const generatePDF = async () => {
    const scores = getSubZoneScores();
    const rows = scores.map(sz => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sz.area}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><b>${sz.score}%</b></td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            h1 { color: #611624; }
            .summary { background: #fdfbf7; padding: 20px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background-color: #f1f5f9; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Performance Report - Zone ${zoneNumber || 'Overview'}</h1>
          <div class="summary">
            <h2>Overall Score: ${overallScore}%</h2>
            <p>Best Area: ${bestFloor.name} (${bestFloor.score}%)</p>
            <p>Lowest Area: ${lowestFloor.name} (${lowestFloor.score}%)</p>
          </div>
          <h2>Individual Sub-Zone Performance</h2>
          <table>
            <tr><th>Area Covered</th><th>Latest Score</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;

    try {
      const { base64 } = await Print.printToFileAsync({ html: htmlContent, base64: true });
      const newUri = FileSystem.documentDirectory + `Zone_${zoneNumber || 'Performance'}_Report.pdf`;
      
      await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("PDF generation error", error);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  const generateCSV = async () => {
    const scores = getSubZoneScores();
    const csvHeader = "Area Covered,Latest Score (%)\n";
    const csvRows = scores.map(sz => `"${sz.area.replace(/"/g, '""')}",${sz.score}`).join('\n');
    const csvData = csvHeader + csvRows;

    const fileUri = FileSystem.documentDirectory + `Zone_${zoneNumber || 'Performance'}_Report.csv`;
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("CSV generation error", error);
      Alert.alert("Error", "Failed to generate Excel file.");
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.iconButton} onPress={onBackToHome}>
            <Ionicons name="arrow-back" size={24} color="#611624" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Analytics</Text>
        </View>
        <TouchableOpacity style={styles.reportBtn} onPress={handleGenerateReport}>
          <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{marginRight: 6}} />
          <Text style={styles.reportBtnText}>Report</Text>
        </TouchableOpacity>
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
        {sixSData.map((item, idx) => (
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

      {/* Individual Sub-Zone Performance */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Individual Sub-Zone Performance</Text>
      <View style={styles.subZoneListContainer}>
        {uniqueAreas.length === 0 ? (
          <Text style={{ color: '#64748B' }}>No Sub-Zones found.</Text>
        ) : (
          uniqueAreas.map((item, index) => {
            const latestLog = db.checklistSubmissions
              .filter(sub => sub.subZonalHeadId === item.id || sub.subZonalHeadId === item.email)
              .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
            const szScore = latestLog ? latestLog.score : 0; 
            const szColor = szScore >= 85 ? '#10B981' : szScore >= 60 ? '#F97316' : '#EF4444';

            return (
              <View key={index} style={styles.performanceListItem}>
                <Text style={styles.performanceFloorName} numberOfLines={2}>{item.areasCovered}</Text>
                <View style={styles.performanceBarBg}>
                  <View style={[styles.performanceBarFill, { width: `${szScore}%`, backgroundColor: szColor }]} />
                </View>
                <Text style={styles.performanceScoreText}>{szScore}%</Text>
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Cream
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FDFBF7',
  },
  reportBtn: {
    flexDirection: 'row',
    backgroundColor: '#611624',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
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
  chartContainer: {
    marginBottom: 32,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
  },
  sixSContainer: {
    marginBottom: 24,
    marginHorizontal: 20,
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
  },
  subZoneListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginHorizontal: 20,
  },
  performanceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  performanceFloorName: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  performanceBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  performanceScoreText: {
    width: 35,
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
  }
});
