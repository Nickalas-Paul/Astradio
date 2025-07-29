'use client';

import React, { useState } from 'react';
import { FormData } from '../types';
import LocationAutocomplete from './LocationAutocomplete';
import { LocationResult } from '../lib/geocoding';

interface BirthDataFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function BirthDataForm({ onSubmit, isLoading = false }: BirthDataFormProps) {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    time: '12:00',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5,
    location: 'New York, NY'
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationResult>({
    name: 'New York, NY, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5,
    country: 'USA',
    state: 'NY',
    city: 'New York'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (location: LocationResult) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone
    }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 glow">
      <h2 className="text-2xl font-bold mb-6 text-center glow-text leading-[1.2] tracking-tight">
        Enter Your Birth Data
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 leading-[1.25] tracking-normal">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 leading-[1.25] tracking-normal">
              Birth Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 leading-[1.25] tracking-normal">
            Location
          </label>
          <LocationAutocomplete
            value={formData.location || ''}
            onChange={handleLocationChange}
            placeholder="Enter city or location..."
          />
        </div>

        {/* Auto-filled coordinates display */}
        {selectedLocation.name && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <label className="block text-sm font-medium mb-1 leading-[1.25] tracking-normal text-gray-300">
                Latitude
              </label>
              <div className="text-white leading-[1.4] tracking-normal">
                {selectedLocation.latitude.toFixed(6)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 leading-[1.25] tracking-normal text-gray-300">
                Longitude
              </label>
              <div className="text-white leading-[1.4] tracking-normal">
                {selectedLocation.longitude.toFixed(6)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 leading-[1.25] tracking-normal text-gray-300">
                Timezone
              </label>
              <div className="text-white leading-[1.4] tracking-normal">
                UTC{selectedLocation.timezone >= 0 ? '+' : ''}{selectedLocation.timezone}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.date}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-sans text-base leading-none tracking-tight align-middle"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Chart...
            </span>
          ) : (
            'Generate My Astrological Soundtrack'
          )}
        </button>
      </form>
    </div>
  );
} 