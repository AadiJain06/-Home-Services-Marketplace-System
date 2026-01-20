import { Provider } from '../models/Provider.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function assignProviderToBooking(bookingId, serviceType, retryCount = 0) {
  try {
    // Find available providers for the service type
    const providers = await Provider.findAll({
      isAvailable: true,
      serviceType
    });

    if (providers.length === 0) {
      throw new Error('No available providers found for this service type');
    }

    // Simple assignment strategy: pick first available provider
    // In production, you might use more sophisticated matching (location, rating, etc.)
    const selectedProvider = providers[0];

    // Assign provider
    await Booking.assignProvider(bookingId, selectedProvider.id, 'system');

    return selectedProvider;
  } catch (error) {
    // Retry logic for transient failures
    if (retryCount < MAX_RETRIES) {
      console.log(`Assignment failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY_MS * (retryCount + 1)); // Exponential backoff
      return assignProviderToBooking(bookingId, serviceType, retryCount + 1);
    }
    throw error;
  }
}

export async function handleProviderRejection(bookingId, providerId) {
  const booking = await Booking.findById(bookingId);
  
  if (!booking || booking.provider_id !== providerId) {
    throw new Error('Booking not found or provider mismatch');
  }

  // Update status to rejected
  await Booking.updateStatus(bookingId, BOOKING_STATUS.REJECTED, providerId, 'provider');

  // Try to reassign automatically
  try {
    await assignProviderToBooking(bookingId, booking.service_type);
  } catch (error) {
    // If reassignment fails, booking remains in rejected state
    // Admin can manually intervene
    console.error('Automatic reassignment failed:', error);
  }
}
