import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { userService } from "./user.service";
import { AuthRequest, ROLES, RoleName } from "../../middlewares/auth.types";
import { canDeleteUser } from "./user.types";
import {isValidName, MIN_NAME_LENGTH, keepsAtLeastOneAdmin, canDeactivateUser} from "./user.validations";

function isRoleName(value: unknown): value is RoleName {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export const userController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const users = await userService.findAll();
    res.json(users);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "El id debe ser un número" });
      return;
    }
    const user = await userService.findById(id);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json(user);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password, role } = req.body;

    if (typeof name !== "string" || !isValidName(name)) {
      res.status(400).json({
        message: `El nombre debe tener al menos ${MIN_NAME_LENGTH} letras y no puede contener números`,
      });
      return;
    }
    if (typeof lastName !== "string" || !isValidName(lastName)) {
      res.status(400).json({
        message: `El apellido debe tener al menos ${MIN_NAME_LENGTH} letras y no puede contener números`,
      });
      return;
    }
    if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ message: "El email no es válido" });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }
    if (!isRoleName(role)) {
      res.status(400).json({ message: `El rol debe ser uno de: ${ROLES.join(', ')}` });
      return;
    }

    try {
      const user = await userService.create({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res
            .status(409)
            .json({ message: "Ya existe un usuario con ese email" });
          return;
        }
        if (error.code === "P2003") {
          res.status(400).json({ message: "El rol indicado no existe" });
          return;
        }
      }
      throw error;
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "El id debe ser un número" });
      return;
    }

    const { name, lastName, email, role } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !isValidName(name))
    ) {
      res.status(400).json({
        message: `El nombre debe tener al menos ${MIN_NAME_LENGTH} letras y no puede contener números`,
      });
      return;
    }
        // Cambiarle el rol al último ADMIN deja el sistema sin administración,
    // igual que eliminarlo. Es el mismo agujero por otra vía, así que
    // aplica la misma regla.
    if (role !== undefined) {
      if (!isRoleName(role)) {
        res.status(400).json({
          message: `El rol debe ser uno de: ${ROLES.join(', ')}`,
        });
        return;
      }

      const targetRole = await userService.findRoleName(id);

      // Sólo importa si el rol nuevo NO es ADMIN: reasignarle el mismo
      // rol no cambia el conteo.
      if (targetRole === 'ADMIN' && role !== 'ADMIN') {
        const adminCount = await userService.countAdmins();
        if (!keepsAtLeastOneAdmin(true, adminCount)) {
          res.status(409).json({
            message:
              'No se puede quitar el rol de administrador al único que queda',
          });
          return;
        }
      }
    }
    
    if (
      lastName !== undefined &&
      (typeof lastName !== "string" || !isValidName(lastName))
    ) {
      res.status(400).json({
        message: `El apellido debe tener al menos ${MIN_NAME_LENGTH} letras y no puede contener números`,
      });
      return;
    }
    if (
      email !== undefined &&
      (typeof email !== "string" || !email.includes("@"))
    ) {
      res.status(400).json({ message: "El email no es válido" });
      return;
    }

    try {
      const user = await userService.update(id, {
        name: name?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim().toLowerCase(),
        role,
      });
      res.json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ message: "Usuario no encontrado" });
          return;
        }
        if (error.code === "P2002") {
          res
            .status(409)
            .json({ message: "Ya existe un usuario con ese email" });
          return;
        }
        if (error.code === "P2003") {
          res.status(400).json({ message: "El rol indicado no existe" });
          return;
        }
      }
      throw error;
    }
  },


  
    async deactivate(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    // Mismas dos reglas que el borrado: no darse de baja a uno mismo
    // ni dejar al sistema sin administradores.
    const { user } = req as AuthRequest;
    if (user && !canDeleteUser(id, user.userId)) {
      res.status(409).json({ message: 'No podés desactivar tu propio usuario' });
      return;
    }

    const targetRole = await userService.findRoleName(id);
    if (targetRole === null) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (targetRole === 'ADMIN') {
      const adminCount = await userService.countAdmins();
      if (!keepsAtLeastOneAdmin(true, adminCount)) {
        res.status(409).json({
          message: 'No se puede desactivar al único administrador del sistema',
        });
        return;
      }
    }

    // La regla de la cátedra: las entradas ya usadas son historial y no
    // bloquean; las que todavía no se usaron, sí.
    const unusedTickets = await userService.countUnusedTickets(id);
    if (!canDeactivateUser(unusedTickets)) {
      res.status(409).json({
        message:
          'No se puede desactivar un usuario con entradas pendientes de activar asociadas',
      });
      return;
    }

    const updated = await userService.deactivate(id);
    res.json(updated);
  },

  /** Revierte la baja lógica. */
  async activate(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    try {
      const updated = await userService.activate(id);
      res.json(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      throw error;
    }
  },

};
