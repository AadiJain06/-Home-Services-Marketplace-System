# Home Services Marketplace - Booking System

A full-stack booking system for an on-demand home services marketplace that handles the complete booking lifecycle from creation to completion, with robust error handling and observability features.

## Features

### Core Functionality
- ✅ **Create Bookings**: Customers can request services with details (service type, address, description, scheduled time)
- ✅ **Automatic Provider Assignment**: System automatically assigns available providers based on service type
- ✅ **Provider Workflow**: Providers can accept, reject, or view their assigned bookings
- ✅ **Status Lifecycle Management**: Tracks booking through states: `pending → assigned → in-progress → completed`
- ✅ **Failure Handling**:
  - Customer and provider cancellations
  - Provider rejections with automatic reassignment
  - Retry logic for failed operations (exponential backoff)
  - Manual admin intervention and status overrides
- ✅ **Observability**: Complete event logging and booking history tracking

### UI Screens
1. **Create Booking Screen**: Form to create new service bookings
2. **View/Update Booking Status Screen**: Customer view with filtering and cancellation
3. **Provider Dashboard**: View assigned bookings, accept/reject, update status
4. **Admin Panel**: Manage all bookings, manual assignments, status overrides, and view event logs

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React + Vite
- **Database**: SQLite (easily migratable to PostgreSQL)
- **State Management**: React hooks and context

## Project Structure

```
.
├── backend/
│   ├── models/          # Data models (Booking, Provider)
│   ├── routes/          # API routes (bookings, providers, admin)
│   ├── services/        # Business logic (assignment, retry logic)
│   ├── database.js      # Database initialization
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/       # React page components
│   │   ├── api.js       # API client
│   │   └── App.jsx      # Main app component
│   └── index.html
├── package.json         # Root package.json with scripts
└── README.md
```

## Design Decisions & Trade-offs

### 1. **Database Choice: SQLite**
- **Decision**: Used SQLite for simplicity and zero-configuration setup
- **Trade-off**: Easy to migrate to PostgreSQL/MySQL for production by changing the database driver
- **Rationale**: Perfect for demo/prototype, allows focus on business logic rather than infrastructure

### 2. **State Machine Implementation**
- **Decision**: Implemented status transitions as a validation layer in the Booking model
- **Trade-off**: Not using a formal state machine library (like XState), but implemented transition rules
- **Rationale**: Simple, maintainable, and sufficient for the requirements. Admin override bypasses normal transitions for manual intervention

### 3. **Provider Assignment Strategy**
- **Decision**: Simple "first available provider" matching
- **Trade-off**: Doesn't consider location, ratings, or workload balancing
- **Rationale**: Demonstrates the assignment pattern; can be enhanced with more sophisticated matching algorithms

### 4. **Retry Logic**
- **Decision**: Exponential backoff retry (3 attempts) for provider assignment failures
- **Trade-off**: Fixed retry count; could be configurable per operation type
- **Rationale**: Handles transient failures while preventing infinite loops

### 5. **Event Logging**
- **Decision**: Separate `booking_events` table for audit trail
- **Trade-off**: Additional storage, but provides complete observability
- **Rationale**: Critical for debugging, compliance, and understanding system behavior

### 6. **Frontend Architecture**
- **Decision**: Simple React with hooks, no state management library
- **Trade-off**: State is local to components; could use Redux/Zustand for complex state
- **Rationale**: Sufficient for the scope; keeps the codebase simple and maintainable

## Assumptions

1. **Customer Identification**: Using a simple `customerId` field. In production, this would be tied to authentication.
2. **Provider Availability**: Providers have a simple boolean `is_available` flag. Real system would consider schedules, capacity, etc.
3. **Service Types**: Hardcoded list of service types. Production would have a proper service catalog.
4. **No Authentication**: No auth system implemented. In production, would use JWT/OAuth.
5. **Single Assignment**: One provider per booking. Could extend to team assignments.
6. **Time Zones**: Using local datetime without timezone handling. Production would need proper timezone support.

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone/Download the repository**

2. **Install dependencies** (from project root):
   ```bash
   npm run install:all
   ```
   Or manually:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```
   This starts both backend (port 3001) and frontend (port 5173) concurrently.

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## API Endpoints

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings (supports `?customerId=`, `?providerId=`, `?status=` filters)
- `GET /api/bookings/:id` - Get a specific booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/accept` - Provider accepts booking
- `POST /api/bookings/:id/reject` - Provider rejects booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/:id/events` - Get booking event history

### Providers
- `GET /api/providers` - Get all providers (supports `?isAvailable=`, `?serviceType=` filters)
- `GET /api/providers/:id/bookings` - Get provider's bookings
- `PATCH /api/providers/:id/availability` - Update provider availability

### Admin
- `GET /api/admin/events` - Get all event logs (supports `?bookingId=`, `?eventType=` filters)
- `POST /api/admin/bookings/:id/assign` - Manually assign provider
- `POST /api/admin/bookings/:id/override-status` - Admin status override

## User Authentication

The application uses a simple user selection system. On first load, you'll see a login page where you can select:

- **Customers**: Arjun Singh, Kavita Reddy, Vikram Mehta
- **Providers**: Rajesh Kumar, Priya Sharma, Amit Patel  
- **Admin**: Admin User

Each user type has access to different features and views.

## Usage Examples

### Customer Workflow
1. **Login** as a customer (e.g., Arjun Singh)
2. Navigate to "Create Booking" page
3. Fill in service type, address, and optional description/scheduled time
4. Submit the form - system automatically assigns an available provider
5. View your bookings on "My Bookings" page
6. Cancel bookings if needed

### Provider Workflow
1. **Login** as a provider (e.g., Rajesh Kumar)
2. View assigned bookings on the Provider Dashboard
3. Accept bookings to start work (changes status to `in-progress`)
4. Reject bookings if unable to fulfill (triggers automatic reassignment)
5. Mark bookings as completed when done

### Admin Operations
1. **Login** as Admin User
2. View all bookings and their statuses
3. Click "Manage" on any booking to:
   - Manually assign a provider
   - Override booking status (bypass normal state transitions)
4. Switch to "Event Logs" tab to view complete audit trail

## Testing the System

### Test Scenarios

1. **Create and Auto-Assign**:
   - Create a booking → Should auto-assign provider → Status becomes "assigned"

2. **Provider Acceptance**:
   - Provider accepts booking → Status changes to "in-progress"
   - Provider completes → Status changes to "completed"

3. **Provider Rejection**:
   - Provider rejects booking → Status becomes "rejected"
   - System attempts automatic reassignment

4. **Cancellation**:
   - Customer cancels → Status becomes "cancelled" with reason

5. **Admin Override**:
   - Admin can override any status regardless of current state
   - Admin can manually assign providers

6. **Observability**:
   - All actions are logged in event history
   - View complete audit trail in admin panel

## Future Enhancements

- Authentication & Authorization (JWT, role-based access)
- Real-time notifications (WebSockets)
- Payment integration
- Rating/review system
- Advanced provider matching (location, ratings, availability)
- Scheduling calendar integration
- Email/SMS notifications
- Multi-tenant support
- API rate limiting
- Comprehensive test suite (unit + integration tests)

## License

MIT

## Contact

For questions or issues, please contact: gaurav@cleanfanatics.com
