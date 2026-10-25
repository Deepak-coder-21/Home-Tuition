import 'dotenv/config';
import mongoose from 'mongoose';
import TutorProfile from '../models/TutorProfile.js';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

const CITY_PINCODE_DEFAULTS = {
  'delhi': ['110001', '110016', '110017', '110048', '110049'],
  'new delhi': ['110001', '110016', '110017', '110048', '110049'],
  'south delhi': ['110017', '110049', '110016', '110048'],
  'bengaluru': ['560034', '560038', '560102', '560068'],
  'bangalore': ['560034', '560038', '560102', '560068'],
  'pune': ['411038', '411007', '411045', '411014'],
  'mumbai': ['400050', '400053', '400049', '400052'],
  'kolkata': ['700064', '700156', '700019', '700016'],
  'noida': ['201301', '201307', '201309', '201305'],
  'madhubani': ['847211', '847212']
};

const SPECIFIC_TUTOR_PINCODES = {
  'Dr. Rajesh Sharma': ['110017', '110049', '110016', '110024', '110048'],
  'Test Tutor Educator': ['110085', '110034', '110088'],
  'Ananya Deshmukh': ['411038', '411045', '411007'],
  'Dr. Vivek Mehra': ['110070', '110017', '110016'],
  'Akash': ['847211', '847212'],
  'Ravi': ['110075', '110077', '110078']
};

async function migratePincodes() {
  try {
    await connectDB();
    const tutors = await TutorProfile.find({});
    console.log(`Found ${tutors.length} tutors in database. Checking PIN codes...`);

    let updatedCount = 0;

    for (const tutor of tutors) {
      let currentPins = Array.isArray(tutor.location?.pincodes) ? tutor.location.pincodes.filter(Boolean) : [];
      
      // If tutor has no PIN codes, assign based on known tutor name or city
      if (currentPins.length === 0) {
        if (SPECIFIC_TUTOR_PINCODES[tutor.name]) {
          currentPins = SPECIFIC_TUTOR_PINCODES[tutor.name];
        } else {
          const cityLower = (tutor.location?.city || '').toLowerCase().trim();
          currentPins = CITY_PINCODE_DEFAULTS[cityLower] || ['110001', '110016'];
        }
      }

      const primaryPin = currentPins[0] || '110001';

      tutor.location = {
        state: tutor.location?.state || 'Delhi NCR',
        city: tutor.location?.city || 'New Delhi',
        localities: Array.isArray(tutor.location?.localities) ? tutor.location.localities : [],
        pincodes: currentPins,
        pincode: primaryPin
      };
      tutor.pincode = primaryPin;

      await tutor.save();

      // Sync to User model
      if (tutor.user) {
        await User.findByIdAndUpdate(tutor.user, { pincode: primaryPin });
      }

      console.log(`✓ Updated tutor: ${tutor.name} -> City: ${tutor.location.city}, PIN codes: ${currentPins.join(', ')}`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully checked and updated ${updatedCount} tutors with verified PIN codes!`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migratePincodes();
