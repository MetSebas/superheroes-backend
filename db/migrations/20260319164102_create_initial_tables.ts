// db/migrations/create_initial_tables.ts

import { Knex } from 'knex';

// 1. Crear la función 'up' con los tipos correctos
export async function up(knex: Knex): Promise<void> {

    await knex.schema.dropTableIfExists('favorites');
    await knex.schema.dropTableIfExists('catsuperheroe');
    await knex.schema.dropTableIfExists('users');
   
    await knex.schema
      .createTable('users', (table: Knex.TableBuilder) => {
        table.increments('id').primary();
        table.string('nombre', 100).notNullable();
        table.string('email', 100).notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('role', 50).defaultTo('user');
      })
     
    await knex.schema
      .createTable('catsuperheroe', (table: Knex.TableBuilder) => {
        table.increments('id').primary();
        table.string('nombre', 100).notNullable().unique();
        table.string('poder', 255).notNullable();
        table.string('fortaleza', 255);
        table.string('resistencia', 255);
        table.string('debilidad', 255);
        table.string('imagen_url', 255).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
     
    await knex.schema
      .createTable('favorites', (table: Knex.TableBuilder) => {
        // Asegúrate de usar los nombres de columnas correctos para las FKs
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('superheroe_id').unsigned().notNullable().references('id').inTable('catsuperheroe').onDelete('CASCADE');
        // Clave primaria compuesta para asegurar que un héroe solo sea favorito una vez por usuario
        table.primary(['user_id', 'superheroe_id']);
      });
}

// 2. Crear la función 'down' con los tipos correctos
export async function down(knex: Knex): Promise<void> {
    // Es buena práctica eliminar las tablas en orden inverso para manejar las FKs
    await knex.schema.dropTable('favorites');
    await knex.schema.dropTable('catsuperheroe');
    await knex.schema.dropTable('users');
}
