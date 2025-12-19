# MechAfrica Admin - API Payloads & Responses Documentation

This document defines all expected API payloads (requests) and responses for the MechAfrica Admin application, including the mapping between frontend and backend formats.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#1-authentication)
3. [Weather API](#2-weather-api)
4. [Finances API](#3-finances-api)
5. [Contacts (Farmers, Providers, Agents)](#4-contacts-farmers-providers-agents)
6. [Service Requests](#5-service-requests)
7. [Admin Management](#6-admin-management)
8. [Dashboard & Statistics](#7-dashboard--statistics)
9. [Weather Broadcast](#8-weather-broadcast)
10. [Data Transformation Reference](#9-data-transformation-reference)
11. [Error Handling](#10-error-handling)

---

## Overview

### Base URL Configuration

```bash
# Environment Variable
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### API Response Format

All backend API responses follow this standard format:

```json
{
  "success": true,
  "message": "string",
  "data": "object | array | null",
  "errors": "object | null"
}
```

### Naming Convention Mapping

| Frontend (camelCase) | Backend (snake_case) |
|----------------------|----------------------|
| `firstName` | `first_name` |
| `otherNames` | `last_name` |
| `phoneNumber` | `phone_number` |
| `registrationDate` | `created_at` |
| `profileImage` | N/A (not implemented) |
| `farmSize` | `farm_size` |
| `farmSizeUnit` | N/A (always acres) |

---

## 1. Authentication

### POST `/admin/login`

Login to the admin dashboard. Supports both email and phone number authentication.

#### Request Payload (Email Login)

```json
{
  "email": "admin@mechafrica.com",
  "password": "securePassword123"
}
```

#### Request Payload (Phone Login)

```json
{
  "phone_number": "+233241234567",
  "password": "securePassword123"
}
```

#### Backend Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+233241234567",
      "email": "admin@mechafrica.com",
      "role": "admin",
      "community_name": "Kumasi",
      "region_name": "Ashanti",
      "is_verified": true,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "token": "jwt-token-string"
  }
}
```

#### Transformed Frontend Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "admin@mechafrica.com",
      "type": "Admin",
      "avatar": "JD"
    }
  }
}
```

#### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "errors": null
}
```

### POST `/admin/register`

Register a new admin user.

#### Request Payload

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+233241234567",
  "email": "admin@mechafrica.com",
  "password": "SecurePassword123!",
  "community_name": "Kumasi",
  "id_number": "GHA-123456789-0",
  "id_type": "ghana_card",
  "gender": "male"
}
```

#### ID Type Options

- `ghana_card`
- `passport`
- `voter_id`
- `drivers_license`

#### Gender Options

- `male`
- `female`

---

## 2. Weather API

### GET `/weather` ✅ IMPLEMENTED

Fetches weather data from the backend API (which proxies to OpenWeatherMap).

> ✅ **The weather endpoint is now implemented on the backend!** No authentication required.

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| `lat`     | float  | No       | `6.69`  | Latitude (default: Kumasi, Ghana) |
| `lon`     | float  | No       | `-1.62` | Longitude (default: Kumasi, Ghana) |

#### Example Request

```
GET /weather?lat=5.6037&lon=-0.1870
```

#### Response

```json
{
  "lat": 5.6037,
  "lon": -0.187,
  "timezone": "Africa/Accra",
  "current": {
    "dt": 1701849600,
    "temp": 28.5,
    "feels_like": 31.2,
    "pressure": 1012,
    "humidity": 75,
    "uvi": 8.5,
    "wind_speed": 3.5,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ]
  },
  "hourly": [
    {
      "dt": 1701849600,
      "temp": 28.5,
      "feels_like": 31.2,
      "pressure": 1012,
      "humidity": 75,
      "uvi": 8.5,
      "wind_speed": 3.5,
      "pop": 0.1,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ]
    }
  ],
  "daily": [
    {
      "dt": 1701849600,
      "temp": {
        "day": 28.5,
        "min": 22.0,
        "max": 32.0,
        "night": 24.5,
        "eve": 27.0,
        "morn": 23.0
      },
      "pop": 0.15,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ]
    }
  ]
}
```

#### Error Response

```json
{
  "error": "Failed to fetch weather data"
}
```

#### Frontend Usage

```typescript
import { api } from "@/lib/api";

// Fetch weather data (defaults to Kumasi, Ghana)
const weatherData = await api.getWeather();

// Fetch weather for specific coordinates
const weatherData = await api.getWeather(5.6037, -0.1870);
```

> **Note:** The frontend now uses the backend `/weather` endpoint directly. The local Next.js proxy at `/api/weather` is kept as a fallback but the backend endpoint is preferred.

---

## 3. Finances API

### GET `/admin/payment-summary`

Fetches financial summary data.

#### Query Parameters

| Parameter | Type   | Required | Default | Description           |
|-----------|--------|----------|---------|----------------------|
| `period`  | string | No       | `month` | day, week, month, year |

#### Backend Response

```json
{
  "success": true,
  "message": "Payment summary retrieved",
  "data": {
    "period": "month",
    "total_transactions": 150,
    "total_revenue": 324353.00,
    "commission_earned": 16217.65,
    "pending_payments": 45000.00,
    "message": "Payment tracking will be implemented when payment integration is added"
  }
}
```

#### Transformed Frontend Response

```json
{
  "summary": {
    "revenue": {
      "value": "¢324,353",
      "delta": "+0%"
    },
    "withdrawals": {
      "value": "¢0",
      "delta": "+0%"
    },
    "payments": {
      "value": "¢45,000",
      "delta": "+0%"
    },
    "commission": {
      "value": "¢16,218",
      "delta": "+0%"
    }
  },
  "chart": []
}
```

> **Note:** Chart data and delta percentages are not yet implemented in the backend. The frontend uses fallback data for display.

---

## 4. Contacts (Farmers, Providers, Agents)

### GET `/admin/users`

Fetches users with optional role filtering.

#### Query Parameters

| Parameter     | Type    | Required | Default | Description                    |
|---------------|---------|----------|---------|--------------------------------|
| `role`        | string  | No       | -       | farmer, service_provider, agent, admin |
| `page`        | number  | No       | 1       | Page number                    |
| `limit`       | number  | No       | 20      | Items per page                 |
| `search`      | string  | No       | -       | Search query                   |
| `is_verified` | boolean | No       | -       | Filter by verification status  |
| `is_active`   | boolean | No       | -       | Filter by active status        |

#### Backend Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "uuid-string",
        "first_name": "Kwame",
        "last_name": "Asante",
        "phone_number": "+233241234567",
        "email": "kwame@example.com",
        "role": "farmer",
        "community_name": "Kumasi Central",
        "region_name": "Ashanti",
        "is_verified": true,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

#### Transformed Frontend Response (Contacts)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "firstName": "Kwame",
      "otherNames": "Asante",
      "gender": "Male",
      "phone": "+233241234567",
      "region": "Ashanti",
      "registrationDate": "1/15/24",
      "initials": "KA",
      "profileImage": null,
      "type": "Farmer",
      "district": "Kumasi Central",
      "farmName": "",
      "farmSize": 0,
      "farmSizeUnit": "Acre",
      "crops": [],
      "formLocation": "Kumasi Central"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Alternative Endpoints

| Contact Type | Primary Endpoint | Fallback Endpoint |
|--------------|------------------|-------------------|
| Farmers | `/admin/users?role=farmer` | - |
| Providers | `/admin/manage-providers` | `/admin/users?role=service_provider` |
| Agents | `/admin/manage-agents` | `/admin/users?role=agent` |

---

## 5. Service Requests

### GET `/admin/service-requests`

Fetches all service requests.

#### Query Parameters

| Parameter | Type   | Required | Default |
|-----------|--------|----------|---------|
| `page`    | number | No       | 1       |
| `limit`   | number | No       | 20      |

#### Backend Response

```json
{
  "success": true,
  "message": "All service requests retrieved successfully",
  "data": [
    {
      "id": "uuid-string",
      "request_id": "REQ-2024-0001",
      "farmer_id": "farmer-uuid",
      "service_provider_id": "provider-uuid",
      "service_type": "plowing",
      "farm_size": 5.5,
      "crop_type": "Maize",
      "start_date": "2024-01-20T08:00:00Z",
      "end_date": "2024-01-22T17:00:00Z",
      "status": "in_progress",
      "farmer": {
        "id": "farmer-uuid",
        "first_name": "Kwame",
        "last_name": "Asante"
      },
      "service_provider": {
        "id": "provider-uuid",
        "business_name": "Asante Agro Services"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-18T14:20:00Z"
    }
  ]
}
```

#### Transformed Frontend Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Kwame Asante",
      "handle": "@req-2024-0001",
      "status": "Ongoing",
      "email": "",
      "date": "1/20/24"
    }
  ]
}
```

### Status Mapping

| Backend Status | Frontend Status |
|----------------|-----------------|
| `pending` | `Wait` |
| `accepted` | `Active` |
| `declined` | `Cancelled` |
| `in_progress` | `Ongoing` |
| `work_started` | `Ongoing` |
| `work_paused` | `Wait` |
| `completed` | `Completed` |
| `cancelled` | `Cancelled` |

---

## 6. Admin Management

### GET `/admin/users?role=admin`

Fetches all admin users.

#### Transformed Frontend Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Jane Cooper",
      "email": "jane.cooper@example.com",
      "avatar": "JC",
      "type": "Admin",
      "phoneNumber": "+233241234567",
      "dateOfRegistration": "5/27/15"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### POST `/admin/manage-user`

Manage user status (verify, activate, deactivate, etc.)

#### Request Payload

```json
{
  "user_id": "uuid-string",
  "action": "verify"
}
```

#### Action Options

- `verify` - Verify a user
- `unverify` - Remove verification
- `activate` - Activate a user
- `deactivate` - Deactivate a user (soft delete)
- `delete` - Permanently delete a user

---

## 7. Dashboard & Statistics

### GET `/admin/dashboard`

Fetches comprehensive dashboard data.

#### Backend Response

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "total_users": 1250,
      "active_users": 980,
      "total_service_requests": 3456,
      "pending_verifications": 25,
      "system_health": "healthy",
      "revenue": 125000.50
    },
    "user_stats": {
      "farmers": {
        "total": 850,
        "active": 720,
        "verified": 680,
        "pending": 45,
        "inactive": 130
      },
      "service_providers": {
        "total": 320,
        "active": 280,
        "verified": 265,
        "pending": 20,
        "inactive": 40
      },
      "agents": {
        "total": 50,
        "active": 45,
        "verified": 50,
        "pending": 0,
        "inactive": 5
      },
      "admins": {
        "total": 30,
        "active": 28,
        "verified": 30,
        "pending": 0,
        "inactive": 2
      }
    },
    "service_stats": {
      "total_requests": 3456,
      "pending": 234,
      "in_progress": 567,
      "completed": 2500,
      "cancelled": 155,
      "completion_rate": 72.3
    },
    "recent_activity": [
      {
        "id": "activity-uuid",
        "type": "user_registration",
        "description": "New farmer registered",
        "user_id": "user-uuid",
        "user_name": "Kwame Asante",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "top_regions": [
      {
        "region_name": "Ashanti",
        "user_count": 350,
        "request_count": 890
      }
    ]
  }
}
```

#### Transformed Frontend Statistics

```json
{
  "success": true,
  "data": {
    "totalFarmers": 850,
    "totalServiceProviders": 320,
    "totalAcres": 0,
    "demandToSupply": "2.7 : 1",
    "farmersGrowth": "+0%",
    "providersGrowth": "+0%",
    "acresGrowth": "+0%"
  }
}
```

---

## 8. Weather Broadcast

### POST `/admin/weather-broadcast`

Send a weather broadcast notification to users in a specific region.

#### Request Payload

```json
{
  "ai_notifications": true,
  "region": "Ashanti",
  "district": "Kumasi Metropolitan",
  "message": "Heavy rainfall expected in the next 48 hours. Please take necessary precautions for your crops."
}
```

#### Response

```json
{
  "success": true,
  "message": "Broadcast sent successfully",
  "data": {
    "broadcast_id": "bc-12345",
    "recipient_count": 150,
    "sent_at": "2024-12-06T10:30:00Z"
  }
}
```

---

## 9. Data Transformation Reference

### Role to Type Mapping

```typescript
const roleMapping = {
  "admin": "Admin",
  "agent": "Agent",
  "farmer": "Farmer",
  "service_provider": "Provider"
};
```

### Date Formatting

Backend dates are in ISO 8601 format and transformed to `M/D/YY` format for display:

```typescript
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}
```

### Currency Formatting

```typescript
function formatCurrency(amount: number): string {
  return `¢${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}
```

### Initials Generation

```typescript
function generateInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}
```

---

## 10. Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### HTTP Status Codes

| Code | Description           | When Used                    |
|------|-----------------------|------------------------------|
| 200  | Success               | Successful GET, PUT          |
| 201  | Created               | Successful POST (create)     |
| 400  | Bad Request           | Invalid request payload      |
| 401  | Unauthorized          | Missing/invalid token        |
| 403  | Forbidden             | Insufficient permissions     |
| 404  | Not Found             | Resource doesn't exist       |
| 422  | Unprocessable Entity  | Validation errors            |
| 500  | Internal Server Error | Server-side error            |

### Authentication Errors

```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token",
  "data": null
}
```

---

## Ghana Regions Reference

| Region        | Latitude | Longitude |
|---------------|----------|-----------|
| Greater Accra | 5.6037   | -0.1870   |
| Ashanti       | 6.7470   | -1.5209   |
| Western       | 5.5000   | -2.5000   |
| Central       | 5.5000   | -1.0000   |
| Volta         | 6.5000   | 0.5000    |
| Eastern       | 6.5000   | -0.5000   |
| Northern      | 9.5000   | -1.0000   |
| Upper East    | 10.5000  | -0.5000   |
| Upper West    | 10.5000  | -2.5000   |
| Brong-Ahafo   | 7.5000   | -1.5000   |

---

## Environment Variables

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_api_key_here
# OR
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here

# Google Maps (for map functionality)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## API Client Usage

### Import

```typescript
import { api } from "@/lib/api";
```

### Authentication

```typescript
// Login
const response = await api.login("admin@example.com", "password");

// Logout
api.logout();
```

### Fetching Data

```typescript
// Get farmers
const farmers = await api.getFarmers(1, 20);

// Get service providers
const providers = await api.getServiceProviders(1, 20);

// Get agents
const agents = await api.getAgents(1, 20);

// Get dashboard
const dashboard = await api.getDashboard();

// Get statistics
const stats = await api.getStatistics();

// Get service requests
const requests = await api.getServiceRequests(1, 20);

// Get finances
const finances = await api.getFinances("month");
```

---

## Version

**Document Version:** 2.0.0  
**Last Updated:** December 2024  
**Application:** MechAfrica Admin Dashboard  
**Backend API Version:** v1
