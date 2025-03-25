import type { FastifyReply, FastifyRequest } from "fastify";

export const verifyJwt = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const decoded = await request.jwtVerify({ onlyCookie: true });
    request.user = decoded;
  } catch (error: unknown) {
    console.error("Erro de autenticação:", error);
    let errorType = "Unauthorized";
    let message = "Você não possui uma chave válida";

    if (error instanceof Error) {
      if (error.message?.includes("missing token")) {
        errorType = "Unauthorized - Missing Token";
        message = "Chave de autenticação ausente";
      } else if (error.name === "TokenExpiredError") {
        errorType = "Unauthorized - Token Expired";
        message = "Sua chave expirou";
      } else if (error.name === "JsonWebTokenError") {
        errorType = "Unauthorized - Invalid Token";
        message = "Chave inválida ou malformada";
      }
    }

    reply.status(401).send({
      error: errorType,
      message: message,
    });
  }
};
