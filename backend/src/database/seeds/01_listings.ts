import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing listings
  await knex('listings').del();

  // Need to get an existing user ID (admin or any user created)
  const user = await knex('users').first();
  if (!user) {
    console.warn('No user found for seeding listings. Run migration first and create a user.');
    return;
  }

  // Deleting any existing data
  await knex('listings').insert([
    {
      seller_id: user.id,
      title: 'Vintage Denim Jacket',
      description: 'Well-worn denim jacket, classic fit.',
      price: 45.00,
      category: 'Clothing',
      images: JSON.stringify(['https://images.unsplash.com/photo-1576905355166-3005ca461182?auto=format&fit=crop&q=80&w=400']),
      status: 'ACTIVE'
    },
    {
      seller_id: user.id,
      title: 'Polaroid OneStep 2',
      description: 'Like new, works perfectly.',
      price: 120.00,
      category: 'Electronics',
      images: JSON.stringify(['https://images.unsplash.com/photo-1526170315873-3a561629923e?auto=format&fit=crop&q=80&w=400']),
      status: 'ACTIVE'
    },
    {
      seller_id: user.id,
      title: 'Wooden Side Table',
      description: 'Mid-century modern style, oak finish.',
      price: 85.00,
      category: 'Furniture',
      images: JSON.stringify(['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400']),
      status: 'ACTIVE'
    },
    {
      seller_id: user.id,
      title: 'Classic Skateboard',
      description: 'Used for a week, perfect for beginners.',
      price: 35.00,
      category: 'Sports',
      images: JSON.stringify(['https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=400']),
      status: 'ACTIVE'
    }
  ]);
}
