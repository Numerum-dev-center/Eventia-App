# Eventia Frontend Integration Guide

## API Base URLs
- **Production**: `https://eventia-app-c6b5.onrender.com`
- **Local**: `http://localhost:3000`
- **Swagger Docs**: `/api-docs` (accessible at both URLs above)

## Authentication Flow

### 1. Register Client
```typescript
const response = await fetch('https://eventia-app-c6b5.onrender.com/auth/register-client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  })
});
```

### 2. Activate Account (via email link)
```typescript
const response = await fetch('https://eventia-app-c6b5.onrender.com/auth/activate?token=YOUR_ACTIVATION_TOKEN');
```

### 3. Login (returns cookies)
```typescript
const response = await fetch('https://eventia-app-c6b5.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});
```

### 4. Access Protected Routes (with Bearer token)
```typescript
const response = await fetch('https://eventia-app-c6b5.onrender.com/user', {
  headers: {
    'Authorization': `Bearer ${accessToken}` // From login response
  }
});
```

## Available Roles
- `CLIENT` - Regular user who buys tickets
- `ORGANIZER` - Event organizer
- `ADMIN` - Administrator

## Key Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register-client` | Register client account |
| POST | `/auth/register-organizer` | Register organizer account |
| POST | `/auth/login` | Login (returns tokens) |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with code |
| POST | `/auth/refresh-token` | Refresh access token |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | List all users |
| GET | `/user/{id}` | Get user by ID |
| PATCH | `/user/me/profile-client` | Update client profile |
| PATCH | `/user/me/profile-organizer` | Update organizer profile |
| PATCH | `/user/me/change-password` | Change password |
| DELETE | `/user/{id}` | Delete user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/event` | Create event |
| GET | `/event` | List all events |
| GET | `/event/published` | List published events |
| GET | `/event/{id}` | Get event by ID |
| PATCH | `/event/{id}` | Update event |
| DELETE | `/event/{id}` | Delete event |
| PATCH | `/event/{id}/status` | Update event status |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ticket` | Create ticket |
| GET | `/ticket` | List tickets |
| GET | `/ticket/order/{orderId}` | Get tickets by order |
| GET | `/ticket/event/{eventId}` | Get tickets by event |
| PATCH | `/ticket/{id}/validate` | Validate ticket |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order` | Create order |
| GET | `/order` | List orders |
| GET | `/order/me` | Get my orders |
| GET | `/order/{id}` | Get order by ID |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment` | Create payment |
| GET | `/payment` | List payments |
| GET | `/payment/order/{orderId}` | Get payment by order |
| PATCH | `/payment/{id}/status` | Update payment status |

### Dashboard (Organizer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard stats |
| GET | `/dashboard/organizer/stats` | Get organizer stats |
| GET | `/dashboard/activity` | Get recent activity |

## Error Response Format
```json
{
  "statusCode": 400,
  "message": ["Email is required."],
  "error": "Bad Request"
}
```

## Environment Variables (Frontend)
```env
VITE_API_BASE_URL=https://eventia-app-c6b5.onrender.com
VITE_API_LOCAL_URL=http://localhost:3000
VITE_APP_NAME=Eventia
```
