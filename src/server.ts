import cors from "@fastify/cors";
import { fastify } from "fastify";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import fastifyCookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.routes";

const Fastify = fastify({ logger: true });
Fastify.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type']
});


Fastify.decorate('authenticate', async (request, reply) => {
  try {
    const decoded = await request.jwtVerify({ onlyCookie: true });
    request.user = decoded;

  } catch (error: any) {
    console.error('Erro de autenticação:', error); 
    let errorType = 'Unauthorized';
    let message = 'Você não possui uma chave válida';

    if (error.message && error.message.includes('missing token')) {
      errorType = 'Unauthorized - Missing Token';
      message = 'Chave de autenticação ausente';
    } else if (error.name === 'TokenExpiredError') {
      errorType = 'Unauthorized - Token Expired';
      message = 'Sua chave expirou';
    } else if (error.name === 'JsonWebTokenError') {
      errorType = 'Unauthorized - Invalid Token';
      message = 'Chave inválida ou malformada';
    } else {
      errorType = 'Unauthorized - Authentication Failed';
      message = 'Falha na autenticação';
    }

    reply.status(401).send({
      error: errorType,
      message: message
    });
  }
});

Fastify.register(fastifyCookie,{secret: 'testando'})
Fastify.register(fastifyJwt, {
    secret:'testando',
    cookie: {
        cookieName:'token',
        signed: true
    }
})

Fastify.register(formbody);
Fastify.register(authRoutes)

Fastify.get("/", async (request, response) => {
  return response.status(200).send({ msg: "Hello world" });
});

Fastify.listen({
  port: 5173,
}).then(() => console.log("Server listening in port 5173"));
