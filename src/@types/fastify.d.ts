import "fastify";
import type * as http from "node:http";

declare module "fastify" {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}
