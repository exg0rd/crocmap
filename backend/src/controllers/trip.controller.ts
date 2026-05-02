import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { TripModel, CreateTripInput, UpdateTripInput, TripFilter } from '../models/trip.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTrip = [
  body('city').notEmpty().withMessage('Город обязателен'),
  body('arrivalDate').isISO8601().withMessage('Некорректная дата'),
  body('description').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.userId!;
      const { city, arrivalDate, description, latitude, longitude } = req.body;

      const tripData: CreateTripInput = {
        userId,
        city,
        arrivalDate: new Date(arrivalDate),
        description,
        latitude,
        longitude,
      };

      const trip = await TripModel.create(tripData);

      res.status(201).json({
        message: 'Командировка успешно добавлена',
        trip
      });
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: 'Ошибка при добавлении командировки' });
    }
  }
];

export const getTrips = [
  query('city').optional().isString(),
  query('userId').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { city, userId, startDate, endDate } = req.query;
      
      const filters: TripFilter = {};
      
      if (city) filters.city = city as string;
      if (userId) filters.userId = userId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const trips = await TripModel.findAll(filters);

      res.json(trips);
    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({ error: 'Ошибка при получении командировок' });
    }
  }
];

export const getUserTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const trips = await TripModel.findByUserId(userId);

    res.json(trips);
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ error: 'Ошибка при получении командировок пользователя' });
  }
};

export const updateTrip = [
  body('city').optional().isString(),
  body('arrivalDate').optional().isISO8601(),
  body('description').optional().isString(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
  
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.userId!;
      const tripId = req.params.id;
      const { city, arrivalDate, description, latitude, longitude } = req.body;

      const updateData: UpdateTripInput = {};
      if (city) updateData.city = city;
      if (arrivalDate) updateData.arrivalDate = new Date(arrivalDate);
      if (description !== undefined) updateData.description = description;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;

      const updatedTrip = await TripModel.update(tripId, userId, updateData);

      if (!updatedTrip) {
        return res.status(404).json({ error: 'Командировка не найдена или у вас нет прав для ее изменения' });
      }

      res.json({
        message: 'Командировка успешно обновлена',
        trip: updatedTrip
      });
    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении командировки' });
    }
  }
];

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const tripId = req.params.id;

    const deleted = await TripModel.delete(tripId, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Командировка не найдена или у вас нет прав для ее удаления' });
    }

    res.json({ message: 'Командировка успешно удалена' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Ошибка при удалении командировки' });
  }
};

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await TripModel.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Ошибка при получении списка городов' });
  }
};