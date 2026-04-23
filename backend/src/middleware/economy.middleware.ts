import { Response, NextFunction } from 'express';
import db from '../database/db';
import { AuthRequest } from './auth.middleware';

export const checkDailyBonus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userPayload = req.user;
    if (!userPayload) {
      next();
      return;
    }

    const userId = userPayload.id;
    const today = new Date().toISOString().split('T')[0];
    
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      next();
      return;
    }

    const lastLogin = user.last_login_date ? new Date(user.last_login_date).toISOString().split('T')[0] : null;

    if (lastLogin !== today) {
      await db.transaction(async (trx) => {
        const newCreditBalance = user.credits + 4;
        
        await trx('users')
          .where({ id: userId })
          .update({ 
            credits: newCreditBalance, 
            last_login_date: db.fn.now() // Use database timestamp
          });

        await trx('credit_transactions').insert({
          user_id: userId,
          amount: 4,
          balance_after: newCreditBalance,
          reason: 'DAILY_BONUS',
        });
      });
    }
    next();
  } catch (error) {
    console.error('Daily bonus error:', error);
    next(); // Don't block the request if bonus fails
  }
};
