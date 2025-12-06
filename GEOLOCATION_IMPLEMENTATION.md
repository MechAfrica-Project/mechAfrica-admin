# Weather Page Geolocation Implementation

## Overview
The weather page now supports real-time geolocation to automatically detect the user's current location and fetch weather data for that specific location.

## How It Works

### 1. **Geolocation Hook** (`hooks/useGeolocation.ts`)
```typescript
const { location, loading, error } = useGeolocation();
```

**Features:**
- ✅ Requests user's precise coordinates (latitude/longitude)
- ✅ Falls back to Kumasi, Ghana if permission denied
- ✅ Falls back to Kumasi if browser doesn't support geolocation
- ✅ 5-second timeout to prevent long waits
- ✅ Returns location status (`isDefault` flag)

### 2. **API Route** (`/api/weather/route.ts`)
Updated to accept query parameters:
```
GET /api/weather?lat=6.69&lon=-1.62
```

**Features:**
- ✅ Accepts `lat` and `lon` query parameters
- ✅ Falls back to Kumasi (6.69, -1.62) if not provided
- ✅ Forwards coordinates to OpenWeatherMap API
- ✅ Returns real-time weather for specified location

### 3. **Weather Page Integration**
```typescript
// Request geolocation when page loads
const { location } = useGeolocation();

// Fetch weather for detected location
const params = new URLSearchParams({
  lat: location.lat.toString(),
  lon: location.lon.toString(),
});
const res = await fetch(`/api/weather?${params}`);
```

## Data Flow

```
Browser Geolocation API
         ↓
   useGeolocation Hook
         ↓
   Weather Page Component
         ↓
   /api/weather?lat=X&lon=Y
         ↓
   OpenWeatherMap API
         ↓
   Zustand Store
         ↓
   Display Components
```

## Features

### ✅ User Location Detection
- Uses browser's native Geolocation API
- High accuracy enabled
- Requests precise coordinates

### ✅ Fallback Mechanism
- **If permission denied**: Uses Kumasi, Ghana
- **If unsupported browser**: Uses Kumasi, Ghana  
- **If API error**: Uses Kumasi, Ghana
- **If timeout**: Uses Kumasi, Ghana (5-second timeout)

### ✅ Location Display
Shows detected location to user:
```
📍 Weather for: 6.69°N, -1.62°E
📍 Weather for: Kumasi, Ghana (Default)
```

### ✅ Graceful Loading States
- "Detecting location…" while geolocation is active
- "Loading weather…" while fetching weather data
- Proper error messages if API fails

## Browser Compatibility

| Browser | Geolocation Support | Fallback |
|---------|-------------------|----------|
| Chrome | ✅ Yes | Kumasi |
| Firefox | ✅ Yes | Kumasi |
| Safari | ✅ Yes | Kumasi |
| Edge | ✅ Yes | Kumasi |
| IE 11 | ❌ No | Kumasi |

## User Privacy

- ✅ Browser requests explicit user permission
- ✅ No tracking or persistent storage
- ✅ Data only sent to your own API
- ✅ User can deny and see default Kumasi weather

## Implementation Example

### To use in weather page:
```typescript
import { useGeolocation } from "./hooks/useGeolocation";

export default function WeatherPage() {
  const { location, loading: geoLoading, error: geoError } = useGeolocation();
  
  // Fetch weather using location.lat and location.lon
  const params = new URLSearchParams({
    lat: location?.lat.toString() ?? "6.69",
    lon: location?.lon.toString() ?? "-1.62",
  });
  const res = await fetch(`/api/weather?${params}`);
}
```

## Testing

**With Geolocation Permission:**
1. Load weather page
2. Browser prompts for location permission
3. Accept permission
4. Page shows current location coordinates
5. Weather data updates for your location

**Without Geolocation Permission:**
1. Load weather page
2. Browser prompts for location permission
3. Deny permission
4. Page shows "Kumasi, Ghana (Default)"
5. Weather data shows Kumasi weather

**On Unsupported Browser:**
1. Load weather page
2. No geolocation prompt
3. Page shows "Kumasi, Ghana (Default)"
4. Weather data shows Kumasi weather

## API Examples

### Get Weather for User's Location
```bash
GET /api/weather?lat=40.7128&lon=-74.0060
# New York coordinates
```

### Get Weather for Specific Location
```bash
GET /api/weather?lat=1.3521&lon=103.8198
# Singapore coordinates
```

### Default Location (If no parameters)
```bash
GET /api/weather
# Falls back to Kumasi, Ghana (6.69, -1.62)
```

## Future Enhancements

- [ ] Use reverse geocoding to show city name instead of coordinates
- [ ] Allow manual location search/input
- [ ] Save user's location preference
- [ ] Show weather for multiple saved locations
- [ ] Integrate with timezone detection for local time display
