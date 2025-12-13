// API Models/Types

export interface Sweet {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface SweetCreate {
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity?: number;
  image_url?: string;
}

export interface SweetUpdate {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  quantity?: number;
  image_url?: string;
}

export interface SweetSearch {
  name?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}