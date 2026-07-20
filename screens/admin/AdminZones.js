import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { getChecklistForUser } from '../../utils/checklistMapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';
import * as XLSX from 'xlsx';


export default function AdminZones({ onNavigate }) {
  const { db, staticData, zones } = useContext(DataContext);
  const insets = useSafeAreaInsets();
  const [expandedZone, setExpandedZone] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubZone, setExpandedSubZone] = useState(null);
  const [selectedPrinciple, setSelectedPrinciple] = useState(null);

  const ZONES_DATA = zones.map((z, index) => {
    const bgColors = ['#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B', '#8C1B2F', '#1C75FF', '#00B94A', '#F59E0B'];
    
    const zh = (staticData?.zonalHeads || []).find(h => {
      const headZoneNum = h.zone ? String(h.zone).replace(/\D/g, '') : String(h.zoneNumber);
      return headZoneNum === String(z.id);
    });

    const subZones = (staticData?.subZonalHeads || []).filter(szh => {
      const szhZoneNum = szh.zone ? szh.zone.toString().replace(/\D/g, '') : '';
      return szhZoneNum === z.id.toString();
    }).map(szh => {
      const szhFloor = szh.areasCovered || szh.floor || szh.subZone || 'Unknown Area';
      const szhComplaints = db.complaints.filter(c => 
        (c.subZone === szhFloor || c.subZone === szh.name || c.subZone === szh.subZone)
      );
      const pending = szhComplaints.filter(c => c.status === 'Pending').length;
      const resolved = szhComplaints.filter(c => c.status === 'Resolved').length;
      
      const submissions = db.checklistSubmissions.filter(s => s.subZonalHeadId === szh._id || s.subZonalHeadId === szh.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date));
      const latestSub = submissions.length > 0 ? submissions[0] : null;
      const compliance = latestSub ? latestSub.score : 0;

      const fullDataMapped = {
        ...szh,
        floor: szhFloor,
        name: szh.name || 'Unassigned'
      };

      let timeStatus = 'Red';
      if (latestSub) {
        const hoursSince = (new Date() - new Date(latestSub.date || latestSub.createdAt)) / (1000 * 60 * 60);
        if (hoursSince <= 48) timeStatus = 'Green';
        else if (hoursSince <= 72) timeStatus = 'Yellow';
      }

      return {
        id: szh._id || szh.id || Math.random().toString(),
        name: szhFloor,
        headName: szh.name,
        concerns: szhComplaints.length,
        pending,
        resolved,
        compliance,
        latestSub,
        timeStatus,
        fullData: fullDataMapped
      };
    });

    return {
      id: z.id,
      name: z.name,
      headName: zh ? zh.name : 'Unassigned',
      icon: 'business',
      bgColor: bgColors[index % bgColors.length],
      subZones
    };
  });

  const filteredZones = ZONES_DATA.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.subZones.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())));

  const exportPdf = async (zone) => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; font-size: 14px; }
              h2 { color: #111827; margin-top: 30px; margin-bottom: 15px; font-size: 18px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
              th { background-color: #4338CA; color: #FFFFFF; font-weight: bold; }
              .score { text-align: right; }
            </style>
          </head>
          <body>
            <h2>Summary</h2>
            <table>
              <tr>
                <th>Zone Name</th>
                <th>Zonal Head</th>
                <th>Total Sub-Zones</th>
                <th>Generated On</th>
              </tr>
              <tr>
                <td>${zone.name}</td>
                <td>${zone.headName}</td>
                <td>${zone.subZones.length}</td>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            
            <h2>Sub-Zone Compliance</h2>
            <table>
              <tr>
                <th>Sub-Zone</th>
                <th>Manager</th>
                <th>Total Concerns</th>
                <th>Compliance %</th>
              </tr>
              ${zone.subZones.map(sub => `
                <tr>
                  <td>${sub.name}</td>
                  <td>${sub.headName}</td>
                  <td>${sub.concerns}</td>
                  <td class="score">${sub.compliance.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </table>
            
            <h2>Detailed Sub-Zone 6S Reviews & Concerns</h2>
            <table>
              <tr>
                <th>Sub-Zone</th>
                <th>Manager</th>
                <th>6S Breakdown</th>
                <th>Active Concerns</th>
              </tr>
              ${zone.subZones.map(sub => {
                const breakdown = ['1S', '2S', '3S', '4S', '5S', '6S'].map(principle => {
                  const score = sub.latestSub?.scores ? (sub.latestSub.scores[principle] || 0) : 0;
                  return `${principle}: ${score}%`;
                }).join('<br/>');
                
                return `
                  <tr>
                    <td>${sub.name}</td>
                    <td>${sub.headName}</td>
                    <td>${breakdown}</td>
                    <td>${sub.pending > 0 ? `${sub.pending} pending` : 'None'}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const newUri = FileSystemLegacy.cacheDirectory + `report_${Date.now()}.pdf`;
      await FileSystemLegacy.copyAsync({ from: uri, to: newUri });
      await shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Share ${zone.name} Report` });
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report.');
    }
  };

  const exportExcel = async (zone) => {
    try {
      const overviewData = zone.subZones.map(sub => ({
        'Sub-Zone': sub.name,
        'Manager': sub.headName,
        'Total Concerns': sub.concerns,
        'Pending Concerns': sub.pending,
        'Resolved Concerns': sub.resolved,
        'Compliance Score (%)': sub.compliance,
        '1S Score': sub.latestSub?.scores?.['1S'] || 0,
        '2S Score': sub.latestSub?.scores?.['2S'] || 0,
        '3S Score': sub.latestSub?.scores?.['3S'] || 0,
        '4S Score': sub.latestSub?.scores?.['4S'] || 0,
        '5S Score': sub.latestSub?.scores?.['5S'] || 0,
        '6S Score': sub.latestSub?.scores?.['6S'] || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(overviewData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Zone Report");

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystemLegacy.cacheDirectory + `${zone.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.xlsx`;
      
      await FileSystemLegacy.writeAsStringAsync(uri, wbout, {
        encoding: FileSystemLegacy.EncodingType.Base64
      });
      
      await shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Excel Report',
        UTI: 'com.microsoft.excel.xls'
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate Excel report.');
    }
  };

  const toggleZone = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedZone(expandedZone === id ? null : id);
  };

  const toggleSubZone = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubZone(expandedSubZone === id ? null : id);
    setSelectedPrinciple(null); // Reset selected 'S' when changing sub-zone
  };

  const renderDetailedChecklist = (sub, principleId) => {
    const principleNameMap = {
      '1S': 'Sort',
      '2S': 'Set In Order',
      '3S': 'Shine',
      '4S': 'Standardize',
      '5S': 'Sustain',
      '6S': 'Safety'
    };

    const principleName = principleNameMap[principleId];
    
    // Get real checklist for this user
    const checklistData = getChecklistForUser(sub.fullData, staticData?.checklists || []);
    let items = checklistData[principleName] || [];

    // Fallback if no items found
    if (items.length === 0) {
      items = [`No specific checklist items defined for ${principleName} in this sub-zone.`];
    }

    // Determine specific remarks for this subzone submission
    const submissionRemarks = sub.latestSub?.remarks || [];

    // Find if we have complaints for this subzone to provide analysis context
    const analysisContext = sub.pending > 0 
      ? `Analysis: There are ${sub.pending} pending concerns that might negatively affect this score.` 
      : `Analysis: Excellent! This zone has a clean record with 0 pending concerns affecting this principle.`;

    // A mock real-time score for this 'S'
    const sScore = sub.latestSub?.scores ? (sub.latestSub.scores[principleId] || 80) : 80;
    
    return (
      <View style={styles.detailedChecklistContainer}>
        <View style={styles.checklistHeader}>
          <Text style={styles.checklistTitle}>{principleId} Real-Time Checklist</Text>
          <Text style={[styles.checklistScore, { color: sScore >= 85 ? '#1A8C4E' : sScore >= 60 ? '#B07D10' : '#C0182A' }]}>Score: {sScore}%</Text>
        </View>

        {items.map((item, idx) => {
          // Check if the item was marked as a concern in the latest submission
          const failedItem = submissionRemarks.find(r => r.task === item);
          const isFailed = !!failedItem;

          return (
            <View key={idx} style={styles.checklistItemRow}>
              <Ionicons name={isFailed ? "close-circle" : "checkmark-circle"} size={20} color={isFailed ? "#C0182A" : "#1A8C4E"} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.checklistItemText}>{item}</Text>
                {isFailed && (
                  <Text style={{ fontSize: 12, color: '#991B1B', marginTop: 4, fontStyle: 'italic' }}>
                    Remark: {failedItem.comment}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.analysisBox}>
          <Ionicons name="analytics" size={18} color="#8C1B2F" style={{marginRight: 6}} />
          <Text style={styles.analysisText}>{analysisContext}</Text>
        </View>
      </View>
    );
  };

  const render6SPrinciples = (sub) => {
    const principles = [
      { id: '1S', name: 'Sort', desc: 'Remove unnecessary', color: '#1C75FF', icon: 'layers' },
      { id: '2S', name: 'Set in Order', desc: 'Organize Everything', color: '#0F766E', icon: 'grid' },
      { id: '3S', name: 'Shine', desc: 'Clean and inspect', color: '#1A8C4E', icon: 'sparkles' },
      { id: '4S', name: 'Standardize', desc: 'Create rules', color: '#E11D48', icon: 'document-text' },
      { id: '5S', name: 'Sustain', desc: 'Maintain discipline', color: '#D97706', icon: 'bar-chart' },
      { id: '6S', name: 'Safety', desc: 'Ensure safety', color: '#CA8A04', icon: 'shield-checkmark' }
    ];

    return (
      <View style={{ marginTop: 10, paddingBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.principlesScroll}>
          {principles.map((p, idx) => {
            const isSelected = selectedPrinciple === p.id;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.principleCard, { borderColor: p.color }, isSelected && { backgroundColor: p.color + '15' }]}
                onPress={() => setSelectedPrinciple(isSelected ? null : p.id)}
              >
                <View style={[styles.principleIconWrapper, { backgroundColor: p.color + '20' }]}>
                  <Ionicons name={p.icon} size={20} color={p.color} />
                </View>
                <Text style={[styles.principleName, { color: p.color }]}>{p.name}</Text>
                <Text style={styles.principleDesc}>{p.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {selectedPrinciple && renderDetailedChecklist(sub, selectedPrinciple)}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('Home')} style={{marginRight: 10}}>
            <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
          </TouchableOpacity>
          <Text style={styles.title}>Concerns</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search concerns..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {filteredZones.map((zone, zIndex) => {
          const isExpanded = expandedZone === zone.id;
          return (
            <View key={`zone-${zone.id}-${zIndex}`} style={styles.accordionCard}>
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleZone(zone.id)}>
                <View style={[styles.zoneIconCircle, { backgroundColor: zone.bgColor }]}>
                  <Ionicons name={zone.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.zoneName, { flex: 0 }]}>{zone.name}</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Zonal Head: {zone.headName}</Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#111827" />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.accordionBody}>
                  <View style={styles.exportBar}>
                    <Text style={styles.exportLabel}>Export:</Text>
                    <TouchableOpacity style={styles.exportBtnPdf} onPress={() => exportPdf(zone)}>
                      <Ionicons name="document-text" size={16} color="#FFF" />
                      <Text style={styles.exportBtnText}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportBtnExcel} onPress={() => exportExcel(zone)}>
                      <Ionicons name="grid" size={16} color="#FFF" />
                      <Text style={styles.exportBtnText}>Excel</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.thEmpty, {flex: 2.5}]}></Text>
                    <Text style={[styles.th, {flex: 1, textAlign: 'right', paddingRight: 10}]}>Compliance Score</Text>
                    <Text style={styles.thIcon}></Text>
                  </View>

                  {zone.subZones.map((sub, sIndex) => {
                    const isSubExpanded = expandedSubZone === sub.id;
                    const statusColor = sub.timeStatus === 'Green' ? '#10B981' : sub.timeStatus === 'Yellow' ? '#F59E0B' : '#EF4444';

                    return (
                      <View key={`sub-${sub.id}-${sIndex}`} style={styles.subZoneWrapper}>
                        <TouchableOpacity 
                          style={styles.tableRow}
                          onPress={() => toggleSubZone(sub.id)}
                        >
                          <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.tdLabel} numberOfLines={2}>{sub.name}</Text>
                            <View style={{ backgroundColor: statusColor + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: statusColor, marginLeft: 8 }}>
                              <Text style={{ color: statusColor, fontSize: 9, fontWeight: 'bold' }}>{sub.timeStatus}</Text>
                            </View>
                          </View>
                          <Text style={[styles.tdValue, {fontWeight: 'bold', flex: 1, textAlign: 'right', paddingRight: 10}]}>{sub.compliance}%</Text>
                          <Ionicons name={isSubExpanded ? "chevron-up" : "chevron-forward"} size={16} color="#111827" />
                        </TouchableOpacity>

                        {isSubExpanded && (
                          <View style={styles.subZoneDetails}>
                            <Text style={styles.subZoneManager}>Manager: {sub.headName}</Text>
                            {render6SPrinciples(sub)}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { marginBottom: 20, paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#8C1B2F' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, paddingHorizontal: 16, height: 50, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  scrollView: { paddingHorizontal: 20 },
  accordionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  zoneIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  zoneName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#111827' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  tableHeaderRow: { flexDirection: 'row', marginBottom: 12 },
  thEmpty: { flex: 1 },
  exportBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, flexWrap: 'wrap' },
  exportLabel: { fontSize: 14, fontWeight: 'bold', color: '#4B5563', marginRight: 10 },
  exportBtnPdf: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E11D48', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
  exportBtnExcel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  exportBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  th: { flex: 1, fontSize: 11, color: '#6B7280', textAlign: 'center' },
  thIcon: { width: 20 },
  subZoneWrapper: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  tdLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  tdValue: { flex: 1, fontSize: 14, textAlign: 'center' },
  subZoneDetails: { backgroundColor: '#F9FAFB', paddingTop: 15, paddingBottom: 5 },
  subZoneManager: { fontSize: 13, color: '#4B5563', marginBottom: 5, fontStyle: 'italic', paddingHorizontal: 20 },
  principlesScroll: { paddingHorizontal: 20, paddingBottom: 10 },
  principleCard: { width: 130, borderWidth: 1.5, borderRadius: 12, padding: 12, marginRight: 12, backgroundColor: '#FFFFFF' },
  principleIconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  principleName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  principleDesc: { fontSize: 11, color: '#6B7280' },
  detailedChecklistContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 10, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  checklistTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  checklistScore: { fontSize: 14, fontWeight: 'bold' },
  checklistItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  checklistItemText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  analysisBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  analysisText: { fontSize: 12, color: '#991B1B', flex: 1 }
});
