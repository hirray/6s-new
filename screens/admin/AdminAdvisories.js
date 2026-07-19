import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUB_ZONAL_HEADS } from '../../data/subZonalHeads';


export default function AdminAdvisories({ onNavigate }) {
  const { zones, staticData, SZH, publishAdvisory } = useContext(DataContext);
  const insets = useSafeAreaInsets();
  
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
    const uniqueAreas = subHeads.map(s => {
      const area = s.areasCovered || s.floor || s.subZone || 'Unknown Area';
      return `${area} - ${s.name}`; // Show sub-zonal-head name
    });
    return ['All Sub-Zones', ...new Set(uniqueAreas)];
  };
  
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSubZone, setSelectedSubZone] = useState('');
  const [description, setDescription] = useState('');

  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showSubZoneDropdown, setShowSubZoneDropdown] = useState(false);

  // Manage Heads State
  const [activeTab, setActiveTab] = useState('broadcast');
  const [headRole, setHeadRole] = useState('zonal');
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [headZone, setHeadZone] = useState('');
  const [headSubZone, setHeadSubZone] = useState('');
  
  const [showZonalHeadsList, setShowZonalHeadsList] = useState(false);
  const [showSubZonalHeadsList, setShowSubZonalHeadsList] = useState(false);
  const [showAddHeadZoneDropdown, setShowAddHeadZoneDropdown] = useState(false);
  const [subZonalFilterZone, setSubZonalFilterZone] = useState('All Zones');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

  const handlePublish = async () => {
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
    
    try {
      await publishAdvisory(selectedZone, selectedSubZone || 'All Sub-Zones', description);
      Alert.alert('Success', `Advisory successfully published to ${selectedZone === 'All Zones' ? 'All Zones' : `${selectedSubZone} in ${selectedZone}`}.`);
      setSelectedZone('');
      setSelectedSubZone('');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to publish advisory. Please try again.');
    }
  };

  const handleAddHead = async () => {
    if (!headName || !headEmail || !headZone) {
      Alert.alert('Error', 'Please fill out Name, Email, and Zone.');
      return;
    }
    if (headRole === 'subzonal' && !headSubZone) {
      Alert.alert('Error', 'Please provide a Sub-Zone for Sub-Zonal Heads.');
      return;
    }
    
    const payload = headRole === 'zonal' 
      ? { name: headName, email: headEmail, zone: headZone }
      : { name: headName, email: headEmail, zone: headZone, subZone: headSubZone, areasCovered: headSubZone };
      
    const res = await addHead(headRole, payload);
    if (res.success) {
      Alert.alert('Success', 'Head added successfully!');
      setHeadName('');
      setHeadEmail('');
      setHeadZone('');
      setHeadSubZone('');
    } else {
      Alert.alert('Error', 'Failed to add head.');
    }
  };

  const handleDeleteHead = (type, id) => {
    Alert.alert('Confirm', 'Are you sure you want to remove this head?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeHead(type, id) }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8', paddingTop: insets.top }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('Home')} style={{marginRight: 10}}>
            <Ionicons name="arrow-back" size={24} color="#8C1B2F" />
          </TouchableOpacity>
          <Text style={styles.title}>Publish Advisory</Text>
        </View>
        <Text style={styles.subtitle}>Broadcast announcements or manage heads</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'broadcast' && styles.tabBtnActive]} onPress={() => setActiveTab('broadcast')}>
          <Text style={[styles.tabText, activeTab === 'broadcast' && styles.tabTextActive]}>Broadcast</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'manage' && styles.tabBtnActive]} onPress={() => setActiveTab('manage')}>
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>Manage Heads</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'broadcast' ? (
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
      ) : (
        <View>
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Add New Head</Text>
            
            <View style={[styles.tabContainer, { marginBottom: 15 }]}>
              <TouchableOpacity style={[styles.tabBtn, headRole === 'zonal' && styles.tabBtnActive]} onPress={() => setHeadRole('zonal')}>
                <Text style={[styles.tabText, headRole === 'zonal' && styles.tabTextActive]}>Zonal Head</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, headRole === 'subzonal' && styles.tabBtnActive]} onPress={() => setHeadRole('subzonal')}>
                <Text style={[styles.tabText, headRole === 'subzonal' && styles.tabTextActive]}>Sub-Zonal Head</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.inputField} placeholder="Full Name" value={headName} onChangeText={setHeadName} />
            <TextInput style={styles.inputField} placeholder="Email Address" keyboardType="email-address" value={headEmail} onChangeText={setHeadEmail} autoCapitalize="none" />
            
            <TouchableOpacity style={[styles.dropdownBtn, {marginBottom: 15}]} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowAddHeadZoneDropdown(!showAddHeadZoneDropdown); }}>
              <Text style={headZone ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                {headZone || 'Select Zone...'}
              </Text>
              <Ionicons name={showAddHeadZoneDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showAddHeadZoneDropdown && (
              <ScrollView style={[styles.dropdownList, {marginBottom: 15, marginTop: -10}]} nestedScrollEnabled={true}>
                {dynamicZones.filter(z => z !== 'All Zones').map((z, idx) => (
                  <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => { setHeadZone(z); setShowAddHeadZoneDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{z}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            {headRole === 'subzonal' && (
              <TextInput style={styles.inputField} placeholder="Sub-Zone / Floor (e.g., Floor 1)" value={headSubZone} onChangeText={setHeadSubZone} />
            )}

            <TouchableOpacity style={styles.publishBtn} onPress={handleAddHead}>
              <Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.publishBtnText}>Add Head</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowZonalHeadsList(!showZonalHeadsList); }}>
              <Text style={[styles.cardTitle, {marginBottom: 0}]}>Current Zonal Heads</Text>
              <Ionicons name={showZonalHeadsList ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showZonalHeadsList && (
              <View style={{marginTop: 15}}>
                {staticData?.zonalHeads?.map(zh => (
                  <View key={zh._id || Math.random()} style={styles.headRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.headName}>{zh.name}</Text>
                      <Text style={styles.headDetail}>{zh.zone} • {zh.email}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteHead('zonal', zh._id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {(!staticData?.zonalHeads || staticData.zonalHeads.length === 0) && <Text style={styles.noData}>No Zonal Heads found.</Text>}
              </View>
            )}
          </View>

          <View style={styles.formCard}>
            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowSubZonalHeadsList(!showSubZonalHeadsList); }}>
              <Text style={[styles.cardTitle, {marginBottom: 0}]}>Current Sub-Zonal Heads</Text>
              <Ionicons name={showSubZonalHeadsList ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showSubZonalHeadsList && (
              <View style={{marginTop: 15}}>
                
                {/* Filter Dropdown */}
                <TouchableOpacity style={[styles.dropdownBtn, {marginBottom: 10, padding: 10}]} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowFilterDropdown(!showFilterDropdown); }}>
                  <Text style={styles.dropdownTextSelected}>Filter: {subZonalFilterZone}</Text>
                  <Ionicons name={showFilterDropdown ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
                </TouchableOpacity>
                {showFilterDropdown && (
                  <ScrollView style={[styles.dropdownList, {marginBottom: 15, marginTop: -5}]} nestedScrollEnabled={true}>
                    {dynamicZones.map((z, idx) => (
                      <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => { setSubZonalFilterZone(z); setShowFilterDropdown(false); }}>
                        <Text style={styles.dropdownItemText}>{z}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {staticData?.subZonalHeads?.filter(szh => {
                  if (subZonalFilterZone === 'All Zones') return true;
                  const zIdMatch = subZonalFilterZone.match(/Zone\s*0?(\d+)/i);
                  const selectedZoneNum = zIdMatch ? zIdMatch[1] : null;
                  const szhZoneNum = szh.zone ? String(szh.zone).replace(/\D/g, '') : null;
                  return selectedZoneNum === szhZoneNum;
                }).map(szh => (
                  <View key={szh._id || Math.random()} style={styles.headRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.headName}>{szh.name}</Text>
                      <Text style={styles.headDetail}>{szh.zone} - {szh.subZone || szh.areasCovered} • {szh.email}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteHead('subzonal', szh._id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {(!staticData?.subZonalHeads || staticData.subZonalHeads.length === 0) && <Text style={styles.noData}>No Sub-Zonal Heads found.</Text>}
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  header: { marginBottom: 24, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#8C1B2F' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
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
  publishBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#8C1B2F' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  inputField: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, fontSize: 15, color: '#111827', marginBottom: 15 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  headDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  noData: { color: '#9CA3AF', fontStyle: 'italic', marginTop: 10 }
});
