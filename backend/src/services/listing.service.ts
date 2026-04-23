import db from '../database/db';

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  status: 'ACTIVE' | 'SOLD' | 'DELETED';
  images: string; // JSON string
  created_at: Date;
}

export class ListingService {
  /**
   * Fetch a feed of 10 items that the user has not swiped on yet.
   * Excludes the user's own listings.
   */
  static async getFeed(userId: string): Promise<Listing[]> {
    return db('listings')
      .where({ status: 'ACTIVE' })
      .whereNot('seller_id', userId) // Don't show your own stuff
      .whereNotIn('id', function() {
        this.select('listing_id').from('swipes').where({ user_id: userId });
      })
      .orderByRaw('RAND()') // Random discovery
      .limit(10);
  }

  /**
   * Create a new listing and deduct 20 credits from the seller.
   */
  static async createListing(sellerId: string, data: { title: string; price: number; description?: string; category?: string; images: string[] }): Promise<Listing> {
    return db.transaction(async (trx) => {
      // 1. Check if user has enough credits (20)
      const user = await trx('users').where({ id: sellerId }).first();
      if (!user || user.credits < 20) {
        throw new Error('Insufficient credits. You need 20 credits to post a listing.');
      }

      // 2. Create the listing
      await trx('listings').insert({
        seller_id: sellerId,
        title: data.title,
        price: data.price,
        description: data.description || null,
        category: data.category || null,
        images: JSON.stringify(data.images),
        status: 'ACTIVE'
      });

      // Get the newly created listing
      const newListing = await trx('listings')
        .where({ seller_id: sellerId, title: data.title })
        .orderBy('created_at', 'desc')
        .first();

      // 3. Deduct credits
      const newBalance = user.credits - 20;
      await trx('users').where({ id: sellerId }).update({ credits: newBalance });

      // 4. Log transaction
      await trx('credit_transactions').insert({
        user_id: sellerId,
        amount: -20,
        balance_after: newBalance,
        reason: 'POST_FEE',
      });

      return newListing;
    });
  }

  /**
   * Fetch listings belonging to a specific seller.
   */
  static async getMyListings(sellerId: string): Promise<Listing[]> {
    return db('listings').where({ seller_id: sellerId }).orderBy('created_at', 'desc');
  }

  /**
   * Toggle listing status to SOLD.
   */
  static async markAsSold(userId: string, listingId: string): Promise<void> {
    await db('listings')
      .where({ id: listingId, seller_id: userId })
      .update({ status: 'SOLD' });
  }
}
