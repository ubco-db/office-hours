// import { Test, TestingModule } from '@nestjs/testing';
// import { ProfileController } from '../profile/profile.controller';
// import { SignupController } from '../signup/signup.controller';
// import { ProfileService } from '../profile/profile.service';
// import { SignupService } from '../signup/signup.service';
// import { NotificationService } from '../notification/notification.service';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { MailService } from 'mail/mail.service';
// import { Connection } from 'typeorm';
// import { UBCOuserParam } from '@koh/common';
// import { LoginCourseService } from 'login/login-course.service';
// import { TwilioService } from 'notification/twilio/twilio.service';

describe('Controllers Tests', () => {
  // let profileController: ProfileController;
  // let signupController: SignupController;

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   controllers: [ProfileController, SignupController],
    //   providers: [
    //     { provide: ProfileService, useValue: {} },
    //     { provide: SignupService, useValue: {} },
    //     { provide: NotificationService, useValue: {} },
    //     { provide: ConfigService, useValue: {} },
    //     { provide: LoginCourseService, useValue: {} },
    //     { provide: TwilioService, useValue: {} },
    //     { provide: MailService, useValue: {} },
    //     { provide: Connection, useValue: {} },
    //     { provide: JwtService, useValue: {} },
    //   ],
    // }).compile();
    // profileController = module.get<ProfileController>(ProfileController);
    // signupController = module.get<SignupController>(SignupController);
  });

  it('should be defined', () => {
    // expect(profileController).toBeDefined();
    // expect(signupController).toBeDefined();
  });

  it('test add and delete student', async () => {
    // const testStudent: UBCOuserParam = {
    //   email: 'test@test.com',
    //   first_name: 'test',
    //   password: 'test',
    //   last_name: 'test',
    //   selected_course: 134,
    //   sid: 2,
    //   photo_url: 'test',
    //   courses: [],
    // };
    // const req = { body: testStudent } as any;
    // const res = {
    //   status: jest.fn().mockReturnThis(),
    //   send: jest.fn(),
    // } as any;
    // await signupController.receiveDataFromSignup(req, res, testStudent);
    // expect(res.status).toHaveBeenCalledWith(200);
    // expect(res.send).toHaveBeenCalledWith({
    //   message: 'User has been signed up',
    // });
  });
});
