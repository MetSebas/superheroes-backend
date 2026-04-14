import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import knex from '../../db/database';

// Importa los tipos si es necesario, pero Knex trabaja directamente con objetos JS.
// Por ahora, usamos 'any' para la estructura de la tabla si no tienes un tipo definido.
// Si tu tabla se llama 'Users', puedes usar ese tipo.
interface UserTable {
    id: number;
    nombre: string;
    email: string;
    password: string; // La contraseña siempre debe ser el hash
}

// Interfaz para la solicitud que pasa por el middleware de autenticación
interface AuthRequest extends Request {
    userId?: number;
}

/**
 * Registra un nuevo usuario usando Knex.
 */
export const register = async (req: Request, res: Response) => {
    console.log("aa", req.body);
    const { nombre, email, password } = req.body;
   
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Faltan datos requeridos (nombre, email, password)." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
       
        // 1. Insertar el nuevo usuario en la tabla 'users'
        // El .returning('*') es importante para obtener los datos del usuario recién creado,
        // pero Knex puede requerir un campo específico para el ID.
        // Asumiendo que Knex retorna un array de objetos con el ID insertado:
        const insertedUsers = await knex<UserTable>('users').insert({
            nombre: nombre,
            email: email,
            password: hashedPassword
        }).returning('*');

        if (!insertedUsers || insertedUsers.length === 0) {
            return res.status(500).json({ error: "Error al crear el usuario." });
        }

        res.status(201).json({
            message: "Usuario registrado con éxito",
            userId: insertedUsers[0]?.id
        });

    } catch (error) {
        // En Knex, los errores de duplicidad suelen ser errores de la base de datos subyacente (e.g., PostgreSQL, MySQL).
        // El código de error varía (ej: 23505 en PostgreSQL, 1062 en MySQL).
        // Se maneja como un error genérico 400 por duplicidad de email.
        console.error("Error al insertar usuario con Knex:", error);
        res.status(400).json({ error: "El email ya existe o datos inválidos." });
    }
};

/**
 * Autentica un usuario y emite un JWT usando Knex.
 */
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log("datos del login:", req.body);
    try {
        // 1. Buscar el usuario por email
        const user: UserTable | undefined = await knex<UserTable>('users')
            .where({ email })
            .first(); // .first() devuelve el primer resultado o undefined

            console.log("Usuario encontrado en login:", user);

        // 2. Verificar existencia y contraseña
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // 3. Generar un JWT
        const secret = process.env.JWT_SECRET || 'secret_key';
        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
        console.log("Token generado en login:", token);
       
        // 4. Respuesta
        res.json({ token, nombre: user.nombre });

    } catch (error) {
        console.error("Error durante el login con Knex:", error);
        res.status(500).json({ error: "Error en el servidor al intentar iniciar sesión." });
    }
};

/**
 * Actualiza el perfil del usuario actual usando Knex.
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
    // El ID del usuario se obtiene del token verificado (middleware previo)
    const userId = req.userId;
    const { nombre, email } = req.body;
   
    if (!userId) {
        return res.status(403).json({ error: "Acceso denegado. ID de usuario no encontrado." });
    }

    const updateData: { nombre?: string; email?: string } = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No se proporcionaron datos para actualizar." });
    }
   
    try {
        // 1. Ejecutar la actualización
        const rowsAffected = await knex<UserTable>('users')
            .where({ id: userId })
            .update(updateData);

        if (rowsAffected === 0) {
            return res.status(404).json({ error: "Usuario no encontrado o no se pudo actualizar." });
        }

        // 2. Opcional: Obtener el usuario actualizado para la respuesta
        const updatedUser = await knex<UserTable>('users')
            .select('id', 'nombre', 'email') // Selecciona campos SIN la contraseña
            .where({ id: userId })
            .first();

        // 3. Respuesta
        res.json({
            message: "Datos de usuario actualizados con éxito",
            user: updatedUser
        });

    } catch (error) {
        // Nuevamente, manejo de error de duplicidad de email como error 400
        console.error("Error al actualizar usuario con Knex:", error);
        res.status(400).json({ error: "No se pudo actualizar el usuario. El email podría estar ya en uso o datos inválidos." });
    }
};
