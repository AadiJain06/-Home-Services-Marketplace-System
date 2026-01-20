import { dbRun, dbGet, dbAll } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// Valid status transitions
const STATUS_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.ASSIGNED]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.REJECTED]: [BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CANCELLED]
};

export function isValidTransition(fromStatus, toStatus) {
  return STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
}

export class Booking {
  static async create(bookingData) {
    const id = uuidv4();
    const {
      customerId,
      customerName,
      serviceType,
      description,
      address,
      scheduledTime
    } = bookingData;

    await dbRun(
      `INSERT INTO bookings (id, customer_id, customer_name, service_type, description, address, scheduled_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, customerId, customerName, serviceType, description || '', address, scheduledTime || null, BOOKING_STATUS.PENDING]
    );

    // Log event
    await this.logEvent(id, 'created', { bookingData }, customerId, 'customer');

    return this.findById(id);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (filters.customerId) {
      query += ' AND customer_id = ?';
      params.push(filters.customerId);
    }

    if (filters.providerId) {
      query += ' AND provider_id = ?';
      params.push(filters.providerId);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    return await dbAll(query, params);
  }

  static async updateStatus(id, newStatus, updatedBy, updatedByType, cancellationReason = null) {
    const booking = await this.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if transition is valid (allow admin override)
    if (updatedByType !== 'admin' && !isValidTransition(booking.status, newStatus)) {
      throw new Error(`Invalid status transition from ${booking.status} to ${newStatus}`);
    }

    const updates = { status: newStatus, updated_at: new Date().toISOString() };
    
    if (newStatus === BOOKING_STATUS.CANCELLED) {
      updates.cancelled_by = updatedBy;
      updates.cancellation_reason = cancellationReason || 'No reason provided';
    }

    await dbRun(
      `UPDATE bookings SET status = ?, updated_at = ?, cancelled_by = ?, cancellation_reason = ?
       WHERE id = ?`,
      [newStatus, updates.updated_at, updates.cancelled_by || null, updates.cancellation_reason || null, id]
    );

    // Log event
    await this.logEvent(id, 'status_updated', {
      from: booking.status,
      to: newStatus,
      updatedBy,
      cancellationReason
    }, updatedBy, updatedByType);

    return this.findById(id);
  }

  static async assignProvider(id, providerId, assignedBy = 'system') {
    const booking = await this.findById(id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.REJECTED) {
      throw new Error(`Cannot assign provider to booking with status ${booking.status}`);
    }

    await dbRun(
      `UPDATE bookings SET provider_id = ?, status = ?, updated_at = ? WHERE id = ?`,
      [providerId, BOOKING_STATUS.ASSIGNED, new Date().toISOString(), id]
    );

    // Log event
    await this.logEvent(id, 'provider_assigned', { providerId }, assignedBy, assignedBy === 'system' ? 'system' : 'admin');

    return this.findById(id);
  }

  static async logEvent(bookingId, eventType, eventData, performedBy, performedByType) {
    await dbRun(
      `INSERT INTO booking_events (booking_id, event_type, event_data, performed_by, performed_by_type)
       VALUES (?, ?, ?, ?, ?)`,
      [bookingId, eventType, JSON.stringify(eventData), performedBy, performedByType]
    );
  }

  static async getEvents(bookingId) {
    return await dbAll(
      'SELECT * FROM booking_events WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
  }

  static async getHistory(filters = {}) {
    let query = `
      SELECT be.*, b.customer_name, b.service_type
      FROM booking_events be
      JOIN bookings b ON be.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.bookingId) {
      query += ' AND be.booking_id = ?';
      params.push(filters.bookingId);
    }

    if (filters.eventType) {
      query += ' AND be.event_type = ?';
      params.push(filters.eventType);
    }

    query += ' ORDER BY be.created_at DESC LIMIT 100';

    return await dbAll(query, params);
  }
}
