import bcrypt from 'bcryptjs';
import db from '../database/db';
import { User, UserDTO } from '../types/auth';

export class AuthService {
  static async createUser(username: string, password_hash: string, email?: string): Promise<UserDTO> {
    const [userId] = await db.transaction(async (trx) => {
      // Create the user with default 30 credits
      await trx('users').insert({
        username,
        password_hash,
        email: email || null,
        credits: 30,
      });

      // Get the ID of the newly created user (MySQL UUID() handled by default)
      const newUser = await trx('users').where({ username }).first();
      
      // Log initial credit grant
      await trx('credit_transactions').insert({
        user_id: newUser.id,
        amount: 30,
        balance_after: 30,
        reason: 'ADMIN_GIFT', // Initial grant treated as gift for audit
      });

      return [newUser.id];
    });

    const user = await db('users').where({ id: userId }).first();
    return this.mapToDTO(user);
  }

  static async findByUsername(username: string): Promise<User | null> {
    return db('users').where({ username }).first();
  }

  static async findById(id: string): Promise<User | null> {
    return db('users').where({ id }).first();
  }

  static mapToDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role,
    };
  }
}
