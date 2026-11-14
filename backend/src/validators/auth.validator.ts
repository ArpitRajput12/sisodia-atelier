import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid patron email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  firstName: z.string().min(2, 'First name is required (minimum 2 characters)'),
  lastName: z.string().min(2, 'Last name is required (minimum 2 characters)'),
  phone: z.string().optional(),
  country: z.string().default('IN'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CLIENT),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
});

