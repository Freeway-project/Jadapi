import { Router } from 'express';
import { User } from '../models/User';
import { CreateUserSchema } from '@jadapi/types';
import { validateRequest } from '../middleware/validation';
import type { ApiResponse } from '@jadapi/types';

export const userRoutes = Router();

// GET /api/users
userRoutes.get('/', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const response: ApiResponse = {
      success: true,
      data: users,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch users',
    };
    res.status(500).json(response);
  }
});

// POST /api/users
userRoutes.post('/', validateRequest(CreateUserSchema), async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: 'User with this email already exists',
      };
      return res.status(400).json(response);
    }

    const user = new User(userData);
    await user.save();
    
    const response: ApiResponse = {
      success: true,
      data: user.toJSON(),
      message: 'User created successfully',
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create user',
    };
    res.status(500).json(response);
  }
});

// GET /api/users/:id
userRoutes.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: user.toJSON(),
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch user',
    };
    res.status(500).json(response);
  }
});