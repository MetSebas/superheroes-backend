// src/models/CatSuperheroe.ts

import { Model } from 'objection';

export class CatSuperheroe extends Model {
    id!: number;
    nombre!: string;
    poder!: string;
    fortaleza!: string;
    resistencia!: string;
    debilidad!: string;
    imagen_url!: string;

    // Define el nombre de la tabla
    static get tableName() {
        return 'catsuperheroe';
    }

    // Define las columnas para validación (opcional, pero útil)
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['nombre', 'poder', 'imagen_url'],
            properties: {
                id: { type: 'integer' },
                nombre: { type: 'string', minLength: 1, maxLength: 255 },
                // ... otras propiedades
            }
        };
    }
}
