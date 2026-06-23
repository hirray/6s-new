import React, { useState } from 'react';
import { View } from 'react-native';
import SubZonalHome from './SubZonalHome';
import SubZonalChecklist from './SubZonalChecklist';

export default function SubZonalHomeStack() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedCategory ? (
        <SubZonalChecklist category={selectedCategory} onBack={handleBack} />
      ) : (
        <SubZonalHome onSelectCategory={handleCategorySelect} />
      )}
    </View>
  );
}
