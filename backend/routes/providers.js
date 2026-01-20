import express from 'express';
import { Provider } from '../models/Provider.js';
import { Booking } from '../models/Booking.js';

const router = express.Router();

// Get all providers
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.isAvailable !== undefined) {
      filters.isAvailable = req.query.isAvailable === 'true';
    }
    if (req.query.serviceType) {
      filters.serviceType = req.query.serviceType;
    }

    const providers = await Provider.findAll(filters);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get provider's bookings
router.get('/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.findAll({ providerId: req.params.id });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update provider availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const provider = await Provider.updateAvailability(req.params.id, isAvailable);
    res.json(provider);
  } catch (error) {
    console.error('Error updating provider availability:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
