import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataContext } from '../../context/DataContext';
import { getChecklistForUser } from '../../utils/checklistMapper';

export default function SubZonalChecklist({ category, onBack, onSaveProgress }) {
  const { currentUser, staticData } = useContext(DataContext);
  const checklistData = getChecklistForUser(currentUser?.data, staticData?.checklists || []);
  const items = checklistData[category] || [];

  // Initialize state with all boxes checked by default
  const [checklistState, setChecklistState] = useState({});

  useEffect(() => {
    const initialState = {};
    items.forEach((item, index) => {
      initialState[index] = { checked: true, remarks: '' };
    });
    setChecklistState(initialState);
  }, [JSON.stringify(items)]);

  const toggleCheck = (index) => {
    setChecklistState(prev => ({
      ...prev,
      [index]: { ...prev[index], checked: !prev[index].checked }
    }));
  };

  const updateRemarks = (index, text) => {
    setChecklistState(prev => ({
      ...prev,
      [index]: { ...prev[index], remarks: text }
    }));
  };

  const handleSave = () => {
    const totalItems = items.length;
    let score = 0;
    if (totalItems > 0) {
      const checkedCount = Object.values(checklistState).filter(s => s.checked).length;
      score = Math.round((checkedCount / totalItems) * 100);
    }
    if (onSaveProgress) {
      onSaveProgress(category, score);
    } else {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{category} Checklist</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items found for this category.</Text>
        ) : (
          items.map((itemText, index) => {
            const state = checklistState[index] || { checked: true, remarks: '' };
            return (
              <View key={index} style={[styles.card, !state.checked && styles.cardUnchecked]}>
                <View style={styles.itemHeader}>
                  <TouchableOpacity onPress={() => toggleCheck(index)} style={styles.checkbox}>
                    <Ionicons 
                      name={state.checked ? "checkbox" : "square-outline"} 
                      size={28} 
                      color={state.checked ? "#1A8C4E" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                  <Text style={[styles.itemText, !state.checked && styles.itemTextUnchecked]}>{itemText}</Text>
                </View>
                
                {!state.checked && (
                  <TextInput
                    style={styles.remarksInput}
                    placeholder="Enter remarks (required if not checked)..."
                    value={state.remarks}
                    onChangeText={(text) => updateRemarks(index, text)}
                    multiline
                  />
                )}
              </View>
            );
          })
        )}

        {items.length > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.nonSaveBtn} onPress={onBack}>
              <Text style={styles.nonSaveBtnText}>Don't Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Save Progress</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingTop: 10 },
  backBtn: { marginRight: 16, padding: 8, backgroundColor: '#E5E7EB', borderRadius: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  cardUnchecked: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { marginRight: 12, marginTop: -2 },
  itemText: { flex: 1, fontSize: 15, color: '#111827', lineHeight: 22 },
  itemTextUnchecked: { color: '#991B1B' },
  remarksInput: { marginTop: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  nonSaveBtn: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#9CA3AF', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  nonSaveBtnText: { color: '#4B5563', fontSize: 16, fontWeight: 'bold' },
  submitBtn: { flex: 1, backgroundColor: '#8C1B2F', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
