import cors from "@fastify/cors";
import { fastify } from "fastify";
import { list, loginUser, registerUser, validateCookie } from "./routes/auth.routes";
import fastifyJwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import fastifyCookie from "@fastify/cookie";

const Fastify = fastify({ logger: true });
Fastify.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
});

Fastify.decorate('authenticate', async (request, reply) => {
  const cookieToken = request.cookies.token
  console.log(cookieToken)
  try {
    const decoded = await request.jwtVerify({onlyCookie: true})
    request.user = decoded
  } catch (error) {
    reply.status(401).send({error: "Unauthorized" + error, message: "You don't have a key"})
  }
})

Fastify.register(fastifyCookie,{secret: 'testando'})
Fastify.register(fastifyJwt, {
    secret:'testando',
    cookie: {
        cookieName:'token',
        signed: true
    }
})
Fastify.register(formbody);
Fastify.register(registerUser)
Fastify.register(loginUser)
Fastify.register(validateCookie)
Fastify.register(list)

Fastify.get("/", async (request, response) => {
  return response.status(200).send({ msg: "Hello world" });
});

Fastify.listen({
  port: 5173,
}).then(() => console.log("Server listening in port 5173"));
