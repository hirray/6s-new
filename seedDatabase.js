import axios from 'axios';
import { APP_ZONES, APP_SUBZONES, APP_METHODOLOGY, APP_SZH, APP_CL_TASKS } from './config/appConfig.js';

const API_URL = 'https://six-7uud.onrender.com/api';

async function seedDatabase() {
  console.log('Starting database seeding via API...');

  try {
    // Note: This script assumes the API has endpoints to accept this bulk data or we loop and POST them individually.
    // For SubZonalHeads:
    console.log('Seeding Sub Zonal Heads...');
    for (const szh of APP_SZH) {
      try {
        await axios.post(`${API_URL}/data/subzonalheads`, {
          name: szh.name,
          email: `${szh.id.toLowerCase()}@6s.com`, // dummy email
          zone: szh.zone,
          floor: szh.floor
        });
        console.log(`Added SZH: ${szh.name}`);
      } catch (err) {
        console.log(`Failed to add SZH ${szh.name} - might already exist.`);
      }
    }

    console.log('Database seeding process completed.');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  }
}

seedDatabase();
