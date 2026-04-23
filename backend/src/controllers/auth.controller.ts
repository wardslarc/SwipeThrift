import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const existingUser = await AuthService.findByUsername(username);
      if (existingUser) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await AuthService.createUser(username, passwordHash, email);

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Internal server error', message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const user = await AuthService.findByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({
        user: AuthService.mapToDTO(user),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Internal server error', message });
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(AuthService.mapToDTO(user));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
}
