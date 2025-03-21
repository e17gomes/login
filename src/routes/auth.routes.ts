import { FastifyInstance } from "fastify";
import { registerUser, loginUser, listUsers } from "../controllers/auth.controller"


export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/register', registerUser);

  fastify.post('/login', loginUser),
    
  fastify.get("/listUsers",{onRequest: [fastify.authenticate]}, listUsers)
}  