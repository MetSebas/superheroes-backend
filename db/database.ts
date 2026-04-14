// src/database.ts

import knex from 'knex';
// Importamos el archivo de configuración completo
import knexConfig from '../knexfile';
import { Knex } from 'knex';

// 1. Determinar el entorno
const environment = process.env.NODE_ENV || 'development';

// 2. Obtener la configuración específica para ese entorno
const config: Knex.Config | undefined = knexConfig[environment];

// 3. Verificar que la configuración exista y lanzar un error si no es así
if (!config) {
    throw new Error(`¡Error! La configuración de Knex para el entorno '${environment}' no fue encontrada en knexfile.ts.`);
}

// 4. Inicializar y exportar la instancia de Knex
// Aquí, TypeScript ya sabe que 'config' es de tipo Knex.Config y no undefined.
export default knex(config);
