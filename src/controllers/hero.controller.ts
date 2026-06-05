import { Request, Response } from 'express';
// Importamos la instancia de Knex configurada
import knex from '../../db/database';

// Definiciones de tipos (ayudan a la seguridad de tipo con Knex)
interface CatSuperheroe {
    id: number;
    nombre: string;
    poder: string;
    fortaleza?: string;
    resistencia?: string;
    debilidad?: string;
    imagen_url: string;
    // Otros campos de la tabla
}

interface Favorite {
    user_id: number; // Knex usa snake_case para FKs por convención SQL
    superheroe_id: number;
}

// Interfaz para la solicitud que pasa por el middleware de autenticación
interface AuthRequest extends Request {
    userId?: number;
    heroId?: number;
}

// Obtener catálogo completo (Para el Grid general)
export const getCatalog = async (req: Request, res: Response) => {
    try {
        console.log("Obteniendo catálogo de superhéroes...");
        // Consulta Knex: SELECT * FROM catsuperheroe ORDER BY nombre ASC LIMIT 12
        const heroes: CatSuperheroe[] = await knex<CatSuperheroe>('catsuperheroe')
            .limit(12) // Trae 12 registros por defecto para llenar el grid
            .orderBy('nombre', 'asc');
           
        res.json(heroes);
    } catch (error) {
        console.error("Error al obtener catálogo:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener el catálogo." });
    }
};

// Agregar a favoritos
export const addFavorite = async (req: AuthRequest, res: Response) => {
    // Usamos req.userId que viene del middleware de autenticación
    const userId = req.userId;
    // heroId es el ID del superhéroe
    const { heroId } = req.body;

    if (!userId) {
        return res.status(403).json({ error: "No autorizado. Usuario no logeado." });
    }
    if (!heroId) {
        return res.status(400).json({ error: "Se requiere el ID del héroe." });
    }

    try {
        // Consulta Knex: INSERT INTO favorites (user_id, superheroe_id) VALUES (userId, heroId)
        await knex<Favorite>('favorites').insert({
            user_id: userId,
            superheroe_id: heroId
        });
       
        res.json({ message: "Héroe agregado a favoritos" });
    } catch (error) {
        // Manejar error de duplicidad (e.g., ya existe la pareja userId/heroId)
        res.status(400).json({ error: "Error al agregar o el héroe ya está en favoritos." });
    }
};

// Obtener SOLO los favoritos del usuario logueado
export const getMyFavorites = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
 
    if (!userId) {
        return res.status(403).json({ error: "No autorizado. Usuario no logeado." });
    }

    try {
        // Consulta Knex con JOIN:
        // SELECT c.* FROM catsuperheroe c JOIN favorites f ON c.id = f.superheroe_id WHERE f.user_id = userId
        const heroes: CatSuperheroe[] = await knex('catsuperheroe as c')
            .select('c.*') // Selecciona todos los campos del superhéroe
            .join('favorites as f', 'c.id', '=', 'f.superheroe_id') // JOIN con la tabla de favoritos
            .where('f.user_id', userId);
       
        res.json(heroes);
       
    } catch (error) {
        console.error("Error al obtener favoritos:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener tus favoritos." });
    }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { heroId } = req.params.id ? { heroId: parseInt(req.params.id as string) } : { heroId: undefined };
   
    if (!userId) {
        return res.status(403).json({ error: "No autorizado. Usuario no logeado." });
    }  
    if (!heroId) {
        return res.status(400).json({ error: "Se requiere el ID del héroe." });
    }
    try {
        // Consulta Knex: DELETE FROM favorites WHERE user_id = userId AND superheroe_id = heroId
        const rowsDeleted = await knex<Favorite>('favorites')
            .where({ user_id: userId, superheroe_id: heroId })
            .del();
        if (rowsDeleted === 0) {
            return res.status(404).json({ error: "El héroe no estaba en tus favoritos." });
        }
        res.status(200).json({ message: "Héroe eliminado de favoritos." });
    } catch (error) {  
    }
};

// Crear Superhéroe
export const createHero = async (req: Request, res: Response) => {
    const { nombre, poder, fortaleza, resistencia, debilidad } = req.body;

    const imagen_url = req.file ? req.file.filename : null;

    if (!nombre || !poder || !imagen_url) {
        return res.status(400).json({ error: "Faltan datos obligatorios (nombre, poder, imagen_url)." });
    }

    try {
        // Consulta Knex: INSERT INTO catsuperheroe (...) VALUES (...) RETURNING *
        const [newHero] = await knex<CatSuperheroe>('catsuperheroe').insert({
            nombre,
            poder,
            fortaleza,
            resistencia,
            debilidad,
            imagen_url
        }).returning('*'); // Retorna el registro insertado

        res.status(201).json({
            message: "Superhéroe creado con éxito",
            hero: newHero
        });
    } catch (error) {
        console.error("Error al crear el superhéroe:", error);
        res.status(500).json({ error: "Error interno del servidor al crear el superhéroe." });
    }
};

// Actualizar Superhéroe
export const updateHero = async (req: Request, res: Response) => {
    const heroId = parseInt(req.params.id as string);
    const dataToUpdate = req.body;

    if (isNaN(heroId)) {
        return res.status(400).json({ error: "ID de superhéroe inválido." });
    }

    try {
        // Consulta Knex: UPDATE catsuperheroe SET dataToUpdate WHERE id = heroId
        const rowsAffected = await knex('catsuperheroe')
            .where({ id: heroId })
            .update(dataToUpdate);

        if (rowsAffected === 0) {
            return res.status(404).json({ error: `Superhéroe con ID ${heroId} no encontrado.` });
        }

        // Recuperar el registro actualizado
        const updatedHero = await knex<CatSuperheroe>('catsuperheroe').where({ id: heroId }).first();

        res.json({
            message: "Datos del superhéroe actualizados con éxito",
            hero: updatedHero
        });
    } catch (error) {
        console.error("Error al actualizar el superhéroe:", error);
        res.status(400).json({ error: "Datos inválidos para la actualización." });
    }
};

// Eliminar Superhéroe
export const deleteHero = async (req: Request, res: Response) => {
    const heroId = parseInt(req.params.id as string);

    console.log("Se eliminara el heroe con id:", heroId);
    if (isNaN(heroId)) {
        return res.status(400).json({ error: "ID de superhéroe inválido." });
    }

    try {
        // Usamos una transacción para asegurar que ambas eliminaciones (favoritos y héroe) tengan éxito o fallen juntas.
        await knex.transaction(async (trx) => {
            // 1. Eliminar de la tabla de favoritos (DELETE FROM favorites WHERE superheroe_id = heroId)
            const favoritesDeleted = await trx('favorites')
                .where({ superheroe_id: heroId })
                .del();

            // 2. Eliminar de la tabla de catálogo (DELETE FROM catsuperheroe WHERE id = heroId)
            const heroesDeleted = await trx('catsuperheroe')
                .where({ id: heroId })
                .del();

            if (heroesDeleted === 0) {
                // Si el héroe no se encuentra, la transacción hará rollback.
                throw new Error("HeroeNotFound");
            }
        });

        res.json({
            message: `Superhéroe con ID ${heroId} y sus referencias han sido eliminados con éxito.`
        });
       
    } catch (error) {
        if (error instanceof Error && error.message === "HeroeNotFound") {
            return res.status(404).json({ error: `Superhéroe con ID ${heroId} no encontrado.` });
        }
        console.error("Error al eliminar el superhéroe:", error);
        res.status(500).json({ error: "Error interno del servidor al eliminar el superhéroe." });
    }
};
