import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { SUB_ZONAL_HEADS } from '../../data/subZonalHeads';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminAdvisories() {
  const { zones, staticData, SZH } = useContext(DataContext);
  
  const dynamicZones = ['All Zones', ...zones.map(z => z.name)];
  
  const getDynamicSubZones = (zoneName) => {
    if (!zoneName || zoneName === 'All Zones') return ['All Sub-Zones'];
    const zIdMatch = zoneName.match(/Zone\s*0?(\d+)/i);
    const zId = zIdMatch ? parseInt(zIdMatch[1], 10) : null;
    if (!zId) return ['All Sub-Zones', 'Floor 1', 'Floor 2'];
    
    const sourceData = (staticData?.subZonalHeads?.length > 0) ? staticData.subZonalHeads : SUB_ZONAL_HEADS;
    const subHeads = sourceData.filter(s => {
      const sZoneNum = s.zone ? String(s.zone).replace(/\D/g, '') : null;
      return sZoneNum === String(zId);
    });
    
    if (subHeads.length === 0) return ['All Sub-Zones'];
    const uniqueAreas = Array.from(new Set(subHeads.map(s => s.areasCovered || s.floor || s.subZone || 'Unknown Area')));
    return ['All Sub-Zones', ...uniqueAreas];
  };
  
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSubZone, setSelectedSubZone] = useState('');
  const [description, setDescription] = useState('');

  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showSubZoneDropdown, setShowSubZoneDropdown] = useState(false);

  const handleZoneSelect = (z) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedZone(z);
    setShowZoneDropdown(false);
    setSelectedSubZone(''); // Reset dependent dropdown
    
    if (z && z !== 'All Zones') {
      setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowSubZoneDropdown(true);
      }, 100);
    }
  };

  const handlePublish = () => {
    if (!selectedZone) {
      Alert.alert('Error', 'Please select a zone to publish to.');
      return;
    }
    if (selectedZone !== 'All Zones' && !selectedSubZone) {
      Alert.alert('Error', 'Please select a sub-zone.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the advisory.');
      return;
    }
    
    Alert.alert('Success', `Advisory successfully published to ${selectedZone === 'All Zones' ? 'All Zones' : `${selectedSubZone} in ${selectedZone}`}.`);
    setSelectedZone('');
    setSelectedSubZone('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Publish Advisory</Text>
        <Text style={styles.subtitle}>Broadcast announcements or new guidelines</Text>
      </View>

      <View style={styles.formCard}>
        
        {/* Zone Dropdown */}
        <Text style={styles.label}>Target Zone</Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowZoneDropdown(!showZoneDropdown); }}>
          <Text style={selectedZone ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
            {selectedZone || 'Select a Zone...'}
          </Text>
          <Ionicons name={showZoneDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
        </TouchableOpacity>
        
        {showZoneDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {dynamicZones.map((z, idx) => (
              <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => handleZoneSelect(z)}>
                <Text style={styles.dropdownItemText}>{z}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Sub-Zone Dropdown (Dependent) */}
        {selectedZone && selectedZone !== 'All Zones' && (
          <View style={styles.mt20}>
            <Text style={styles.label}>Target Sub-Zone</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowSubZoneDropdown(!showSubZoneDropdown); }}>
              <Text style={selectedSubZone ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                {selectedSubZone || 'Select a Sub-Zone...'}
              </Text>
              <Ionicons name={showSubZoneDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </TouchableOpacity>

            {showSubZoneDropdown && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                {getDynamicSubZones(selectedZone).map((sz, idx) => (
                  <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => { setSelectedSubZone(sz); setShowSubZoneDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Description Text Area */}
        <View style={styles.mt20}>
          <Text style={styles.label}>Advisory Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Type your announcement or guidelines here..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Publish Button */}
        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
          <Ionicons name="send" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.publishBtnText}>Publish Advisory</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  header: { marginBottom: 24, paddingTop: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#8C1B2F' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14 },
  dropdownTextPlaceholder: { color: '#9CA3AF', fontSize: 15 },
  dropdownTextSelected: { color: '#111827', fontSize: 15, fontWeight: '500' },
  dropdownList: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginTop: 4, maxHeight: 200 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 15, color: '#374151' },
  mt20: { marginTop: 20 },
  textArea: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, fontSize: 15, color: '#111827', minHeight: 120, textAlignVertical: 'top' },
  publishBtn: { flexDirection: 'row', backgroundColor: '#8C1B2F', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  publishBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
