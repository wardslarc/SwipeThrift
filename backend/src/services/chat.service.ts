import db from '../database/db';

export class ChatService {
  /**
   * Create an auto-conversation and initial message for a right swipe.
   */
  static async createAutoChat(buyerId: string, listingId: string): Promise<void> {
    await db.transaction(async (trx) => {
      // 1. Get listing to find the seller
      const listing = await trx('listings').where({ id: listingId }).first();
      if (!listing) return;

      const sellerId = listing.seller_id;

      // 2. Find or create conversation
      // We use onConflict to ignore if it already exists (one convo per buyer-listing pair)
      await trx('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
        })
        .onConflict(['listing_id', 'buyer_id'])
        .ignore();

      // Get the conversation ID (whether newly created or existing)
      const convo = await trx('conversations')
        .where({ listing_id: listingId, buyer_id: buyerId })
        .first();

      // 3. Insert the automated message if there are no messages yet
      const messageCount = await trx('messages')
        .where({ conversation_id: convo.id })
        .count('id as count')
        .first();

      if (Number(messageCount?.count) === 0) {
        await trx('messages').insert({
          conversation_id: convo.id,
          sender_id: buyerId,
          text: "Hi! Is this still available?",
        });
      }
    });
  }
}
