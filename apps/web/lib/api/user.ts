import { apiClient } from './client';

export interface UserData {
  _id: string;
  uuid: string;
  accountType: 'individual' | 'business';
  email?: string;
  phone?: string;
  auth?: {
    email?: string;
    phone?: string;
  };
  profile?: {
    name: string;
    address?: string;
  };
  businessProfile?: {
    businessName?: string;
    gstNumber?: string;
  };
  roles: string[];
  status: string;
}

export interface SearchUserResponse {
  user: UserData;
}

export const userAPI = {
  /**
   * Get user by UUID (unique identifier like roll number)
   */
  getUserByUuid: async (uuid: string): Promise<UserData> => {
    const response = await apiClient.get(`/users/uuid/${uuid}`);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserData> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};
