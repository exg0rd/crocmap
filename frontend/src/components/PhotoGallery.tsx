import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Photo {
  id: string;
  tripId: string;
  filename: string;
  url: string;
  caption?: string | null;
  createdAt: string;
}

interface PhotoGalleryProps {
  tripId: string;
  tripCity: string;
  onClose: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ tripId, tripCity, onClose }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, [tripId]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/trips/${tripId}/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPhotos(response.data);
    } catch (err: any) {
      console.error('Error loading photos:', err);
      setError('Ошибка при загрузке фото');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_URL}/trips/${tripId}/photos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPhotos([...response.data.photos, ...photos]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке фото');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это фото?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/trips/${tripId}/photos/${photoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setError('Ошибка при удалении фото');
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>Фото командировки: {tripCity}</h3>
        <button 
          onClick={onClose}
          className="btn"
          style={{ background: '#6c757d', color: 'white' }}
        >
          Закрыть
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <label htmlFor="photo-upload">
          <span className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {isUploading ? 'Загрузка...' : '+ Добавить фото'}
          </span>
        </label>
      </div>

      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : photos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Нет фотографий. Добавьте первое фото!
        </p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          {photos.map(photo => (
            <div 
              key={photo.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img 
                src={photo.url} 
                alt={photo.caption || 'Фото командировки'}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover' 
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                }}
              />
              {photo.caption && (
                <p style={{ 
                  padding: '8px', 
                  margin: 0, 
                  fontSize: '14px',
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }}>
                  {photo.caption}
                </p>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
