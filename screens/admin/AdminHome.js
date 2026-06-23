import React, { useState, useContext, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Animated, Easing, Dimensions } from 'react-native';
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
  const greenZones = liveZones.filter(z => z.status === 'Green').length;
  const yellowZones = liveZones.filter(z => z.status === 'Yellow').length;
  const redZones = liveZones.filter(z => z.status === 'Red').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.summaryContainer}>
        <View style={styles.grid}>
          <View style={[styles.card, styles.maroonCard]}>
            <Text style={styles.number}>{totalZones}</Text>
            <Text style={styles.label}>Total Zones</Text>
          </View>
          <View style={[styles.card, styles.greenCard]}>
            <Text style={styles.number}>{greenZones}</Text>
            <Text style={styles.label}>Green Zones</Text>
          </View>
          <View style={[styles.card, styles.yellowCard]}>
            <Text style={styles.number}>{yellowZones}</Text>
            <Text style={styles.label}>Yellow Zones</Text>
          </View>
          <View style={[styles.card, styles.redCard]}>
            <Text style={styles.number}>{redZones}</Text>
            <Text style={styles.label}>Red Zones</Text>
          </View>
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
        <Modal transparent visible animationType="fade">
          <TouchableWithoutFeedback onPress={() => setSelectedZone(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.popupCard}>
                  <View style={styles.popupHeaderRow}>
                    <View style={[styles.popupIconCircle, { backgroundColor: getMarkerColor(selectedZone.status) }]}>
                      <Text style={styles.popupIconText}>{selectedZone.id}</Text>
                    </View>
                    <View style={styles.popupTitleBox}>
                      <Text style={styles.popupTitle}>{selectedZone.name}</Text>
                      <Text style={styles.popupManager}>{selectedZone.manager}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedZone(null)}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Overall Status</Text>
                    <Text style={[styles.popupValue, { color: getMarkerColor(selectedZone.status) }]}>
                      {selectedZone.status}
                    </Text>
                  </View>
                  
                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Checklist</Text>
                    <Text style={styles.popupValue}>{selectedZone.checklistRatio} tasks done</Text>
                  </View>

                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Last Submission</Text>
                    <Text style={styles.popupValue}>{selectedZone.lastSub}</Text>
                  </View>

                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Open Concerns</Text>
                    <Text style={styles.popupValue}>{selectedZone.openConcerns} concerns</Text>
                  </View>

                  <View style={styles.popupScoreBox}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.popupLabel}>Compliance Score:</Text>
                      <Text style={styles.scoreText}>{selectedZone.score}%</Text>
                    </View>
                    <View style={styles.scoreBarBg}>
                      <View style={[styles.scoreBarFill, { width: `${selectedZone.score}%`, backgroundColor: getMarkerColor(selectedZone.status) }]} />
                    </View>
                  </View>

                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  summaryContainer: { padding: 16, paddingTop: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C0A0E',
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 3,
  },
  maroonCard: { backgroundColor: '#8C1B2F' },
  greenCard: { backgroundColor: '#1A8C4E' },
  yellowCard: { backgroundColor: '#B07D10' },
  redCard: { backgroundColor: '#C0182A' },
  number: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  popupCard: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  popupHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  popupIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  popupIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  popupTitleBox: { flex: 1 },
  popupTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  popupManager: { fontSize: 12, color: '#6B7280' },
  popupRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  popupLabel: { fontSize: 13, color: '#6B7280' },
  popupValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  popupScoreBox: { marginTop: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  scoreBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  scoreBarFill: { height: 6, borderRadius: 3 }
});
