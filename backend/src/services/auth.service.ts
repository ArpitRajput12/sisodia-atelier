import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/apiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';

export class AuthService {
  /**
   * Patron Registration
   */
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
    role?: UserRole;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('A patron account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.CLIENT,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  /**
   * Patron / Staff Sign In
   */
  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Renew expired access token using refresh token
   */
  static async refresh(token: string) {
    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token. Please sign in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found.');
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { accessToken: newAccessToken };
  }

  /**
   * Sign out
   */
  static async logout(_token: string) {
    return;
  }

  /**
   * Get authenticated patron profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Patron account not found.');
    }

    return user;
  }

  /**
   * Update patron profile details
   */
  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
    }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Change patron password
   */
  static async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password provided is incorrect.');
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password updated successfully. Please sign in with your new password.' };
  }
}
