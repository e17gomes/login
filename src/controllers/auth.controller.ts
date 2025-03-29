import type { FastifyReply, FastifyRequest } from "fastify";
import { type UserLoginType, registerSchema } from "../dto/user.dto";
import prisma from "../lib/prisma";
import { hashPassword, validatePassword } from "../utils/hash";

export const registerUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const parsedData = registerSchema.safeParse(request.body);

  if (!parsedData.success) {
    return reply.status(401).send({ error: "Information missing" });
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.data?.email },
    });

    if (existingUser) {
      return reply
        .status(409)
        .send({ error: "This email is already been used" });
    }
    const hashedPassword = await hashPassword(parsedData.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsedData.data.email,
        name: parsedData.data.name,
        password: hashedPassword,
        role: parsedData.data.role,
      },
    });
    const { password, role, updateAt, ...userWoutP } = user;
    return reply.status(200).send({ msg: "User has been created!", userWoutP });
  } catch (error) {
    return reply.status(500).send({
      error: "Error on register user",
      msg: `Internal error ${error}`,
    });
  }
};

export const loginUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const userPayload = (await request.body) as UserLoginType;
  const userRegistered = await prisma.user.findUnique({
    where: { email: userPayload.email },
  });

  if (!userRegistered) {
    return reply.status(404).send({ error: "The user doesnt exists" });
  }

  const validPassword = await validatePassword(
    userPayload.password,
    userRegistered.password
  );

  const token = request.server.jwt.sign(
    { id: userRegistered.id, email: userRegistered.email },
    { expiresIn: "1h" }
  );

  if (!validPassword) {
    return reply.status(401).send({ error: "Password is wrong" });
  }
  if (userRegistered.isActive !== true) {
    return reply.status(400).send({ error: "This user is banned" });
  }

  if (
    userPayload.email === userRegistered.email &&
    validPassword &&
    userRegistered.isActive === true
  ) {
    reply.setCookie("token", token, {
      domain: "localhost", // env here
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      signed: true,
    });
    return reply.status(200).send({ msg: "Welcome back" });
  }
};

export const validateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.cookies.token;
  if (!token) {
    return reply.status(401).send({ error: "Unauthorized pq n tem token" });
  }

  try {
    const verifyToken = await request.jwtVerify({ onlyCookie: true });
    request.user = verifyToken;
    return reply
      .status(200)
      .send({ msg: "Token is valid", user: request.user });
  } catch (error) {
    return reply
      .status(401)
      .send({ error: "Unauthorized pq o token ta errado" });
  }
};
