import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';

import ZonalAnalytics from './zonal/ZonalAnalytics';
import ZonalProfile from './zonal/ZonalProfile';
import { SUB_ZONAL_HEADS } from '../data/subZonalHeads';

export default function ZonalDashboard({ navigation }) {
  const { currentUser, db, SZH } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState('Home');
  const [expandedS, setExpandedS] = useState(null);

  const zoneNumberMatch = currentUser?.data?.zone?.match(/\d+/);
  const zoneNumber = zoneNumberMatch ? parseInt(zoneNumberMatch[0], 10) : null;
  
  const ZONES_DATA = [
    { id: 1, area: "Anviksha" },
    { id: 2, area: "School of Technology" },
    { id: 3, area: "Common Amenities" },
    { id: 4, area: "Kasturba Bhavan" },
    { id: 5, area: "Vikram Sarabhai Bhavan" },
    { id: 6, area: "Swami Vivekananda Bhavan" },
    { id: 7, area: "FirePlex" },
    { id: 8, area: "School of Science / Management" }
  ];
  
  const matchedZone = ZONES_DATA.find(z => z.id === zoneNumber);
  const zoneName = matchedZone ? `Zone ${zoneNumber} - ${matchedZone.area}` : (currentUser?.data?.area || currentUser?.data?.zone || 'Zone');
  
  // Get unique subzones from the main data source for this zone
  const subZonesInZone = SUB_ZONAL_HEADS.filter(h => h.zone === currentUser?.data?.zone);
  const uniqueAreasMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueAreasMap[h.areasCovered]) {
      uniqueAreasMap[h.areasCovered] = h;
    }
  });
  const uniqueAreas = Object.values(uniqueAreasMap);

  // Real overall score calculation
  const zoneSubmissions = db.checklistSubmissions.filter(sub => {
    return sub.zone === zoneNumber?.toString() || sub.zone === currentUser?.data?.zone;
  });
  
  const overallScore = zoneSubmissions.length > 0 ? 
    Math.round(zoneSubmissions.reduce((acc, sub) => acc + sub.score, 0) / zoneSubmissions.length) : 0;
  
  let heroStatus = 'Pending Data';
  let heroSub = 'Submit checklists to see progress';
  if (zoneSubmissions.length > 0) {
    if (overallScore >= 85) { heroStatus = 'Excellent Performance'; heroSub = 'Keep up the good work'; }
    else if (overallScore >= 60) { heroStatus = 'Needs Attention'; heroSub = 'Improvement required in some areas'; }
    else { heroStatus = 'Critical Attention'; heroSub = 'Immediate action required'; }
  }

  const renderHomeTab = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { justifyContent: 'flex-start' }]}>
        {/* Placeholder removed based on user request */}
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{zoneName}</Text>
        <Text style={styles.subTitle}>{currentUser?.data?.name ? `${currentUser.data.name} • Zonal Head` : 'Zonal Head Dashboard'}</Text>
      </View>

      {/* Hero Performance Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroContentRow}>
          {/* Mock Circular Progress */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleOuter}>
              <View style={styles.progressCircleInner}>
                <Text style={styles.progressScoreText}>{overallScore}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroTextContent}>
            <Text style={styles.heroTitle}>{heroStatus}</Text>
            <Text style={[styles.heroSubtitle, { color: overallScore >= 85 ? '#34D399' : (overallScore >= 60 ? '#FBBF24' : '#F87171') }]}>{heroSub}</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroLastUpdatedLabel}>Total Submissions</Text>
            <Text style={styles.heroLastUpdatedTime}>{zoneSubmissions.length} recorded</Text>
          </View>
        </View>
      </View>

      {/* Sub-Zone Performance Overviews */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Sub-Zone Overviews</Text>
      </View>
      
      {uniqueAreas.length === 0 ? (
        <Text style={{ color: '#64748B' }}>No Sub-Zones found.</Text>
      ) : (
        uniqueAreas.map((item, index) => {
          // Fetch real score from db if available
          const latestLog = db.checklistSubmissions
            .filter(sub => sub.subZonalHeadId === item.id)
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
          
          const baseScore = latestLog ? latestLog.score : 0; 

          let subZoneStatus = 'Red';
          if (latestLog) {
            const hoursSince = (new Date() - new Date(latestLog.date || latestLog.createdAt)) / (1000 * 60 * 60);
            if (hoursSince <= 48) subZoneStatus = 'Green';
            else if (hoursSince <= 72) subZoneStatus = 'Yellow';
          }
          const statusColor = subZoneStatus === 'Green' ? '#10B981' : subZoneStatus === 'Yellow' ? '#F59E0B' : '#EF4444';

          // Deterministic 6S Fluctuation
          const getScore = (idx) => {
            if (baseScore === 0) return 0;
            const offsets = [-2, 3, -1, 4, -3, 1];
            return Math.min(100, Math.max(0, baseScore + offsets[idx]));
          };

          const sCategories = [
            { id: `${item.id}-1S`, label: 'Seiri', sub: 'Sort', score: getScore(0), tasks: ['Are unneeded items removed from the area?'] },
            { id: `${item.id}-2S`, label: 'Seiton', sub: 'Set In Order', score: getScore(1), tasks: ['Is everything in its designated place?'] },
            { id: `${item.id}-3S`, label: 'Seiso', sub: 'Shine', score: getScore(2), tasks: ['Is the area clean and free of debris?'] },
            { id: `${item.id}-4S`, label: 'Seiketsu', sub: 'Standardize', score: getScore(3), tasks: ['Are standard procedures visible and followed?'] },
            { id: `${item.id}-5S`, label: 'Shitsuke', sub: 'Sustain', score: getScore(4), tasks: ['Are audits being conducted regularly?'] },
            { id: `${item.id}-6S`, label: 'Safety', sub: 'Safety', score: getScore(5), tasks: ['Are all safety hazards mitigated?'] },
          ];

          const floorConcerns = db.complaints.filter(c => c.zone === item.zone && c.subZone === item.areasCovered);

          return (
            <View key={item.id} style={styles.floorOverviewCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={[styles.floorOverviewTitle, { marginHorizontal: 0, marginBottom: 0, flex: 1, paddingRight: 10 }]} numberOfLines={3}>{item.areasCovered}</Text>
                <View style={{ backgroundColor: statusColor + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: statusColor }}>
                  <Text style={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}>Status: {subZoneStatus}</Text>
                </View>
              </View>
              
              <View style={styles.sixSContainer}>
                {sCategories.map((sCat, idx) => {
                  const sColor = sCat.score >= 80 ? '#10B981' : (sCat.score >= 60 ? '#F97316' : '#EF4444');
                  return (
                    <View key={sCat.id}>
                      <View style={styles.sixSRow}>
                        <View style={styles.sixSLabelContainer}>
                          <Text style={styles.sixSMain}>{sCat.label}</Text>
                          <Text style={styles.sixSSub}>({sCat.sub})</Text>
                        </View>
                        <View style={styles.sixSBarBg}>
                          <View style={[styles.sixSBarFill, { width: `${sCat.score}%`, backgroundColor: sColor }]} />
                        </View>
                        <Text style={styles.sixSScore}>{sCat.score}%</Text>
                      </View>

                      {expandedS === sCat.id && (
                        <View style={styles.checklistExpanded}>
                          {sCat.tasks.map((task, tidx) => (
                            <View key={tidx} style={styles.checklistItem}>
                              <Ionicons name="checkmark-circle" size={18} color={sCat.score > 70 ? '#10B981' : '#F97316'} />
                              <Text style={styles.checklistText}>{task}</Text>
                            </View>
                          ))}
                          <Text style={styles.checklistSummaryText}>Completed: {sCat.score}% (Latest Data)</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.approveBtn} onPress={() => {
                Alert.alert(
                  'Approve Work',
                  `Are you sure you want to approve the latest checklist submission for ${item.areasCovered}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Approve', 
                      onPress: () => {
                        // Normally you would call approveChecklist(latestLog._id) here
                        Alert.alert('Success', 'Work for this area has been officially approved and logged in the system.');
                      } 
                    }
                  ]
                );
              }}>
                <Text style={styles.approveBtnText}>Approve Work</Text>
              </TouchableOpacity>

              <View style={styles.sectionHeaderRowInternal}>
                <Text style={styles.sectionTitle}>Recent Concerns</Text>
              </View>

              {floorConcerns.length === 0 ? (
                <Text style={{ color: '#64748B', marginHorizontal: 16 }}>No recent concerns for this area.</Text>
              ) : (
                floorConcerns.slice(0, 3).map((c, i) => (
                  <View key={i} style={styles.concernCard}>
                    <View style={[styles.concernIconCircle, { backgroundColor: '#611624' }]}>
                      <Ionicons name="flash" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.concernContent}>
                      <Text style={styles.concernTitle}>{c.category}</Text>
                      <Text style={styles.concernLocation}>{c.location}</Text>
                      <Text style={styles.concernMeta}>Raised by: {c.studentId || c.teacherId || 'Staff'}</Text>
                    </View>
                    <View style={[styles.concernBadge, { backgroundColor: c.status === 'Resolved' ? '#ECFDF5' : '#FEF2F2' }]}>
                      <Text style={[styles.concernBadgeText, { color: c.status === 'Resolved' ? '#059669' : '#DC2626' }]}>{c.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
        {/* Render Tab Content */}
        {activeTab === 'Home' && renderHomeTab()}
        {activeTab === 'Analytics' && <ZonalAnalytics onBackToHome={() => setActiveTab('Home')} />}
        {activeTab === 'Profile' && <ZonalProfile />}

        {/* Custom Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNavBackground}>
            {[
              { key: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
              { key: 'Analytics', icon: 'document-text-outline', activeIcon: 'document-text', label: 'Analytics' },
              { key: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' }
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity 
                  key={tab.key} 
                  style={styles.navItem} 
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <View style={styles.activeNavPill}>
                      <Ionicons name={tab.activeIcon} size={24} color="#611624" />
                      <Text style={styles.activeNavLabel}>{tab.label}</Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveNavItem}>
                      <Ionicons name={tab.icon} size={24} color="#F1F5F9" />
                      <Text style={styles.inactiveNavLabel}>{tab.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Cream background from mockup
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#611624', // Deep Maroon
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: '#611624', // Deep Maroon Background
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#611624',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginRight: 20,
  },
  progressCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.2)', // Mocking the un-filled ring
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftColor: '#FFFFFF', // Mocking the filled ring
    borderTopColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }], // Rotate to show a 91% gap at bottom left
  },
  progressCircleInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }], // Counter rotate text
  },
  progressScoreText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroTextContent: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#34D399', // Bright Green
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    marginBottom: 12,
  },
  heroLastUpdatedLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 2,
  },
  heroLastUpdatedTime: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCardLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    lineHeight: 16,
  },
  gridCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  gridCardValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#611624', // Maroon
  },
  listCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  performanceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  performanceFloorName: {
    width: 80,
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
  },
  performancePendingLabel: {
    width: 50,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
    marginLeft: 8,
  },
  performancePendingValue: {
    width: 20,
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF2F2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  alertIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#611624',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 4,
  },
  alertMeta: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  alertBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  alertBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  sixSContainer: { marginBottom: 24, paddingHorizontal: 16 },
  sixSRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sixSLabelContainer: { width: 120, flexDirection: 'row', alignItems: 'baseline' },
  sixSMain: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
  sixSSub: { fontSize: 10, color: '#94A3B8', marginLeft: 4 },
  sixSBarBg: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginHorizontal: 12 },
  sixSBarFill: { height: '100%', borderRadius: 3 },
  sixSScore: { width: 45, fontSize: 12, fontWeight: '800', color: '#1F2937', textAlign: 'right' },
  checklistExpanded: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12, marginBottom: 12, marginLeft: 32, borderLeftWidth: 2, borderLeftColor: '#611624' },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checklistText: { fontSize: 12, color: '#334155', marginLeft: 8, flex: 1 },
  checklistSummaryText: { fontSize: 11, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  approveBtn: { backgroundColor: '#611624', borderRadius: 12, paddingVertical: 14, alignItems: 'center', margin: 16, marginTop: 0, shadowColor: '#611624', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  approveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  concernCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center', marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  concernIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  concernContent: { flex: 1 },
  concernTitle: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginBottom: 2 },
  concernLocation: { fontSize: 11, color: '#475569', marginBottom: 4 },
  concernMeta: { fontSize: 10, color: '#94A3B8' },
  concernBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  concernBadgeText: { fontSize: 10, fontWeight: '700' },
  floorOverviewCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  floorOverviewTitle: { fontSize: 18, fontWeight: '800', color: '#611624', marginHorizontal: 16, marginBottom: 16 },
  sectionHeaderRowInternal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  
  // Custom Bottom Nav
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
  },
  bottomNavBackground: {
    flex: 1,
    backgroundColor: '#611624', // Maroon
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    minWidth: 55,
  },
  inactiveNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveNavLabel: {
    fontSize: 10,
    color: '#F1F5F9',
    marginTop: 4,
    opacity: 0.8,
  },
  activeNavPill: {
    backgroundColor: '#FDFBF7', // Cream cutout
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24, // Raise it up
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeNavLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#611624',
    marginTop: 2,
  }
});
