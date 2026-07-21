export const APP_ZONES = [
  { id: '1', name: 'Zone 1 – Anviksha', color: '#1A8C4E', top: '25%', left: '75%', width: 90, height: 80, status: 'Green', score: 92 },
  { id: '2', name: 'Zone 2 – School of Technology', color: '#B07D10', top: '40%', left: '60%', width: 120, height: 100, status: 'Yellow', score: 76 },
  { id: '3', name: 'Zone 3 – Common Amenities', color: '#1A8C4E', top: '52%', left: '68%', width: 90, height: 90, status: 'Green', score: 88 },
  { id: '4', name: 'Zone 4 – Kasturba Bhavan', color: '#1A8C4E', top: '45%', left: '45%', width: 100, height: 70, status: 'Green', score: 94 },
  { id: '5', name: 'Zone 5 – Vikram Sarabhai Bhavan', color: '#1A8C4E', top: '55%', left: '42%', width: 110, height: 80, status: 'Green', score: 95 },
  { id: '6', name: 'Zone 6 – Swami Vivekananda Bhavan', color: '#C0182A', top: '25%', left: '52%', width: 100, height: 90, status: 'Red', score: 54 },
  { id: '7', name: 'Zone 7 – FirePlex', color: '#B07D10', top: '40%', left: '22%', width: 80, height: 60, status: 'Yellow', score: 72 },
  { id: '8', name: 'Zone 8 – School of Science / Management', color: '#1A8C4E', top: '72%', left: '75%', width: 100, height: 80, status: 'Green', score: 91 },
];

export const APP_SUBZONES = [
  { id: '101', zoneId: '1', subzone: 'Ground Floor', incharge: 'Dr. Sharma', status: 'Green' },
  { id: '102', zoneId: '1', subzone: 'First Floor', incharge: 'Prof. Mehta', status: 'Green' },
  { id: '201', zoneId: '2', subzone: 'Wing A', incharge: 'Warden Patel', status: 'Yellow' },
  { id: '202', zoneId: '2', subzone: 'Wing B', incharge: 'Warden Singh', status: 'Red' },
  { id: '301', zoneId: '3', subzone: 'Main Office', incharge: 'Mr. Gupta', status: 'Green' },
];

export const APP_METHODOLOGY = [
  { id: '1', title: '1S - Sort (Seiri)', score: 88, color: '#1A8C4E', bg: '#F9F9F9' },
  { id: '2', title: '2S - Set in order', score: 76, color: '#B07D10', bg: '#F9F9F9' },
  { id: '3', title: '3S - Shine (Seiso)', score: 92, color: '#1A8C4E', bg: '#F9F9F9' },
  { id: '4', title: '4S - Standardize', score: 71, color: '#B07D10', bg: '#F9F9F9' },
  { id: '5', title: '5S - Sustain', score: 85, color: '#1A8C4E', bg: '#F9F9F9' },
  { id: '6', title: '6S - Safety', score: 95, color: '#1A8C4E', bg: '#F9F9F9' },
];

export const APP_SZH = [
  { id: "SZH_F1", name: "Mr. Rajesh Patel", floor: "Ground Floor / Block A", zone: 1 },
  { id: "SZH_F2", name: "Ms. Priya Sharma", floor: "First Floor / Block B", zone: 2 },
  { id: "SZH_F3", name: "Mr. Anil Verma", floor: "Second Floor / Block C", zone: 3 },
  { id: "SZH_F4", name: "Ms. Kavita Joshi", floor: "Ground Floor / Block D", zone: 4 },
  { id: "SZH_F5", name: "Mr. Suresh Mehta", floor: "First Floor / Block E", zone: 5 },
  { id: "SZH_F6", name: "Ms. Anita Singh", floor: "Second Floor / Block F", zone: 6 },
  { id: "SZH_F7", name: "Mr. Deepak Kumar", floor: "Ground Floor / FirePlex", zone: 7 },
  { id: "SZH_F8", name: "Ms. Ritu Gupta", floor: "First Floor / SoS", zone: 8 }
];

export const APP_CL_TASKS = [
  "1S - Sort: Are unneeded items removed from the area?",
  "2S - Set in Order: Is everything in its designated place?",
  "3S - Shine: Is the area clean and free of debris?",
  "4S - Standardize: Are standard procedures visible and followed?",
  "5S - Sustain: Are audits being conducted regularly?",
  "6S - Safety: Are all safety hazards mitigated?",
  "Signage: Are 6S promotional posters visible?",
  "Waste Management: Are dustbins cleared and segregated?"
];
