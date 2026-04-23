import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('conversations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('listing_id').notNullable();
    table.uuid('buyer_id').notNullable();
    table.uuid('seller_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['listing_id', 'buyer_id']);
    table.foreign('listing_id').references('id').inTable('listings').onDelete('CASCADE');
    table.foreign('buyer_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('seller_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('conversation_id').notNullable();
    table.uuid('sender_id').notNullable();
    table.text('text').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
    table.foreign('sender_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['conversation_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversations');
}
