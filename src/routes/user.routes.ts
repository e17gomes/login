import type { FastifyInstance } from "fastify";
import { getAllUsers } from "../controllers/user.controller";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/users", { onRequest: [fastify.authenticate] }, getAllUsers);
};
