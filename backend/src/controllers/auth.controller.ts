import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';

export const register = [
  body('fullName').notEmpty().withMessage('ФИО обязательно'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fullName, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByFullName(fullName);
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким ФИО уже существует' });
      }

      // Create new user
      const user = await UserModel.create({ fullName, password });

      // Generate token
      const token = generateToken({ userId: user.id, fullName: user.fullName });

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Ошибка при регистрации' });
    }
  }
];

export const login = [
  body('fullName').notEmpty().withMessage('ФИО обязательно'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fullName, password } = req.body;

      // Find user
      const user = await UserModel.findByFullName(fullName);
      if (!user) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      // Validate password
      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      // Generate token
      const token = generateToken({ userId: user.id, fullName: user.fullName });

      res.json({
        message: 'Вход выполнен успешно',
        user: {
          id: user.id,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка при входе' });
    }
  }
];

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};