import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";

export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userList = await prisma.user.findMany();
    const userListWithoutDangerInfos = userList.map((user) => {
      const { password, role, id, ...safeDataUser } = user;
      return safeDataUser;
    });

    return reply.status(200).send({
      users: userListWithoutDangerInfos,
    });
  } catch (error) {
    return reply.status(500).send({
      error: "Error fetching users",
      message: `Internal error: ${error}`,
    });
  }
};
