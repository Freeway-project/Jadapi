import express from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { UserSchema, ApiResponse } from '@jadapi/types';

const router = express.Router();

// Validation schemas
const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateUserSchema = CreateUserSchema.partial();

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    const response: ApiResponse = {
      success: true,
      data: users
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      data: user
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validatedData = CreateUserSchema.parse(req.body);
    
    const user = new User(validatedData);
    await user.save();
    
    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: user
    };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors
      });
    }
    
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    // Validate request body
    const validatedData = UpdateUserSchema.parse(req.body);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: user
    };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors
      });
    }
    
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

export { router as userRoutes };