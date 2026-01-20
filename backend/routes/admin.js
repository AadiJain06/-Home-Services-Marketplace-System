import express from 'express';
import { Booking } from '../models/Booking.js';

const router = express.Router();

// Get all booking events/history (observability)
router.get('/events', async (req, res) => {
  try {
    const filters = {};
    if (req.query.bookingId) filters.bookingId = req.query.bookingId;
    if (req.query.eventType) filters.eventType = req.query.eventType;

    const events = await Booking.getHistory(filters);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual provider assignment (admin override)
router.post('/bookings/:id/assign', async (req, res) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }

    const booking = await Booking.assignProvider(req.params.id, providerId, 'admin');
    res.json(booking);
  } catch (error) {
    console.error('Error manually assigning provider:', error);
    res.status(400).json({ error: error.message });
  }
});

// Admin status override
router.post('/bookings/:id/override-status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const booking = await Booking.updateStatus(
      req.params.id,
      status,
      'admin',
      'admin',
      reason
    );

    res.json(booking);
  } catch (error) {
    console.error('Error overriding status:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
