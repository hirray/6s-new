import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHome({ onSelectCategory, checklistProgress = {}, onFinalSubmit }) {
  const { currentUser } = useContext(DataContext);
  
  const completedTasks = Object.keys(checklistProgress).length;
  const totalTasks = 6;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const userFirstName = currentUser?.name?.split(' ')[1] || currentUser?.name || 'Head';
  
  const zoneTitle = currentUser?.data ? `${currentUser.data.areasCovered} • Sub-Zone ${currentUser.data.subZone}` : 'Ground Floor • Sub-Zone 1';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header Info */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerLeftLine} />
          <View>
            <Text style={styles.systemTitle}>6S Audit System</Text>
            <Text style={styles.zoneTitle}>{zoneTitle}</Text>
          </View>
        </View>
      </View>

      {/* Daily Inspection Card */}
      <ImageBackground 
        source={require('../../assets/building.jpeg')} 
        style={styles.cardImageBackground}
        imageStyle={{ borderRadius: 24 }}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>Daily Inspection</Text>
          </View>
          
          <Text style={styles.welcomeBackText}>Welcome Back!</Text>
          <Text style={styles.readyText}>Ready to conduct your daily 6S inspection?</Text>
          
          <View style={styles.progressBox}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressValue}>{completedTasks}/{totalTasks} Complete</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressPercentageText}>{progressPercentage}%</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Audit Categories Title */}
      <View style={styles.categoriesHeader}>
        <View>
          <Text style={styles.categoriesTitle}>Audit Categories</Text>
          <Text style={styles.categoriesSubtitle}>Select a category to begin</Text>
        </View>
        <View style={styles.sixSBadge}>
          <Text style={styles.sixSBadgeText}>6S</Text>
        </View>
      </View>

      {/* 6S Grid */}
      <View style={styles.gridContainer}>
        {/* Sort */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Sort')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Sort'] !== undefined ? '#1A8C4E' : '#1C75FF' }]}>
             <Ionicons name={checklistProgress['Sort'] !== undefined ? "checkmark-circle" : "layers"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Sort</Text>
          <Text style={styles.gridItemSubtitle}>Seiri</Text>
          <Text style={styles.gridItemDesc}>Remove unnecessary items</Text>
        </TouchableOpacity>

        {/* Set In Order */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Set In Order')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Set In Order'] !== undefined ? '#1A8C4E' : '#A21CFF' }]}>
             <Ionicons name={checklistProgress['Set In Order'] !== undefined ? "checkmark-circle" : "grid"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Set In Order</Text>
          <Text style={styles.gridItemSubtitle}>Seiton</Text>
          <Text style={styles.gridItemDesc}>Organize workspace efficiently</Text>
        </TouchableOpacity>

        {/* Shine */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Shine')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Shine'] !== undefined ? '#1A8C4E' : '#00C3FF' }]}>
             <Ionicons name={checklistProgress['Shine'] !== undefined ? "checkmark-circle" : "sparkles"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Shine</Text>
          <Text style={styles.gridItemSubtitle}>Seiso</Text>
          <Text style={styles.gridItemDesc}>Clean & maintain workspace</Text>
        </TouchableOpacity>

        {/* Standardize */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Standardize')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Standardize'] !== undefined ? '#1A8C4E' : '#FF1C75' }]}>
             <Ionicons name={checklistProgress['Standardize'] !== undefined ? "checkmark-circle" : "document-text"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Standardize</Text>
          <Text style={styles.gridItemSubtitle}>Seiketsu</Text>
          <Text style={styles.gridItemDesc}>Create uniform procedures</Text>
        </TouchableOpacity>

        {/* Sustain */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Sustain')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Sustain'] !== undefined ? '#1A8C4E' : '#00B94A' }]}>
             <Ionicons name={checklistProgress['Sustain'] !== undefined ? "checkmark-circle" : "bar-chart"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Sustain</Text>
          <Text style={styles.gridItemSubtitle}>Shitsuke</Text>
          <Text style={styles.gridItemDesc}>Maintain discipline</Text>
        </TouchableOpacity>

        {/* Safety */}
        <TouchableOpacity style={styles.gridItem} onPress={() => onSelectCategory && onSelectCategory('Safety')}>
          <View style={[styles.iconContainer, { backgroundColor: checklistProgress['Safety'] !== undefined ? '#1A8C4E' : '#FF8800' }]}>
             <Ionicons name={checklistProgress['Safety'] !== undefined ? "checkmark-circle" : "shield-checkmark"} size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.gridItemTitle}>Safety</Text>
          <Text style={styles.gridItemSubtitle}>Safety</Text>
          <Text style={styles.gridItemDesc}>Ensure workspace safety</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      {completedTasks > 0 && (
        <TouchableOpacity style={styles.finalSubmitButton} onPress={onFinalSubmit}>
          <Text style={styles.finalSubmitButtonText}>Submit Audit ({completedTasks}/6)</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8', // Slightly off-white background from the design
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeftLine: {
    width: 4,
    height: 40,
    backgroundColor: '#8C1B2F',
    borderRadius: 2,
    marginRight: 10,
  },
  systemTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8C1B2F',
  },
  zoneTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cardImageBackground: {
    width: '100%',
    minHeight: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#8C1B2F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(140, 27, 47, 0.75)', // Deep red overlay
    padding: 24,
    borderRadius: 24,
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  cardBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeBackText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  readyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    paddingRight: 20,
  },
  progressBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressPercentageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 6,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoriesSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sixSBadge: {
    backgroundColor: '#8C1B2F',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sixSBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  gridItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  gridItemDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  finalSubmitButton: {
    backgroundColor: '#8C1B2F',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#8C1B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  finalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
