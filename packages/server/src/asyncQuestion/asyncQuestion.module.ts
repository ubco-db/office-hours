import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { asyncQuestionController } from './asyncQuestion.controller';
import { asyncQuestionService } from './asyncQuestion.service';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [asyncQuestionController],
  providers: [asyncQuestionService],
  imports: [NotificationModule, MailModule],
  exports: [asyncQuestionService],
})
export class asyncQuestionModule {}
