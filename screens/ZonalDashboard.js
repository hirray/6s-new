import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';

import ZonalSubZoneLogs from './zonal/ZonalSubZoneLogs';
import ZonalConcerns from './zonal/ZonalConcerns';
import ZonalAnalytics from './zonal/ZonalAnalytics';
import ZonalProfile from './zonal/ZonalProfile';
import { SUB_ZONAL_HEADS } from '../data/subZonalHeads';

export default function ZonalDashboard({ navigation }) {
  const { currentUser, db, SZH } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState('Home');

  const zoneName = currentUser?.data?.area || currentUser?.data?.zone || 'Zone';
  
  // Get unique subzones from the main data source for this zone
  const subZonesInZone = SUB_ZONAL_HEADS.filter(h => h.zone === currentUser?.data?.zone);
  const uniqueAreasMap = {};
  subZonesInZone.forEach(h => {
    if(!uniqueAreasMap[h.areasCovered]) {
      uniqueAreasMap[h.areasCovered] = h;
    }
  });
  const uniqueAreas = Object.values(uniqueAreasMap);

  const renderHomeTab = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        <TouchableOpacity style={styles.profilePlaceholder}>
           <Ionicons name="person-circle" size={44} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{zoneName}</Text>
        <Text style={styles.subTitle}>Zonal Head Dashboard</Text>
      </View>

      {/* Hero Performance Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroContentRow}>
          {/* Mock Circular Progress */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleOuter}>
              <View style={styles.progressCircleInner}>
                <Text style={styles.progressScoreText}>91%</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroTextContent}>
            <Text style={styles.heroTitle}>Excellent Performance</Text>
            <Text style={styles.heroSubtitle}>Keep up the good work</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroLastUpdatedLabel}>Last Updated</Text>
            <Text style={styles.heroLastUpdatedTime}>18 Jun 2026 • 09:30 AM</Text>
          </View>
        </View>
      </View>

      {/* Sub-Zone Performance */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Sub-Zone Performance</Text>
      </View>
      <View style={styles.listCardContainer}>
        {uniqueAreas.length === 0 ? (
          <Text style={{ color: '#64748B' }}>No Sub-Zones found.</Text>
        ) : (
          uniqueAreas.map((item, index) => {
            // Fetch real score from db if available, else mock
            const latestLog = db.checklistSubmissions
              .filter(sub => sub.subZonalHeadId === item.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const score = latestLog ? latestLog.score : Math.floor(Math.random() * 40) + 60; // Mock score if none
            const pending = db.complaints.filter(c => c.zone === item.zone && c.subZone === item.areasCovered && c.status !== 'Resolved').length;
            
            const color = score >= 85 ? '#10B981' : score >= 60 ? '#F97316' : '#EF4444';

            return (
              <View key={index} style={styles.performanceListItem}>
                <Text style={styles.performanceFloorName} numberOfLines={2}>{item.areasCovered}</Text>
                <View style={styles.performanceBarBg}>
                  <View style={[styles.performanceBarFill, { width: `${score}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.performanceScoreText}>{score}%</Text>
                <Text style={styles.performancePendingLabel}>Pending</Text>
                <Text style={styles.performancePendingValue}>{pending}</Text>
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
        {/* Render Tab Content */}
        {activeTab === 'Home' && renderHomeTab()}
        {activeTab === 'Sub Zone' && <ZonalSubZoneLogs onBackToHome={() => setActiveTab('Home')} />}
        {activeTab === 'Inspection' && <ZonalConcerns onBackToHome={() => setActiveTab('Home')} />}
        {activeTab === 'Analytics' && <ZonalAnalytics onBackToHome={() => setActiveTab('Home')} />}
        {activeTab === 'Profile' && <ZonalProfile />}

        {/* Custom Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNavBackground}>
            {[
              { key: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
              { key: 'Sub Zone', icon: 'business-outline', activeIcon: 'business', label: 'Sub Zone' },
              { key: 'Inspection', icon: 'shield-checkmark-outline', activeIcon: 'shield-checkmark', label: 'Inspection' },
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
