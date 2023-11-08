import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { studentId: number; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Save the message and emit an event to the student
    const message = await this.chatService.createMessage(
      data.studentId,
      data.content,
    );
    client.to(String(data.studentId)).emit('receive_message', message);
  }

  @SubscribeMessage('confirm_message')
  async handleConfirmation(
    @MessageBody() messageId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Handle the message confirmation
    await this.chatService.confirmMessage(messageId);
    client.emit('message_confirmed', messageId);
  }
}
