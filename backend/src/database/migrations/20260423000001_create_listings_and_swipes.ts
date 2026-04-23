import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('listings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('seller_id').notNullable();
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('category', 50).nullable();
    table.enum('status', ['ACTIVE', 'SOLD', 'DELETED']).defaultTo('ACTIVE');
    table.json('images').notNullable(); // Array of image URLs (MVP uses 1)
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('seller_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['seller_id', 'status']);
  });

  await knex.schema.createTable('swipes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('user_id').notNullable();
    table.uuid('listing_id').notNullable();
    table.enum('direction', ['LEFT', 'RIGHT']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'listing_id']);
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('listing_id').references('id').inTable('listings').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('swipes');
  await knex.schema.dropTableIfExists('listings');
}
