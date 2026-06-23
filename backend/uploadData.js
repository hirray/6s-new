require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Complaint = require('./models/Complaint');
const Advisory = require('./models/Advisory');
const Checklist = require('./models/Checklist');
const SubZonalHead = require('./models/SubZonalHead');
const ZonalHead = require('./models/ZonalHead');

const initialComplaints = [
  { studentId: 'stu1', zone: 'Zone 1 – Anviksha', subZone: 'Ground Floor', desc: 'Broken dustbin on 2nd floor.', status: 'Pending', date: 'Today', remarks: [], imageUri: null }
];

const initialAdvisories = [
  { targetZone: 'All Zones', targetSubZone: 'All Sub-Zones', text: 'Ensure all fire extinguishers are inspected by Friday.', date: 'Today, 10:00 AM', author: 'Core Admin', replies: [] }
];

// Helper to parse JS files with 'export const'
function loadDataFile(filename) {
  let content = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
  content = content.replace(/export const \w+\s*=\s*/g, 'return ');
  content = content.replace(/export\s+\{[^\}]+\}\;/g, '');
  
  if (filename === 'checklists.js') {
    let checklistsArray = [];
    const names = ['masterChecklist', 'hostelChecklist', 'gymChecklist', 'libraryChecklist', 'commonCampusChecklist', 'fireEhsChecklist'];
    let c = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    names.forEach(name => {
      const regex = new RegExp(`export const ${name}\\s*=\\s*({[\\s\\S]*?});`, 'm');
      const match = c.match(regex);
      if (match) {
        const obj = new Function('return ' + match[1])();
        
        let items = [];
        for (const [aspect, criteriaArray] of Object.entries(obj)) {
          criteriaArray.forEach(criteria => {
            items.push({ item: name, aspect, criteria });
          });
        }
        checklistsArray.push({ name, items });
      }
    });
    return checklistsArray;
  }
  return new Function(content)();
}

const uploadData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('ERROR: MONGO_URI is missing. Please set it in backend/.env');
      process.exit(1);
    }

    console.log('Parsing data files...');
    const zonalHeadsData = loadDataFile('zonalHeads.js');
    const subZonalHeadsData = loadDataFile('subZonalHeads.js');
    const checklistsData = loadDataFile('checklists.js');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing old data...');
    await Complaint.deleteMany({});
    await Advisory.deleteMany({});
    await ZonalHead.deleteMany({});
    await SubZonalHead.deleteMany({});
    await Checklist.deleteMany({});

    console.log('Uploading new data...');
    await Complaint.insertMany(initialComplaints);
    await Advisory.insertMany(initialAdvisories);
    await ZonalHead.insertMany(zonalHeadsData);
    await SubZonalHead.insertMany(subZonalHeadsData);
    await Checklist.insertMany(checklistsData);

    console.log('Data successfully uploaded to MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
};

uploadData();
