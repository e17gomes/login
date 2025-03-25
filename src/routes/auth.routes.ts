import type { FastifyInstance } from "fastify";
import { registerUser, loginUser, validateUser } from "../controllers/auth.controller"


export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/register', registerUser);

  fastify.post('/login', loginUser);

  fastify.get('/validate', validateUser)
  
}  