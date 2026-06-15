import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ZONES = [
  { id: 1, area: "Anviksha", head: "Dr. Devjani Banerjee" },
  { id: 2, area: "School of Technology", head: "Dr. Sanjukta B. Goswami" },
  { id: 3, area: "Common Amenities", head: "Mr. Naren Acharya" },
  { id: 4, area: "Kasturba Bhavan", head: "Dr. Abha Kalaiya" },
  { id: 5, area: "Vikram Sarabhai Bhavan", head: "Dr. Mayank Sharma" },
  { id: 6, area: "Swami Vivekananda Bhavan", head: "Dr. Akhilesh Prajapati" },
  { id: 7, area: "FirePlex", head: "Mr. A. Srikrishnan" },
  { id: 8, area: "School of Science / Management", head: "Prof. Ranjitha Banerjee" }
];

const SZH = [
  { id: "SZH_F1", name: "Mr. Rajesh Patel", floor: "Ground Floor / Block A", zone: 1 },
  { id: "SZH_F2", name: "Ms. Priya Sharma", floor: "First Floor / Block B", zone: 2 },
  { id: "SZH_F3", name: "Mr. Anil Verma", floor: "Second Floor / Block C", zone: 3 },
  { id: "SZH_F4", name: "Ms. Kavita Joshi", floor: "Ground Floor / Block D", zone: 4 },
  { id: "SZH_F5", name: "Mr. Suresh Mehta", floor: "First Floor / Block E", zone: 5 },
  { id: "SZH_F6", name: "Ms. Anita Singh", floor: "Second Floor / Block F", zone: 6 },
  { id: "SZH_F7", name: "Mr. Deepak Kumar", floor: "Ground Floor / FirePlex", zone: 7 },
  { id: "SZH_F8", name: "Ms. Ritu Gupta", floor: "First Floor / SoS", zone: 8 }
];

const szSts = ['green', 'green', 'yellow', 'green', 'green', 'red', 'yellow', 'green'];

const getStatusColor = (status) => {
  const config = {
    green: '#28A745',
    yellow: '#DAA520',
    red: '#DC3545'
  };
  return config[status.toLowerCase()] || config.green;
};

export default function SubZonalComplianceTable() {
  const handleRowPress = (item) => {
    console.log("Sub-Zonal Data:", item);
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>ZONE</Text>
      </View>
      <View style={{ flex: 1.8, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>FLOOR / AREA</Text>
      </View>
      <View style={{ flex: 1.4, alignItems: 'flex-start' }}>
        <Text style={styles.headerText}>HEAD</Text>
      </View>
    </View>
  );

  const renderRow = ({ item, index }) => {
    return (
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => handleRowPress(item)}
        activeOpacity={0.6}
      >
        <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
          <View style={[styles.zoneBadge, { backgroundColor: getStatusColor(szSts[index]) }]}>
            <Text style={styles.zoneBadgeText}>Z{item.zone}</Text>
          </View>
        </View>
        <View style={{ flex: 1.8, alignItems: 'flex-start', paddingRight: 8 }}>
          <Text style={styles.cellFloor}>{item.floor}</Text>
        </View>
        <View style={{ flex: 1.4, alignItems: 'flex-start', paddingRight: 8 }}>
          <Text style={styles.cellHead}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardTitleContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={20} color="#8C1B2F" />
        </View>
        <Text style={styles.cardTitle}>Sub-Zonal Compliance (All Zones)</Text>
      </View>

      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={SZH}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8C1B2F',
    fontFamily: 'serif',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#1C0A0E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5EFE6', // Beige/cream color matching the image
    borderBottomWidth: 1,
    borderColor: '#EFE5D8',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8C1B2F', // Maroon text matching image
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5EFE6',
  },
  cellFloor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C0A0E', // Dark Charcoal
  },
  cellHead: {
    fontSize: 13,
    color: '#7A4050', // Brownish gray matching image
  },
  zoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  }
});
