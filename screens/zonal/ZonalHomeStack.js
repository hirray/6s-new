import React, { useState } from 'react';
import { View } from 'react-native';
import ZonalHome from './ZonalHome';
import ZonalSubZoneDetail from './ZonalSubZoneDetail';

export default function ZonalHomeStack() {
  const [selectedSubZone, setSelectedSubZone] = useState(null);

  const handleSubZoneSelect = (subZone) => {
    setSelectedSubZone(subZone);
  };

  const handleBack = () => {
    setSelectedSubZone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedSubZone ? (
        <ZonalSubZoneDetail subZone={selectedSubZone} onBack={handleBack} />
      ) : (
        <ZonalHome onSelectSubZone={handleSubZoneSelect} />
      )}
    </View>
  );
}
