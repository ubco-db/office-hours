// chat.service.ts

import { Injectable } from '@nestjs/common';
import { ChatMessageModel } from './chatMessage.entity';

@Injectable()
export class ChatService {
  async createMessage(
    studentId: number,
    content: string,
  ): Promise<ChatMessageModel> {
    const message = ChatMessageModel.create({
      studentId,
      content,
    });

    await ChatMessageModel.save(message);
    return message;
  }

  async confirmMessage(messageId: string): Promise<void> {
    const message = await ChatMessageModel.findOne(messageId);
    if (message) {
      message.confirmed = true;
      await ChatMessageModel.save(message);
    } else {
      throw new Error(`Message with ID ${messageId} not found.`);
    }
  }
}
