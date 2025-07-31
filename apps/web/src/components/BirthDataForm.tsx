'use client';

import React, { useState } from 'react';
import { FormData } from '../types';
import LocationAutocomplete from './LocationAutocomplete';
import { LocationResult } from '../lib/geocoding';
import { sanitizeBirthData, validateDate, validateTime, validateCoordinates } from '../lib/security';

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
    
    // Validate and sanitize all inputs
    if (!validateDate(formData.date)) {
      alert('Please enter a valid date in YYYY-MM-DD format');
      return;
    }
    
    if (!validateTime(formData.time)) {
      alert('Please enter a valid time in HH:MM format');
      return;
    }
    
    if (!validateCoordinates(formData.latitude, formData.longitude)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    // Sanitize the data before submission
    const sanitizedData = sanitizeBirthData(formData);
    onSubmit(sanitizedData);
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
    <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
      <h2 className="section-header text-xl mb-8">
        Enter Your Birth Data
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="form-input w-full"
              required
            />
          </div>
          
          <div>
            <label className="form-label">
              Birth Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="form-input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">
            Location
          </label>
          <LocationAutocomplete
            value={formData.location || ''}
            onChange={handleLocationChange}
            placeholder="Enter city or location..."
          />
        </div>

        {/* Location confirmation - simplified display */}
        {selectedLocation.name && (
          <div className="p-4 glass-morphism rounded-xl border border-emerald-500/10">
            <div className="text-center">
              <div className="text-emerald-400 text-sm mb-2">📍 Selected Location</div>
              <div className="text-white font-mystical leading-relaxed tracking-wide">
                {selectedLocation.name}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                UTC{selectedLocation.timezone >= 0 ? '+' : ''}{selectedLocation.timezone}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.date}
          className="w-full mt-8 px-8 py-4 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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