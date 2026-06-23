import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Pressable, ImageBackground, Animated } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { DataContext } from '../context/DataContext';

const STATUS_COLORS = { Green: '#1A8C4E', Yellow: '#B07D10', Red: '#C0182A' };

const ZPOS = [
  {id:1, left:'62.9%', top:'11.9%'},
  {id:2, left:'51.5%', top:'25.0%'},
  {id:3, left:'60.1%', top:'41.5%'},
  {id:4, left:'32.8%', top:'32.9%'},
  {id:5, left:'30.2%', top:'45.3%'},
  {id:6, left:'42.1%', top:'11.9%'},
  {id:7, left:'11.9%', top:'26.6%'},
  {id:8, left:'70.8%', top:'69.2%'}
];
const PulsingDot = ({ pos, color, isActive, onPress, text }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        position: 'absolute',
        top: pos.top, 
        left: pos.left, 
        zIndex: isActive ? 10 : 1,
      }}
    >
      <Animated.View 
        style={[
          styles.mapZoneDot, 
          { 
            backgroundColor: color,
            shadowColor: color,
            borderColor: isActive ? '#FFFFFF' : 'transparent',
            borderWidth: isActive ? 3 : 0,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={styles.mapZoneDotText}>{text !== undefined ? text : pos.id}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function MasterDashboard() {
  const { zones, db, SZH } = useContext(DataContext);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const totalZones = zones.length;
  const greenZones = zones.filter(z => z.status === 'Green').length;
  const yellowZones = zones.filter(z => z.status === 'Yellow').length;
  const redZones = zones.filter(z => z.status === 'Red').length;

  const handleZonePress = (id) => {
    setActiveZoneId(id);
    setModalVisible(true);
  };

  const activeZone = zones.find(z => z.id === activeZoneId?.toString());
  
  // Dynamically compute details for the active zone
  let activeDetails = null;
  if (activeZone) {
    const extractZoneNumber = (zoneStr) => {
      if (!zoneStr) return null;
      const match = zoneStr.match(/Zone\s*0?(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    };
    const zoneComplaints = db.complaints.filter(c => extractZoneNumber(c.zone) === parseInt(activeZone.id, 10) && c.status === 'Pending');
    
    // Find submissions for SZHs in this zone
    const zoneSZHs = SZH.filter(s => s.zone === parseInt(activeZone.id));
    const recentSubs = zoneSZHs.map(sz => {
      const sub = db.checklistSubmissions
        .filter(s => s.subZonalHeadId === sz.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
      return sub;
    }).filter(Boolean);

    const checklistRatio = `${recentSubs.length}/${zoneSZHs.length}`;
    const lastSubTime = recentSubs.length > 0 ? recentSubs[0].date : 'None yet';

    activeDetails = {
      checklist: checklistRatio,
      lastSub: lastSubTime,
      complaints: zoneComplaints.length,
      review: "Pending Review",
      score: activeZone.score
    };
  }

  return (
    <ScrollView style={styles.container}>
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
        
        {/* Student Connected Metrics */}
        <View style={[styles.card, { backgroundColor: '#3B82F6' }]}>
          <Text style={styles.number}>{db.complaints ? db.complaints.length : 0}</Text>
          <Text style={styles.label}>Student Reports</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#F59E0B' }]}>
          <Text style={styles.number}>{db.complaints ? db.complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length : 0}</Text>
          <Text style={styles.label}>Pending Issues</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Live Campus Zone Map — Annexure I</Text>
        <Text style={styles.mapSubtitle}>Pan to explore. Tap '+' or '-' to zoom in and out.</Text>
        
        <View style={styles.interactiveMapArea}>
          <ReactNativeZoomableView
            maxZoom={3}
            minZoom={1}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            style={styles.zoomableView}
          >
            <ImageBackground 
              source={require('../assets/campus-map.png')} 
              style={{ width: '100%', height: '100%' }}
            >
            {ZPOS.map((pos, idx) => {
              const matchingZone = zones.find(z => z.id === pos.id.toString());
              const status = matchingZone ? matchingZone.status : 'Green';
              const color = STATUS_COLORS[status];
              const isActive = activeZoneId === pos.id;
              return (
                <PulsingDot 
                  key={pos.id}
                  pos={pos}
                  color={color}
                  isActive={isActive}
                  onPress={() => handleZonePress(pos.id)}
                  text={matchingZone ? matchingZone.score : pos.id}
                />
              )
            })}
            </ImageBackground>
          </ReactNativeZoomableView>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.green }]} />
            <Text style={styles.legendText}>On time / within 7-day review</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.yellow }]} />
            <Text style={styles.legendText}>1 day late / overdue review</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.red }]} />
            <Text style={styles.legendText}>2+ days late / severely overdue</Text>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackgroundPress} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            {activeZone && activeDetails && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalEyebrow}>Zone {activeZone.id} Preview</Text>
                  <Text style={styles.modalTitle}>{activeZone.name.split('– ')[1] || activeZone.name}</Text>
                  <Text style={styles.modalSubtitle}>Status: {activeZone.status}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[activeZone.status] }]}>
                    <Text style={styles.statusBadgeText}>{activeZone.status} Status ({activeDetails.score}%)</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarFill, { backgroundColor: STATUS_COLORS[activeZone.status], width: `${activeDetails.score}%` }]} />
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Checklist</Text>
                    <Text style={styles.detailValue}>{activeDetails.checklist}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Submission</Text>
                    <Text style={styles.detailValue}>{activeDetails.lastSub}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Open Concerns</Text>
                    <Text style={styles.detailValue}>{activeDetails.complaints}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Review</Text>
                    <Text style={styles.detailValue}>{activeDetails.review}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close Preview</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F2',
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  mapContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
    marginBottom: 30,
    shadowColor: '#1C0A0E',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 2,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8C1B2F',
    marginBottom: 6,
  },
  mapSubtitle: {
    fontSize: 13,
    color: '#7A4050',
    marginBottom: 20,
  },
  interactiveMapArea: {
    width: '100%',
    aspectRatio: 860 / 620,
    backgroundColor: '#F5EFE6',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
  },
  zoomableView: {
    flex: 1,
  },
  mapZoneDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
  mapZoneDotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  legendContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,27,47,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 13,
    color: '#4A2030',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 10, 14, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackgroundPress: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FBF7F2',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4933F',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C0A0E',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7A4050',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#EDE4D6',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(140,27,47,0.1)',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7A4050',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C0A0E',
  },
  closeButton: {
    backgroundColor: '#8C1B2F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
