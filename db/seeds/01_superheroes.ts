// seeds/01_superheroes.ts (o la ruta que uses para tus seeds de Knex)

import { Knex } from 'knex';

// ----------------------------------------------------
// 1. Datos de Semilla (La lista de Superhéroes)
// ----------------------------------------------------

const superHeroesData = [
    {
        nombre: 'Superman',
        poder: 'Vuelo, Súper Fuerza, Visión de calor',
        fortaleza: 'Sol Amarillo',
        resistencia: 'Extremadamente alta',
        debilidad: 'Kryptonita',
        imagen_url: 'Superman.png'
    },
    {
        nombre: 'Wonder Woman',
        poder: 'Fuerza sobrehumana, Vuelo, Lazo de la Verdad',
        fortaleza: 'Su voluntad y su entrenamiento',
        resistencia: 'Muy alta',
        debilidad: 'Armas punzantes (anteriormente)',
        imagen_url: 'Wonder-Woman.png'
    },
    {
        nombre: 'Batman',
        poder: 'Intelecto de genio, Maestría en combate',
        fortaleza: 'Su preparación y gadgets',
        resistencia: 'Humana máxima',
        debilidad: 'Mortalidad y traumas',
        imagen_url: 'Batman.png'
    },
    {
        nombre: 'Flash (Barry Allen)',
        poder: 'Súper Velocidad, Capacidad de vibrar a través de la materia',
        fortaleza: 'La Speed Force',
        resistencia: 'Acelerada',
        debilidad: 'Frío extremo',
        imagen_url: 'Flash.png'
    },
    {
        nombre: 'Spider-Man (Peter Parker)',
        poder: 'Fuerza y agilidad proporcionales a una araña, Sentido arácnido',
        fortaleza: 'Su sentido arácnido y lanzaredes',
        resistencia: 'Alta',
        debilidad: 'Ciertos sonidos de alta frecuencia',
        imagen_url: 'Spider-Man.png'
    },
    {
        nombre: 'Iron Man (Tony Stark)',
        poder: 'Genio multimillonario, Armadura avanzada',
        fortaleza: 'Su inteligencia y recursos',
        resistencia: 'La de su armadura',
        debilidad: 'Su ego y dependencia de la armadura',
        imagen_url: 'Ironman.png'
    },

    // Puedes añadir más héroes aquí...
];

// ----------------------------------------------------
// 2. Funciones de Knex para Seed
// ----------------------------------------------------

/**
 * Función que inserta los datos. Es requerida por Knex.
 * @param knex Instancia de Knex
 */
export async function seed(knex: Knex): Promise<void> {
    const TABLE_NAME = 'catsuperheroe';

    // Borra *TODOS* los registros existentes de la tabla antes de insertar
    await knex(TABLE_NAME).del();

    // Inserta los nuevos datos
    await knex(TABLE_NAME).insert(superHeroesData);
   
    console.log(` ${superHeroesData.length} Superhéroes insertados en la tabla '${TABLE_NAME}'.`);
}