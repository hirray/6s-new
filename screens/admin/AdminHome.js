import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hardcoded zone positions relative to a square/rectangle map container
// These would need to be tweaked depending on the actual image aspect ratio
const ZONE_MARKERS = [
  { id: 1, top: '20%', left: '70%', name: 'Zone 1', manager: 'Dr. Devjani Banerjee', status: 'Green', score: 100 },
  { id: 2, top: '40%', left: '55%', name: 'Zone 2', manager: 'Dr. Sanjukta B. Goswami', status: 'Green', score: 95 },
  { id: 3, top: '55%', left: '80%', name: 'Zone 3', manager: 'Mr. Naren Acharya', status: 'Green', score: 100 },
  { id: 4, top: '50%', left: '35%', name: 'Zone 4', manager: 'Dr. Abha Kalaiya', status: 'Yellow', score: 85 },
  { id: 5, top: '65%', left: '35%', name: 'Zone 5', manager: 'Dr. Mayank Sharma', status: 'Green', score: 90 },
  { id: 6, top: '30%', left: '45%', name: 'Zone 6', manager: 'Dr. Akhilesh Prajapati', status: 'Red', score: 65 },
  { id: 7, top: '45%', left: '15%', name: 'Zone 7', manager: 'Mr. A. Srikrishnan', status: 'Yellow', score: 75 },
  { id: 8, top: '85%', left: '70%', name: 'Zone 8', manager: 'Prof. Ranjitha Banerjee', status: 'Green', score: 98 },
];

export default function AdminHome() {
  const [selectedZone, setSelectedZone] = useState(null);

  const getMarkerColor = (status) => {
    switch(status) {
      case 'Green': return '#10B981'; // Emerald 500
      case 'Yellow': return '#F59E0B'; // Amber 500
      case 'Red': return '#EF4444'; // Red 500
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Campus Zone Map</Text>
        <Text style={styles.subtitle}>Tap a zone marker to view progress</Text>
      </View>

      <View style={styles.mapContainer}>
        {/* Placeholder background color if image isn't available */}
        <ImageBackground 
          source={{uri: 'https://via.placeholder.com/800x600/374151/FFFFFF?text=Campus+Map'}}
          style={styles.map}
          resizeMode="cover"
        >
          {/* Overlay to darken map slightly */}
          <View style={styles.mapOverlay} />

          {ZONE_MARKERS.map(marker => (
            <TouchableOpacity
              key={marker.id}
              style={[
                styles.markerWrapper, 
                { top: marker.top, left: marker.left }
              ]}
              onPress={() => setSelectedZone(marker)}
            >
              {/* Dashed ring effect like the mockup */}
              <View style={[styles.markerRing, { borderColor: getMarkerColor(marker.status) }]} />
              
              <View style={[styles.markerCircle, { backgroundColor: getMarkerColor(marker.status) }]}>
                <Text style={styles.markerText}>{marker.id}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ImageBackground>
      </View>

      {/* Summary Modal Popup */}
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
                      {selectedZone.status} — On Time
                    </Text>
                  </View>
                  
                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Checklist</Text>
                    <Text style={styles.popupValue}>8/8 tasks done</Text>
                  </View>

                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Last Submission</Text>
                    <Text style={styles.popupValue}>Today, 08:55 AM</Text>
                  </View>

                  <View style={styles.popupRow}>
                    <Text style={styles.popupLabel}>Open Concerns</Text>
                    <Text style={styles.popupValue}>0 concerns</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#8C1B2F' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  mapContainer: { flex: 1, backgroundColor: '#374151', margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#8C1B2F' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }, // Slightly darken to pop markers
  markerWrapper: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginLeft: -30, marginTop: -30 }, // Center based on top/left
  markerRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderStyle: 'dashed', opacity: 0.6 },
  markerCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 5 },
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
