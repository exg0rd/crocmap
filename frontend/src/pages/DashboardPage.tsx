import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import TripForm from '../components/TripForm';
import tripService, { Trip, CreateTripData, TripFilters } from '../services/trip.service';
import authService from '../services/auth.service';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<TripFilters>({});
  const [cityFilter, setCityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cityFilter, userFilter, startDateFilter, endDateFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tripsData, usersData, citiesData] = await Promise.all([
        tripService.getTrips(),
        authService.getUsers(),
        tripService.getCities(),
      ]);
      
      setTrips(tripsData);
      setUsers(usersData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilters: TripFilters = {};
    
    if (cityFilter) newFilters.city = cityFilter;
    if (userFilter) newFilters.userId = userFilter;
    if (startDateFilter) newFilters.startDate = startDateFilter;
    if (endDateFilter) newFilters.endDate = endDateFilter;
    
    setFilters(newFilters);
  };

  const handleCreateTrip = async (tripData: CreateTripData) => {
    await tripService.createTrip(tripData);
    setShowTripForm(false);
    loadData();
  };

  const handleUpdateTrip = async (tripData: CreateTripData) => {
    if (editingTrip) {
      await tripService.updateTrip(editingTrip.id, tripData);
      setEditingTrip(null);
      loadData();
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту командировку?')) {
      await tripService.deleteTrip(tripId);
      loadData();
    }
  };

  const handleMarkerClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredTrips = trips.filter(trip => {
    if (filters.city && !trip.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.userId && trip.userId !== filters.userId) {
      return false;
    }
    if (filters.startDate && new Date(trip.arrivalDate) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(trip.arrivalDate) > new Date(filters.endDate)) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px 0',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Карта командировок</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Добро пожаловать, {user?.fullName}!
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Выйти
        </button>
      </header>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Main content */}
        <div style={{ flex: 3 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2>Карта России с командировками</h2>
            <button 
              onClick={() => setShowTripForm(true)} 
              className="btn btn-primary"
            >
              + Добавить командировку
            </button>
          </div>

          {showTripForm && (
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setShowTripForm(false)}
            />
          )}

          {editingTrip && (
            <TripForm
              onSubmit={handleUpdateTrip}
              onCancel={() => setEditingTrip(null)}
              initialData={editingTrip}
              isEditing={true}
            />
          )}

          <div style={{ marginTop: '20px' }}>
            <MapComponent 
              trips={filteredTrips} 
              onMarkerClick={handleMarkerClick}
            />
          </div>

          {selectedTrip && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3>Выбранная командировка</h3>
              <p><strong>Город:</strong> {selectedTrip.city}</p>
              <p><strong>Сотрудник:</strong> {selectedTrip.user.fullName}</p>
              <p><strong>Дата прилёта:</strong> {format(new Date(selectedTrip.arrivalDate), 'dd MMMM yyyy', { locale: ru })}</p>
              {selectedTrip.description && (
                <p><strong>Описание:</strong> {selectedTrip.description}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  onClick={() => {
                    setEditingTrip(selectedTrip);
                    setSelectedTrip(null);
                  }}
                  className="btn btn-primary"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDeleteTrip(selectedTrip.id)}
                  className="btn btn-danger"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with filters */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Фильтры</h3>
            
            <div className="form-group">
              <label htmlFor="cityFilter">Город</label>
              <select
                id="cityFilter"
                className="form-control"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">Все города</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="userFilter">Сотрудник</label>
              <select
                id="userFilter"
                className="form-control"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">Все сотрудники</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDateFilter">Дата с</label>
              <input
                type="date"
                id="startDateFilter"
                className="form-control"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDateFilter">Дата по</label>
              <input
                type="date"
                id="endDateFilter"
                className="form-control"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>

            <button 
              onClick={() => {
                setCityFilter('');
                setUserFilter('');
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              className="btn"
              style={{ width: '100%', background: '#6c757d', color: 'white' }}
            >
              Сбросить фильтры
            </button>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Список командировок ({filteredTrips.length})</h3>
            
            {filteredTrips.length === 0 ? (
              <p>Нет командировок</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredTrips.map(trip => (
                  <div 
                    key={trip.id} 
                    style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      backgroundColor: selectedTrip?.id === trip.id ? '#f0f8ff' : 'transparent'
                    }}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {trip.city}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                      {trip.user.fullName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {format(new Date(trip.arrivalDate), 'dd.MM.yyyy', { locale: ru })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;