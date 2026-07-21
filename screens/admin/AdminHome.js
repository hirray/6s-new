import React, { useState, useContext, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Animated, Easing, Dimensions, TextInput, LayoutAnimation, Platform, UIManager, Image, RefreshControl } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { ZONAL_HEADS } from '../../data/zonalHeads';

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


const FloatingZonePopup = ({ selectedZone, onClose }) => {
  if (!selectedZone) return null;
  const statusColor = getMarkerColor(selectedZone.status);
  
  return (
    <View style={styles.floatingPopup}>
      <TouchableOpacity style={{position: 'absolute', top: 12, right: 12, zIndex: 10}} onPress={onClose}>
        <Ionicons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>
      <View style={styles.popupHeaderRow}>
        <View style={[styles.popupZoneIdCircle, { backgroundColor: statusColor }]}>
          <Text style={styles.popupZoneIdText}>{selectedZone.id}</Text>
        </View>
        <View style={styles.popupHeaderTexts}>
          <Text style={styles.popupZoneName}>{selectedZone.name.replace(/Zone \d+ [–-]\s*/, '')}</Text>
          <Text style={styles.popupManager}>{selectedZone.manager}</Text>
        </View>
      </View>
      <View style={styles.popupDivider} />
      
      <View style={styles.popupStatRow}>
        <Text style={styles.popupStatLabel}>Overall Status</Text>
        <Text style={[styles.popupStatValue, { color: statusColor }]}>{selectedZone.status} — On Time</Text>
      </View>
      <View style={styles.popupStatRow}>
        <Text style={styles.popupStatLabel}>Checklist</Text>
        <Text style={styles.popupStatValue}>{selectedZone.checklistRatio || '0'} tasks done</Text>
      </View>
      <View style={styles.popupStatRow}>
        <Text style={styles.popupStatLabel}>Last Submission</Text>
        <Text style={styles.popupStatValue}>
          {selectedZone.lastSub === 'None yet' ? 'None' : 
            (typeof selectedZone.lastSub === 'string' && selectedZone.lastSub.includes(':') ? 
             selectedZone.lastSub : new Date(selectedZone.lastSub).toLocaleDateString())}
        </Text>
      </View>
      <View style={styles.popupStatRow}>
        <Text style={styles.popupStatLabel}>Open Concerns</Text>
        <Text style={styles.popupStatValue}>{selectedZone.openConcerns} complaint{selectedZone.openConcerns !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.popupStatRow}>
        <Text style={styles.popupStatLabel}>Zonal Review</Text>
        <Text style={styles.popupStatValue}>Pending</Text>
      </View>
      
      <Text style={styles.popupScoreLabel}>Compliance Score: {selectedZone.score}%</Text>
      <View style={styles.popupScoreBarBg}>
        <View style={[styles.popupScoreBarFill, { width: `${selectedZone.score}%`, backgroundColor: statusColor }]} />
      </View>
    </View>
  );
};

export default function AdminHome({ onNavigate }) {
  const { zones, db, staticData, fetchFromAPI } = useContext(DataContext);
  const [selectedZone, setSelectedZone] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    if(fetchFromAPI) await fetchFromAPI();
    setRefreshing(false);
  };

  // Compute live zone data from MongoDB db
  const liveZones = zones.map(z => {
    const headsSource = staticData?.zonalHeads?.length > 0 ? staticData.zonalHeads : ZONAL_HEADS;
    const head = headsSource.find(h => {
      const headZoneNum = h.zone ? String(h.zone).replace(/\D/g, '') : String(h.zoneNumber);
      return headZoneNum === String(z.id);
    });
    const manager = head ? head.name : 'Unassigned';

    const extractZoneNumber = (zoneStr) => {
      if (!zoneStr) return null;
      const match = zoneStr.match(/Zone\s*0?(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    };
    
    const zoneComplaints = db.complaints.filter(c => extractZoneNumber(c.zone) === parseInt(z.id) && c.status === 'Pending');
    
    const zoneSZHs = staticData?.subZonalHeads?.filter(s => {
      const sZoneNum = s.zone ? String(s.zone).replace(/\D/g, '') : null;
      return sZoneNum === String(z.id);
    }) || [];
    const recentSubs = zoneSZHs.map(sz => {
      return db.checklistSubmissions
        .filter(s => s.subZonalHeadId === sz.id || s.subZonalHeadId === sz._id || s.subZonalHeadId === sz.email)
        .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    }).filter(Boolean);

    let avgScore = 100;
    if (recentSubs.length > 0) {
      avgScore = recentSubs.reduce((acc, sub) => acc + sub.score, 0) / recentSubs.length;
    } else if (zoneSZHs.length > 0) {
      avgScore = 0; // Nobody submitted
    }

    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;
    
    zoneSZHs.forEach(sz => {
      const sub = db.checklistSubmissions
        .filter(s => s.subZonalHeadId === sz.id || s.subZonalHeadId === sz._id || s.subZonalHeadId === sz.email)
        .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
      
      const subScore = sub ? sub.score : 0;
      if (subScore >= 85) greenCount++;
      else if (subScore >= 60) yellowCount++;
      else redCount++;
    });

    let score = Math.max(0, Math.round(avgScore - (zoneComplaints.length * 5)));
    let status = 'Green';
    if (score < 60) status = 'Red';
    else if (score < 85) status = 'Yellow';

    return {
      ...z,
      manager,
      status,
      score,
      greenCount,
      yellowCount,
      redCount,
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
    <View style={{flex: 1, backgroundColor: '#FAF9F6', paddingTop: insets.top}}>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 100 }}
      onScrollBeginDrag={() => {
        if (selectedZone) setSelectedZone(null);
      }}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C1B2F" />}
    >
      {/* Custom Maroon Header */}
      <View style={styles.maroonHeader}>
        <Text style={styles.maroonHeaderTitle}>6S Admin</Text>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('Profile')}>
          <Ionicons name="person-circle" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Title and Illustration */}
      <View style={styles.titleSection}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.pageTitle}>Admin Dashboard</Text>
          <Text style={styles.pageSubtitle}>University Compliance Overview</Text>
        </View>
        <View style={styles.illustrationContainer}>
          <Image source={require('../../sixs_logo.png')} style={[styles.illustration, { borderRadius: 40 }]} resizeMode="contain" />
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
              source={require('../../assets/live-map.jpg')}
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
          
          {selectedZone && (
            <FloatingZonePopup selectedZone={selectedZone} onClose={() => setSelectedZone(null)} />
          )}
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
      
      {/* Zone-wise Details Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Zone-wise Details</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thText, {flex: 3.5}]}>Zone</Text>
          <Text style={[styles.thText, {flex: 3.5}]}>Zonal Head</Text>
          <Text style={[styles.thText, {flex: 2, textAlign: 'right'}]}>Compliance</Text>
        </View>

        {liveZones.map((z, i) => (
          <View key={z.id} style={[styles.tableRow, i === liveZones.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={{flex: 3.5, paddingRight: 12, justifyContent: 'center'}}>
              <Text style={styles.tdZoneName}>{z.name.split(/[-–]/)[1]?.trim() || z.name}</Text>
              <Text style={styles.tdZoneId}>Zone {z.id}</Text>
            </View>
            <View style={{flex: 3.5, paddingRight: 10, justifyContent: 'center'}}>
              <Text style={styles.tdText}>{z.manager}</Text>
            </View>
            
            <View style={{flex: 2, justifyContent: 'center'}}>
              <Text style={[styles.tdScore, {textAlign: 'right', color: getMarkerColor(z.status)}]}>{z.score.toFixed(1)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  logo: { height: 50, width: 160 },
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  titleTextContainer: { flex: 1, paddingRight: 10, zIndex: 2 },
  illustrationContainer: { width: 100, height: 100, backgroundColor: '#FFFFFF', borderRadius: 50, justifyContent: 'center', alignItems: 'center', zIndex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  illustration: { width: 80, height: 80 },
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
  markerWrapper: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -22, marginTop: -22 }, // Center based on top/left
  markerRing: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(192, 24, 42, 0.8)', backgroundColor: 'rgba(192, 24, 42, 0.2)' },
  markerCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 3 },
  markerText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
  
  // Floating Popup Styles
  floatingPopup: { position: 'absolute', top: 8, right: 8, width: 240, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10, borderWidth: 1, borderColor: '#E5E7EB', zIndex: 100 },
  popupHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  popupZoneIdCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  popupZoneIdText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  popupHeaderTexts: { flex: 1, paddingRight: 20 },
  popupZoneName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  popupManager: { fontSize: 10, color: '#6B7280', marginTop: 1 },
  popupDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 6 },
  popupStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  popupStatLabel: { fontSize: 10, color: '#6B7280' },
  popupStatValue: { fontSize: 10, color: '#111827', fontWeight: '600' },
  popupScoreLabel: { fontSize: 10, color: '#6B7280', marginTop: 6, marginBottom: 4 },
  popupScoreBarBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  popupScoreBarFill: { height: '100%', borderRadius: 3 },
  
  // Table Styles
  tableCard: { backgroundColor: '#FFFFFF', margin: 16, marginTop: 0, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  tableTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  tableHeaderRow: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 10 },
  thText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  tdZoneName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  tdZoneId: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  tdText: { fontSize: 12, color: '#4B5563' },
  countCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tdScore: { fontSize: 13, fontWeight: 'bold', textAlign: 'right' },
  maroonHeader: {
    backgroundColor: '#8C1B2F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20
  },
  maroonHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
