import {
  registerSchema,
  loginSchema,
  UserLoginType,
} from "./../schemas/userSchema";
import { FastifyInstance } from "fastify";
import { hashPassword, validatePassword } from "../utils/hash";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const registerUser = async (fastify: FastifyInstance) => {
  fastify.post("/register", async (request, response) => {
    const parsedData = registerSchema.safeParse(request.body);
    if (!parsedData.success) {
      return response.status(500).send({ error: "Informations missing" });
    }
    const data = parsedData.data;

    const user = await prisma.user.create({
      data: {
        ...data,
        password: await hashPassword(data.password),
      } satisfies Prisma.UserCreateInput,
    });
    const { password, ...userWithoutPass } = user;
    return response
      .status(201)
      .send({ msg: "User has been created ✅", userWithoutPass });
  });
};

export const loginUser = async (fastify: FastifyInstance) => {
  fastify.post("/login", async (request, response) => {
    const loginData = request.body as UserLoginType;
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
    });
    if (!user) {
      return response.status(404).send({ error: "User not found" });
    }
    const isValidPassword = await validatePassword(
      loginData.password,
      user.password
    );
    if (!isValidPassword) {
      return response.status(401).send({ error: "Invalid credentials" });
    }
    const token = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: "1d" }
    );
    response.setCookie("token", token, {
      domain: 'localhost',
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    return response.status(200).send({ Success: "Foi paizote" });
  });
};

export const validateCookie = async (fastify:FastifyInstance) => {
  fastify.get("/validateToken" , async (request, response) => {
    console.log(request.cookies)    
    const tokenCookie = request.cookies.token 
    if (tokenCookie) {
      try {
        const decodedToken = fastify.jwt.verify(tokenCookie);
        return response.status(200).send({
          valid: true,
          user: decodedToken
        })
      } catch (error) {
        fastify.log.error(`Token verification failed ${error}`)
        return response.status(401).send({
          valid: false,
          message: "Invalid or expired token"
        })
      }

    } else {
      return response.status(401).send({
        valid: false,
        message: "Missing auth token"
      })
    }

  })
}


export const list = async(fastify: FastifyInstance) => {
  fastify.get('/list', { onRequest: [fastify.authenticate] }, async (request, response) => {
    if (!request.cookies || !request.cookies.token ) {
      return response.status(401).send({
        error: "Tomou na jabiraca"
      })
    }

    return {
      perfil: request.user,
      message: "User has been authorized"
    }
  })
}