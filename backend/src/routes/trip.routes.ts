import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getUserTrips,
  updateTrip,
  deleteTrip,
  getCities
} from '../controllers/trip.controller';

const router = Router();

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/my', getUserTrips);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.get('/cities', getCities);

export default router;