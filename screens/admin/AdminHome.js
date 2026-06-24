import React, { useState, useContext, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Animated, Easing, Dimensions, SafeAreaView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

const getMarkerColor = (status) => {
  switch(status) {
    case 'Green': return '#10B981'; // Emerald 500
    case 'Yellow': return '#F59E0B'; // Amber 500
    case 'Red': return '#EF4444'; // Red 500
    default: return '#6B7280';
  }
};

const AnimatedMarker = ({ marker, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.6,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.markerWrapper, 
        { top: marker.top, left: marker.left }
      ]}
      onPress={onPress}
    >
      <Animated.View style={[
        styles.markerRing, 
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]} />
      <View style={[styles.markerCircle, { backgroundColor: getMarkerColor(marker.status) }]}>
        <Text style={styles.markerText}>{marker.id}</Text>
      </View>
    </TouchableOpacity>
  );
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ZoneDetailModal = ({ selectedZone, close, db, staticData }) => {
  const [expandedSubZone, setExpandedSubZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get SubZonal Heads for this zone
  const zoneId = parseInt(selectedZone.id);
  let subZonalHeads = staticData?.subZonalHeads?.filter(sz => sz.zone === zoneId) || [];
  
  if (searchQuery) {
    subZonalHeads = subZonalHeads.filter(sz => 
      sz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (sz.floor && sz.floor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  const toggleSubZone = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubZone(expandedSubZone === id ? null : id);
  };

  const getSubZoneMetrics = (sz) => {
    // Latest submission
    const submissions = db.checklistSubmissions
      .filter(s => s.subZonalHeadId === sz.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestSub = submissions.length > 0 ? submissions[0] : null;
    const compliance = latestSub ? latestSub.score : 0;

    // Complaints for this specific sub-zone
    const subZoneComplaints = db.complaints.filter(c => c.subZone === sz.floor || c.subZone === sz.subZone || (c.subZone && c.subZone.includes(sz.floor)));
    const pendings = subZoneComplaints.filter(c => c.status === 'Pending').length;
    const resolved = subZoneComplaints.filter(c => c.status === 'Resolved' || c.status === 'Done').length;

    return { compliance, pendings, resolved, latestSub };
  };

  const renderChecklistBreakdown = (latestSub) => {
    if (!latestSub || !latestSub.scores) {
      return (
        <View style={styles.breakdownEmpty}>
          <Text style={styles.breakdownEmptyText}>No checklist data available for this sub-zone yet.</Text>
        </View>
      );
    }
    
    // Convert scores object to array if needed, assuming scores is an object mapping category to score
    const categories = ['1S', '2S', '3S', '4S', '5S', '6S'];
    return (
      <View style={styles.breakdownContainer}>
        {categories.map((cat, idx) => {
          const score = latestSub.scores[cat] || latestSub.scores[cat.toLowerCase()] || latestSub[cat.toLowerCase()] || Math.round(latestSub.score);
          const color = score >= 85 ? '#1A8C4E' : score >= 60 ? '#B07D10' : '#C0182A';
          return (
            <View key={idx} style={styles.breakdownRow}>
              <Text style={styles.breakdownCat}>{cat} Compliance</Text>
              <Text style={[styles.breakdownScore, { color }]}>{score}%</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.detailModalContainer}>
        <SafeAreaView style={styles.detailModalSafeArea}>
          <View style={styles.detailModalHeader}>
            <TouchableOpacity onPress={close} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#6E2A36" />
            </TouchableOpacity>
            <Text style={styles.detailModalTitle}>Zone Details</Text>
            <TouchableOpacity>
              <Ionicons name="filter" size={24} color="#6E2A36" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search sub-zones..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.accordionCard}>
              <View style={styles.accordionHeader}>
                <View style={[styles.accordionIcon, { backgroundColor: getMarkerColor(selectedZone.status) }]}>
                  <Ionicons name="business" size={20} color="#FFF" />
                </View>
                <Text style={styles.accordionTitle}>{selectedZone.name}</Text>
                <Ionicons name="chevron-up" size={20} color="#111827" />
              </View>

              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCol, {flex: 2}]}></Text>
                <Text style={[styles.tableHeaderCol, {flex: 1, textAlign: 'center'}]}>Compliance</Text>
                <Text style={[styles.tableHeaderCol, {flex: 1, textAlign: 'center'}]}>Pendings</Text>
                <Text style={[styles.tableHeaderCol, {flex: 1, textAlign: 'center'}]}>Resolved</Text>
                <View style={{width: 24}} />
              </View>

              {subZonalHeads.map((sz, index) => {
                const metrics = getSubZoneMetrics(sz);
                const isExpanded = expandedSubZone === sz.id;
                const compColor = metrics.compliance >= 85 ? '#1A8C4E' : metrics.compliance >= 60 ? '#B07D10' : '#C0182A';

                return (
                  <View key={sz.id} style={styles.subZoneRowContainer}>
                    <TouchableOpacity 
                      style={styles.subZoneRow}
                      onPress={() => toggleSubZone(sz.id)}
                    >
                      <Text style={[styles.subZoneName, {flex: 2}]} numberOfLines={2}>
                        {sz.floor || sz.name}
                      </Text>
                      <Text style={[styles.subZoneMetric, {flex: 1, color: compColor}]}>{metrics.compliance}%</Text>
                      <Text style={[styles.subZoneMetric, {flex: 1, color: '#D97706'}]}>{metrics.pendings}</Text>
                      <Text style={[styles.subZoneMetric, {flex: 1, color: '#1A8C4E'}]}>{metrics.resolved}</Text>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-forward"} size={20} color="#6B7280" />
                    </TouchableOpacity>
                    
                    {isExpanded && renderChecklistBreakdown(metrics.latestSub)}
                  </View>
                );
              })}
              
              {subZonalHeads.length === 0 && (
                <View style={{padding: 20, alignItems: 'center'}}>
                  <Text style={{color: '#6B7280'}}>No Sub-Zones assigned to this zone.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default function AdminHome() {
  const { zones, db, staticData } = useContext(DataContext);
  const [selectedZone, setSelectedZone] = useState(null);

  // Compute live zone data from MongoDB db
  const liveZones = zones.map(z => {
    const head = staticData?.zonalHeads?.find(h => h.zone === parseInt(z.id));
    const manager = head ? head.name : 'Unassigned';

    const extractZoneNumber = (zoneStr) => {
      if (!zoneStr) return null;
      const match = zoneStr.match(/Zone\s*0?(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    };
    
    const zoneComplaints = db.complaints.filter(c => extractZoneNumber(c.zone) === parseInt(z.id) && c.status === 'Pending');
    
    const zoneSZHs = staticData?.subZonalHeads?.filter(s => s.zone === parseInt(z.id)) || [];
    const recentSubs = zoneSZHs.map(sz => {
      return db.checklistSubmissions
        .filter(s => s.subZonalHeadId === sz.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    }).filter(Boolean);

    let avgScore = 100;
    if (recentSubs.length > 0) {
      avgScore = recentSubs.reduce((acc, sub) => acc + sub.score, 0) / recentSubs.length;
    } else if (zoneSZHs.length > 0) {
      avgScore = 0; // Nobody submitted
    }

    let score = Math.max(0, Math.round(avgScore - (zoneComplaints.length * 5)));
    let status = 'Green';
    if (score < 60) status = 'Red';
    else if (score < 85) status = 'Yellow';

    return {
      ...z,
      manager,
      status,
      score,
      openConcerns: zoneComplaints.length,
      lastSub: recentSubs.length > 0 ? recentSubs[0].date : 'None yet',
      checklistRatio: `${recentSubs.length}/${zoneSZHs.length}`
    };
  });

  const totalZones = liveZones.length;
  const overallCompliance = liveZones.length > 0 ? Math.round(liveZones.reduce((sum, z) => sum + z.score, 0) / liveZones.length) : 0;
  
  const totalComplaints = db.complaints.length;
  const pendingComplaints = db.complaints.filter(c => c.status === 'Pending').length;
  const resolvedComplaints = db.complaints.filter(c => c.status === 'Resolved' || c.status === 'Done').length;
  const activeAdvisories = db.advisories.length;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FAF9F6'}}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={32} color="#6E2A36" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={28} color="#6E2A36" />
          <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Admin Dashboard</Text>
        <Text style={styles.pageSubtitle}>University Compliance Overview</Text>
      </View>

      {/* Maroon Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.circleProgress}>
          <Text style={styles.circleText}>{overallCompliance}%</Text>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Overall Compliance</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{overallCompliance >= 85 ? 'Excellent' : overallCompliance >= 60 ? 'Good' : 'Needs Work'}</Text>
          </View>
          <View style={styles.trendRow}>
            <Ionicons name="arrow-up" size={16} color="#1A8C4E" />
            <Text style={styles.trendText}> 6% from last month</Text>
          </View>
        </View>
      </View>

      {/* 4 White Summary Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#FF8800' }]}>
            <Ionicons name="alert" size={24} color="#FFF" />
          </View>
          <Text style={[styles.statNumber, { color: '#D97706' }]}>{totalComplaints}</Text>
          <Text style={styles.statLabel}>Total{'\n'}Complaints</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#8C1B2F' }]}>
            <Ionicons name="alert-circle" size={24} color="#FFF" />
          </View>
          <Text style={[styles.statNumber, { color: '#8C1B2F' }]}>{pendingComplaints}</Text>
          <Text style={styles.statLabel}>Pending{'\n'}Complaints</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#1A8C4E' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          </View>
          <Text style={[styles.statNumber, { color: '#1A8C4E' }]}>{resolvedComplaints}</Text>
          <Text style={styles.statLabel}>Resolved{'\n'}this month</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#6D28D9' }]}>
            <Ionicons name="megaphone" size={24} color="#FFF" />
          </View>
          <Text style={[styles.statNumber, { color: '#6D28D9' }]}>{activeAdvisories}</Text>
          <Text style={styles.statLabel}>Active{'\n'}Advisories</Text>
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapCardHeader}>
          <Text style={styles.mapCardTitle}>Live Campus Zone Map — Annexure I</Text>
          <Text style={styles.mapCardSubtitle}>Pinch to zoom in and out. Drag to pan.</Text>
        </View>

        <View style={styles.mapContainer}>
          <ReactNativeZoomableView
            maxZoom={3}
            minZoom={1}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
          >
            <ImageBackground 
              source={require('../../assets/live-map.png')}
              style={styles.map}
              resizeMode="cover"
            >
              <View style={styles.mapOverlay} />

              {liveZones.map(marker => (
                <AnimatedMarker 
                  key={marker.id} 
                  marker={marker} 
                  onPress={() => setSelectedZone(marker)} 
                />
              ))}
            </ImageBackground>
          </ReactNativeZoomableView>
        </View>

        <View style={styles.mapCardDivider} />

        <View style={styles.mapLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: getMarkerColor('Green') }]} />
            <Text style={styles.legendText}>On time / within 7-day review</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: getMarkerColor('Yellow') }]} />
            <Text style={styles.legendText}>1 day late / overdue review</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: getMarkerColor('Red') }]} />
            <Text style={styles.legendText}>2+ days late / severely overdue</Text>
          </View>
        </View>
      </View>

      {selectedZone && (
        <ZoneDetailModal 
          selectedZone={selectedZone} 
          close={() => setSelectedZone(null)} 
          db={db}
          staticData={staticData}
        />
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  notificationBtn: { position: 'relative' },
  badge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FAF9F6' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  titleContainer: { paddingHorizontal: 20, marginBottom: 15 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#6E2A36', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginTop: 2 },
  
  bannerCard: { backgroundColor: '#6E2A36', marginHorizontal: 20, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center' },
  circleProgress: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  circleText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  bannerContent: { flex: 1, justifyContent: 'center' },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  statusPill: { backgroundColor: '#1A8C4E', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  statusPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  trendRow: { flexDirection: 'row', alignItems: 'center' },
  trendText: { color: '#FFFFFF', fontSize: 13, opacity: 0.9 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 15 },
  statCard: { width: '23%', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statNumber: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#6B7280', textAlign: 'center', fontWeight: '600' },
  mapCard: { backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  mapCardHeader: { marginBottom: 16 },
  zoomControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 4 },
  zoomButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  zoomButtonText: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginTop: -2 },
  mapCardTitle: { fontSize: 22, fontWeight: 'bold', color: '#8C1B2F' },
  mapCardSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8 },
  mapContainer: { aspectRatio: 860/620, backgroundColor: '#374151', borderRadius: 12, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  mapCardDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  mapLegend: { paddingHorizontal: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendText: { fontSize: 14, color: '#374151' },
  markerWrapper: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginLeft: -30, marginTop: -30 }, // Center based on top/left
  markerRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(192, 24, 42, 0.8)', backgroundColor: 'rgba(192, 24, 42, 0.2)' },
  markerCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 5 },
  markerText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  
  // Detail Modal Styles
  detailModalContainer: { flex: 1, backgroundColor: '#FAF9F6' },
  detailModalSafeArea: { flex: 1 },
  detailModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { padding: 5 },
  detailModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#6E2A36' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  detailScroll: { flex: 1, paddingHorizontal: 20 },
  
  accordionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 30 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  accordionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  accordionTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableHeaderCol: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  
  subZoneRowContainer: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  subZoneRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  subZoneName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  subZoneMetric: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  
  breakdownEmpty: { padding: 15, backgroundColor: '#F9FAFB', alignItems: 'center' },
  breakdownEmptyText: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },
  breakdownContainer: { backgroundColor: '#F9FAFB', paddingHorizontal: 30, paddingVertical: 15 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  breakdownCat: { fontSize: 13, color: '#4B5563' },
  breakdownScore: { fontSize: 13, fontWeight: 'bold' }
});
