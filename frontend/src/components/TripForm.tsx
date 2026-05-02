import React, { useState, useEffect } from 'react';
import { Trip, CreateTripData } from '../services/trip.service';

interface TripFormProps {
  onSubmit: (tripData: CreateTripData) => Promise<void>;
  onCancel: () => void;
  initialData?: Trip | null;
  isEditing?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}) => {
  const [city, setCity] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCity(initialData.city);
      setArrivalDate(new Date(initialData.arrivalDate).toISOString().split('T')[0]);
      setDescription(initialData.description || '');
      setLatitude(initialData.latitude?.toString() || '');
      setLongitude(initialData.longitude?.toString() || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!city.trim()) {
      setError('Город обязателен');
      return;
    }
    
    if (!arrivalDate) {
      setError('Дата прилёта обязательна');
      return;
    }

    setIsLoading(true);

    try {
      const tripData: CreateTripData = {
        city: city.trim(),
        arrivalDate: new Date(arrivalDate).toISOString(),
        description: description.trim() || undefined,
      };

      if (latitude.trim() && longitude.trim()) {
        tripData.latitude = parseFloat(latitude);
        tripData.longitude = parseFloat(longitude);
      }

      await onSubmit(tripData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при сохранении командировки');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>
        {isEditing ? 'Редактировать командировку' : 'Добавить командировку'}
      </h3>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="city">Город *</label>
          <input
            type="text"
            id="city"
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Например: Москва"
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalDate">Дата прилёта *</label>
          <input
            type="date"
            id="arrivalDate"
            className="form-control"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="Дополнительная информация о командировке"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="latitude">Широта (опционально)</label>
            <input
              type="number"
              id="latitude"
              className="form-control"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isLoading}
              step="any"
              placeholder="55.7558"
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="longitude">Долгота (опционально)</label>
            <input
              type="number"
              id="longitude"
              className="form-control"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isLoading}
              step="any"
              placeholder="37.6173"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={isLoading}
            style={{ background: '#6c757d', color: 'white' }}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;