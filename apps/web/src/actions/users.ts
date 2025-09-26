'use server';

import { CreateUserInput, ApiResponse } from '@jadapi/types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function createUser(userData: CreateUserInput): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result: ApiResponse = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to communicate with the API',
    };
  }
}

export async function getUsers(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch users',
    };
  }
}