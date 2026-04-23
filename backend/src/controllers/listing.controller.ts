import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ListingService } from '../services/listing.service';
import { ChatService } from '../services/chat.service';

export class ListingController {
  /**
   * GET /api/listings/feed
   */
  static async getFeed(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const feed = await ListingService.getFeed(userId);
      
      // Parse JSON images for frontend convenience
      const formattedFeed = feed.map(item => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images
      }));

      res.status(200).json(formattedFeed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Failed to fetch feed', message });
    }
  }

  /**
   * POST /api/listings/swipe
   */
  static async swipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { listingId, direction } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!listingId || !['LEFT', 'RIGHT'].includes(direction)) {
        res.status(400).json({ error: 'listingId and valid direction are required' });
        return;
      }

      await ListingService.recordSwipe(userId, listingId, direction);

      if (direction === 'RIGHT') {
        await ChatService.createAutoChat(userId, listingId);
      }

      res.status(200).json({ success: true, direction });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Failed to record swipe', message });
    }
  }

  /**
   * POST /api/listings
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, price, description, category } = req.body;
      const file = req.file;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!title || !price || !file) {
        res.status(400).json({ error: 'Title, price, and image are required' });
        return;
      }

      // Store relative path to access via static middleware
      const imageUrl = `/uploads/${file.filename}`;

      const listing = await ListingService.createListing(userId, {
        title,
        price: Number(price),
        description,
        category,
        images: [imageUrl]
      });

      // Format for frontend
      const formattedListing = {
        ...listing,
        images: typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images
      };

      res.status(201).json(formattedListing);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes('Insufficient credits') ? 403 : 500;
      res.status(status).json({ error: message });
    }
  }

  /**
   * GET /api/listings/my
   */
  static async getMyListings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const listings = await ListingService.getMyListings(userId);
      const formatted = listings.map(item => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images
      }));

      res.status(200).json(formatted);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Failed to fetch your listings', message });
    }
  }

  /**
   * PATCH /api/listings/:id/sold
   */
  static async markAsSold(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await ListingService.markAsSold(userId, id);
      res.status(200).json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Failed to update listing', message });
    }
  }
}
