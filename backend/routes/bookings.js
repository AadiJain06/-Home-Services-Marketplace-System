import express from 'express';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { assignProviderToBooking, handleProviderRejection } from '../services/assignmentService.js';

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      serviceType,
      description,
      address,
      scheduledTime
    } = req.body;

    if (!customerId || !customerName || !serviceType || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = await Booking.create({
      customerId,
      customerName,
      serviceType,
      description,
      address,
      scheduledTime
    });

    // Auto-assign provider
    try {
      await assignProviderToBooking(booking.id, serviceType);
      const updatedBooking = await Booking.findById(booking.id);
      res.status(201).json(updatedBooking);
    } catch (error) {
      // Booking created but assignment failed - still return booking
      console.error('Auto-assignment failed:', error);
      res.status(201).json(booking);
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (with optional filters)
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.customerId) filters.customerId = req.query.customerId;
    if (req.query.providerId) filters.providerId = req.query.providerId;
    if (req.query.status) filters.status = req.query.status;

    const bookings = await Booking.findAll(filters);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, updatedBy, updatedByType, cancellationReason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const booking = await Booking.updateStatus(
      req.params.id,
      status,
      updatedBy || 'system',
      updatedByType || 'system',
      cancellationReason
    );

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(400).json({ error: error.message });
  }
});

// Provider accepts booking
router.post('/:id/accept', async (req, res) => {
  try {
    const { providerId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.provider_id !== providerId) {
      return res.status(403).json({ error: 'Provider not assigned to this booking' });
    }

    if (booking.status !== BOOKING_STATUS.ASSIGNED) {
      return res.status(400).json({ error: `Cannot accept booking with status ${booking.status}` });
    }

    const updatedBooking = await Booking.updateStatus(
      req.params.id,
      BOOKING_STATUS.IN_PROGRESS,
      providerId,
      'provider'
    );

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(400).json({ error: error.message });
  }
});

// Provider rejects booking
router.post('/:id/reject', async (req, res) => {
  try {
    const { providerId } = req.body;
    
    await handleProviderRejection(req.params.id, providerId);
    const booking = await Booking.findById(req.params.id);

    res.json(booking);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(400).json({ error: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const { cancelledBy, cancelledByType, reason } = req.body;
    
    const booking = await Booking.updateStatus(
      req.params.id,
      BOOKING_STATUS.CANCELLED,
      cancelledBy || 'customer',
      cancelledByType || 'customer',
      reason
    );

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get booking events/history
router.get('/:id/events', async (req, res) => {
  try {
    const events = await Booking.getEvents(req.params.id);
    res.json(events);
  } catch (error) {
    console.error('Error fetching booking events:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
