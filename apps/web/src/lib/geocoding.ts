// Geocoding Service for Location Autocomplete
export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: number;
  country: string;
  state?: string;
  city: string;
}

export interface GeocodingService {
  searchLocations(query: string): Promise<LocationResult[]>;
  getTimezone(lat: number, lng: number): Promise<number>;
}

// Mock geocoding service (replace with actual API in production)
class MockGeocodingService implements GeocodingService {
  private mockLocations: LocationResult[] = [
    {
      name: 'New York, NY, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: -5,
      country: 'USA',
      state: 'NY',
      city: 'New York'
    },
    {
      name: 'Los Angeles, CA, USA',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: -8,
      country: 'USA',
      state: 'CA',
      city: 'Los Angeles'
    },
    {
      name: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0,
      country: 'UK',
      city: 'London'
    },
    {
      name: 'Paris, France',
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: 1,
      country: 'France',
      city: 'Paris'
    },
    {
      name: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 9,
      country: 'Japan',
      city: 'Tokyo'
    },
    {
      name: 'Sydney, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 10,
      country: 'Australia',
      city: 'Sydney'
    },
    {
      name: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
      country: 'India',
      city: 'Mumbai'
    },
    {
      name: 'São Paulo, Brazil',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: -3,
      country: 'Brazil',
      city: 'São Paulo'
    },
    {
      name: 'Cairo, Egypt',
      latitude: 30.0444,
      longitude: 31.2357,
      timezone: 2,
      country: 'Egypt',
      city: 'Cairo'
    },
    {
      name: 'Moscow, Russia',
      latitude: 55.7558,
      longitude: 37.6176,
      timezone: 3,
      country: 'Russia',
      city: 'Moscow'
    }
  ];

  async searchLocations(query: string): Promise<LocationResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];
    
    return this.mockLocations.filter(location => 
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.city.toLowerCase().includes(normalizedQuery) ||
      location.country.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5); // Limit to 5 results
  }

  async getTimezone(lat: number, lng: number): Promise<number> {
    // Mock timezone calculation based on longitude
    // In production, use a timezone API like Google Timezone API
    const timezone = Math.round(lng / 15);
    return Math.max(-12, Math.min(14, timezone)); // Clamp between -12 and +14
  }
}

// Production geocoding service (Google Places API)
class GoogleGeocodingService implements GeocodingService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchLocations(query: string): Promise<LocationResult[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Geocoding API error: ${data.status}`);
      }

      const results: LocationResult[] = [];
      
      for (const prediction of data.predictions.slice(0, 5)) {
        const details = await this.getPlaceDetails(prediction.place_id);
        if (details) {
          results.push(details);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  private async getPlaceDetails(placeId: string): Promise<LocationResult | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        return null;
      }

      const place = data.result;
      const { lat, lng } = place.geometry.location;
      const timezone = await this.getTimezone(lat, lng);

      return {
        name: place.formatted_address,
        latitude: lat,
        longitude: lng,
        timezone,
        country: this.extractCountry(place.formatted_address),
        city: this.extractCity(place.formatted_address)
      };
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  private extractCountry(address: string): string {
    const parts = address.split(', ');
    return parts[parts.length - 1] || '';
  }

  private extractCity(address: string): string {
    const parts = address.split(', ');
    return parts[0] || '';
  }

  async getTimezone(lat: number, lng: number): Promise<number> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.rawOffset / 3600; // Convert seconds to hours
      }
      
      // Fallback to longitude-based calculation
      return Math.round(lng / 15);
    } catch (error) {
      console.error('Timezone error:', error);
      return Math.round(lng / 15);
    }
  }
}

// Export the appropriate service based on environment
export const geocodingService: GeocodingService = 
  process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? new GoogleGeocodingService(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    : new MockGeocodingService(); 