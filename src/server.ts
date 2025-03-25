import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import fastifyJwt from "@fastify/jwt";
import { fastify } from "fastify";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { verifyJwt } from "./middlewares/verifyJwt";

const Fastify = fastify({ logger: true });
Fastify.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
});

Fastify.decorate("authenticate", verifyJwt);

Fastify.register(fastifyCookie, { secret: "testando" });
Fastify.register(fastifyJwt, {
  secret: "testando",
  cookie: {
    cookieName: "token",
    signed: true,
  },
});

Fastify.register(formbody);
Fastify.register(authRoutes);
Fastify.register(userRoutes);

Fastify.get("/", async (request, response) => {
  return response.status(200).send({ msg: "Hello world" });
});

Fastify.listen({
  port: 5173,
}).then(() => console.log("Server listening in port 5173"));
