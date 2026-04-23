import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('username', 50).unique().notNullable();
    table.string('email', 255).unique().nullable();
    table.string('password_hash', 255).notNullable();
    table.integer('credits').notNullable().defaultTo(30);
    table.enum('role', ['user', 'admin']).notNullable().defaultTo('user');
    table.date('last_login_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('credit_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('user_id').notNullable();
    table.integer('amount').notNullable();
    table.integer('balance_after').notNullable();
    table.enum('reason', ['DAILY_BONUS', 'POST_FEE', 'ADMIN_GIFT']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('credit_transactions');
  await knex.schema.dropTableIfExists('users');
}
