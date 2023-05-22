import { httpServer } from './src/http_server';
import { createWebSocketStream, WebSocketServer } from 'ws';
import { getMousePosition, moveMouse } from './src/services/mouse.service';
import { down, left, right, up } from '@nut-tree/nut-js';
import {
  drawCircle,
  drawRectangle,
  drawSquare,
} from './src/services/draw.service';
import { printScreen } from './src/services/screen.service';

const HTTP_PORT = 8181;
const WSS_PORT = 4000;

const wss = new WebSocketServer({ port: WSS_PORT });
httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
  console.log(`Start WebSocket server on the ${WSS_PORT} port!`);
});

wss.on('connection', async (ws) => {
  console.log('Start Websocket connection!');

  const wsStream = createWebSocketStream(ws, {
    encoding: 'utf-8',
    decodeStrings: false,
  });

  try {
    wsStream.on('data', async (chunk: any) => {
      const [command, ...args] = chunk.toString().split(' ');

      const step = Number(args[0]);
      const commandSplit = command.toString().split('_')[1];

      const width = step;
      const length = Number(args[1]);
      const radius = step;

      console.log('Command:', commandSplit, 'Step:', step);

      switch (commandSplit) {
        case 'up':
          await moveMouse(up, step);
          wsStream.write(command);
          break;

        case 'down':
          await moveMouse(down, step);
          wsStream.write(command);
          break;

        case 'left':
          await moveMouse(left, step);
          wsStream.write(command);
          break;

        case 'right':
          await moveMouse(right, step);
          wsStream.write(command);
          break;

        case 'position':
          const { x, y } = await getMousePosition();
          const result = `mouse_position ${x}px,${y}px`;
          wsStream.write(result);
          break;

        case 'rectangle':
          await drawRectangle(width, length);
          wsStream.write(command);
          break;

        case 'square':
          await drawSquare(width);
          wsStream.write(command);
          break;

        case 'circle':
          await drawCircle(radius);
          wsStream.write(command);
          break;

        case 'scrn':
          const bufferSrc = await printScreen();
          wsStream.write(bufferSrc);
          break;

        default:
          await moveMouse(up, step);
          wsStream.write(command);
          console.log('default Up');
          break;
      }
    });

    wsStream.on('error', (err: unknown) => {
      console.error((err as Error).message);
    });
  } catch (err: unknown) {
    console.error((err as Error).message);
  }
});
