import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import SubZonalComplianceTable from '../components/SubZonalComplianceTable';

export default function AllZones() {
  const { methodology } = useContext(DataContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>6S Methodology Compliance Analysis</Text>
        <Text style={styles.cardSubtitle}>Overall campus compliance broken down by the 6S pillars.</Text>
        
        <View style={styles.grid}>
          {methodology.map(item => (
            <View key={item.id} style={[styles.gridItem, {backgroundColor: item.bg}]}>
              <Text style={[styles.scoreText, {color: item.color}]}>{item.score}%</Text>
              <Text style={styles.titleText}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>
      <SubZonalComplianceTable />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F2', // GSFCU Cream
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,27,47,0.12)',
    marginBottom: 20,
    shadowColor: 'rgba(28,10,14,0.12)',
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8C1B2F', // Maroon
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7A4050', // Muted
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 11,
    color: '#1C0A0E', // Dark
    textAlign: 'center',
    fontWeight: '600',
  }
});
