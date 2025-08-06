import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { WebSocket } from 'ws';
import { User, users } from './user';
import { port, ws_port } from './config';

async function bootstrap() {
  const server = express();
  // 覆盖默认的 response.json 方法
  server.disable("etag");
  server.disable("x-powered-by");
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );
  await app.listen(port);
}
bootstrap();

const wss = new WebSocket.Server({ port: ws_port });
export const clients: { [key: string]: { user: User, client } } = {};
wss.on("connection", async (ws, req) => {
  const user: User = JSON.parse(await users.get(req.headers["authorization"].slice(4)));
  clients[user.id] = { user, client: ws };
  ws.on("message", (m: Buffer) => {
    const msg: {
      match_id: string,
      message: string,
      channel: string,
      context: string,
      timestamp: Date,
      sender: number,
      receiver: string
    } = JSON.parse(m.toString());
    switch (msg.channel) {
      case "ping":
        ws.send(JSON.stringify({
          message: "pong",
          channel: "ping",
          context: "",
          timestamp: new Date(),
          sender: user.id,
          receiver: ""
        }));
        break;
      case "touchcard":
        clients[msg.receiver]?.client.send(JSON.stringify({
          message: msg.message,
          channel: "touchcard",
          context: msg.context,
          timestamp: new Date(),
          sender: user.id,
          receiver: msg.receiver
        }));
        break;
      case "emoji":
        clients[msg.receiver]?.client.send(JSON.stringify({
          message: msg.message,
          channel: "emoji",
          context: msg.context,
          timestamp: new Date(),
          sender: user.id,
          receiver: msg.receiver
        }));
        break;
      case "notification":
        if (msg.message == "websocketcheck") {
          clients[msg.receiver]?.client.send(JSON.stringify({
            message: "websocketcheck",
            channel: "notification",
            context: msg.context,
            timestamp: new Date(),
            sender: user.id,
            receiver: msg.receiver
          }));
        } else if (msg.message == "matchaction") {
          clients[msg.receiver]?.client.send(JSON.stringify({
            message: "matchaction",
            channel: "notification",
            context: msg.context,
            timestamp: new Date(),
            sender: user.id,
            receiver: msg.receiver
          }));
        } else if (msg.message == "im_here") {
          clients[msg.receiver]?.client.send(JSON.stringify({
            message: "im_here",
            channel: "notification",
            context: "",
            timestamp: new Date(),
            sender: user.id,
            receiver: msg.receiver
          }));
        }
        break;
    }
  })
  ws.on("close", () => {
    delete clients[user.id];
  })
});
