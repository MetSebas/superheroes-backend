// knexfile.js
import type { Knex } from 'knex';

// Configuración base de Knex
const config: { [key: string]: Knex.Config } = {
  // =======================================================
  // Ambiente de Desarrollo (npm run migrate, npm run seed)
  // =======================================================
  development: {
    client: 'pg', // O 'mysql', 'mssql', 'sqlite3', etc.
    connection: {
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT as string),
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME,
    },
    // Directorios donde Knex buscará archivos
    migrations: {
      directory: './db/migrations', // Archivos para crear tablas (e.g., users, catsuperheroe)
      tableName: 'knex_migrations',  // Tabla para rastrear migraciones
      extension: 'ts' // Asume que tus migraciones son archivos .ts
    },
    seeds: {
      directory: './db/seeds', // Archivos para poblar datos iniciales (e.g., superHeroesData)
      extension: 'ts' // Asume que tus seeders son archivos .ts
    },
    // Desactivar transacciones en modo de desarrollo si no son necesarias
    pool: {
      min: 2,
      max: 10
    }
  },

  // =======================================================
  // Ambiente de Producción (Usar URLs de conexión más seguras)
  // =======================================================
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL as string, // Usar una URL completa de conexión (más seguro en Prod)
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './db/seeds',
      extension: 'ts'
    }
  }
};

export default config;
