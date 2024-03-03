import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { config } from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
@Global() // 👈 global module
@Module({
  controllers: [MailController],
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
