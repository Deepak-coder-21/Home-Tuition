import express from 'express';
import { 
  getStates, 
  getDistricts, 
  getPlaces, 
  lookupPincode 
} from '../controllers/locationController.js';

const router = express.Router();

// Free Location API endpoints
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/places', getPlaces);
router.get('/pincode/:pincode', lookupPincode);

export default router;
