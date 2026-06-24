import React, { useState, useContext } from 'react';
import { View, Alert } from 'react-native';
import SubZonalHome from './SubZonalHome';
import SubZonalChecklist from './SubZonalChecklist';
import { DataContext } from '../../context/DataContext';

export default function SubZonalHomeStack() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState({});
  const { submitChecklist, currentUser } = useContext(DataContext);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleSaveProgress = (categoryName, score) => {
    setChecklistProgress(prev => ({
      ...prev,
      [categoryName]: score
    }));
    setSelectedCategory(null);
  };

  const handleFinalSubmit = () => {
    const categories = Object.keys(checklistProgress);
    if (categories.length === 0) return;

    const totalScore = categories.reduce((sum, key) => sum + checklistProgress[key], 0);
    const averageScore = Math.round(totalScore / categories.length);

    submitChecklist(currentUser?.id, currentUser?.data?.zone, averageScore);
    
    setChecklistProgress({});
    Alert.alert('Audit Submitted', 'Your 6S audit has been successfully submitted.');
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
