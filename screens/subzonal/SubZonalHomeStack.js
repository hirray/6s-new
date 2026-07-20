import React, { useState, useContext, useEffect } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubZonalHome from './SubZonalHome';
import SubZonalChecklist from './SubZonalChecklist';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHomeStack() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState({});
  const [checklistRemarks, setChecklistRemarks] = useState({});
  const { submitChecklist, currentUser } = useContext(DataContext);

  // Load persisted progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser?.id) return;
      try {
        const savedProgress = await AsyncStorage.getItem(`@audit_${currentUser.id}`);
        const savedRemarks = await AsyncStorage.getItem(`@remarks_${currentUser.id}`);
        if (savedProgress) setChecklistProgress(JSON.parse(savedProgress));
        if (savedRemarks) setChecklistRemarks(JSON.parse(savedRemarks));
      } catch (e) {}
    };
    loadProgress();
  }, [currentUser?.id]);

  // Save progress whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!currentUser?.id) return;
      try {
        await AsyncStorage.setItem(`@audit_${currentUser.id}`, JSON.stringify(checklistProgress));
        await AsyncStorage.setItem(`@remarks_${currentUser.id}`, JSON.stringify(checklistRemarks));
      } catch (e) {}
    };
    saveProgress();
  }, [checklistProgress, checklistRemarks, currentUser?.id]);

  // Auto-submit interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() >= 18 && Object.keys(checklistProgress).length > 0) {
        handleFinalSubmit(true);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checklistProgress, checklistRemarks]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleSaveProgress = (categoryName, score, categoryRemarks = []) => {
    setChecklistProgress(prev => ({
      ...prev,
      [categoryName]: score
    }));
    
    setChecklistRemarks(prev => ({
      ...prev,
      [categoryName]: categoryRemarks
    }));

    setSelectedCategory(null);
  };

  const handleFinalSubmit = (isAutoSubmit = false) => {
    const categories = Object.keys(checklistProgress);
    if (categories.length === 0) return;

    const totalScore = categories.reduce((sum, key) => sum + checklistProgress[key], 0);
    const averageScore = Math.round(totalScore / categories.length);

    const allRemarks = [];
    Object.values(checklistRemarks).forEach(catRem => {
      if (Array.isArray(catRem)) {
        allRemarks.push(...catRem);
      }
    });

    submitChecklist(currentUser?.id, currentUser?.data?.zone, averageScore, allRemarks);
    
    setChecklistProgress({});
    setChecklistRemarks({});
    if (currentUser?.id) {
      AsyncStorage.removeItem(`@audit_${currentUser.id}`);
      AsyncStorage.removeItem(`@remarks_${currentUser.id}`);
    }

    if (isAutoSubmit !== true) {
      Alert.alert('Sent for Approval', 'Your 6S audit has been submitted to the Zonal Head. You will be able to submit again in 48 hours.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedCategory ? (
        <SubZonalChecklist 
          category={selectedCategory} 
          onBack={handleBack} 
          onSaveProgress={handleSaveProgress} 
        />
      ) : (
        <SubZonalHome 
          onSelectCategory={handleCategorySelect} 
          checklistProgress={checklistProgress}
          onFinalSubmit={handleFinalSubmit}
        />
      )}
    </View>
  );
}
