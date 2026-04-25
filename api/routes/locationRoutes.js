import express from 'express';
import { getStates, getLGAs, getAllLocations, seedLocationsFromAPI } from '../controlllers/locationController.js';

const router = express.Router();

router.get('/api/v1/location/states', getStates);
router.get('/api/v1/location/lgas/:state', getLGAs);
router.get('/api/v1/location/all', getAllLocations); // For admin purposes
router.post('/api/v1/location/seed', seedLocationsFromAPI); // Seed database from external API

export default router;