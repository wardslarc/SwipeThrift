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
   * Record a swipe (LEFT or RIGHT).
   */
  static async recordSwipe(userId: string, listingId: string, direction: 'LEFT' | 'RIGHT'): Promise<void> {
    await db('swipes').insert({
      user_id: userId,
      listing_id: listingId,
      direction
    }).onConflict(['user_id', 'listing_id']).ignore();
  }
}
