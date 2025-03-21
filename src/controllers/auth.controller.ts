import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { registerSchema, UserLoginType } from "../schemas/userSchema";
import { hashPassword, validatePassword } from "../utils/hash";

const prisma = new PrismaClient();

export const registerUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const parsedData = registerSchema.safeParse(request.body);

  if (!parsedData.success) {
    return reply.status(401).send({ error: "Informations missing" });
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
    return reply
      .status(500)
      .send({
        error: "Error on register user",
        msg: " Internal error" + error,
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

  const validPassword = validatePassword(
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
      return reply.status(400).send({error: "This user is banned"})
    } 

  if (userPayload.email == userRegistered.email && !!validPassword && userRegistered.isActive === true) {
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

export const listUsers = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const userList = await prisma.user.findMany();
    const userListWithoutDangerInfos = userList.map((user) => { const { password, role, id, ...safeDataUser  } = user; return safeDataUser})

    return {
      users: userListWithoutDangerInfos
  };
};
