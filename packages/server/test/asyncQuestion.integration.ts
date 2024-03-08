import { AsyncQuestionModel } from 'asyncQuestion/asyncQuestion.entity';
import { CourseModel } from 'course/course.entity';
import { UserModel } from 'profile/user.entity';
import {
  InteractionFactory,
  UserFactory,
  CourseFactory,
  UserCourseFactory,
  AsyncQuestionFactory,
} from './util/factories';
import { setupIntegrationTest } from './util/testUtils';
import { asyncQuestionModule } from 'asyncQuestion/asyncQuestion.module';
import { Role, asyncQuestionStatus } from '@koh/common';

describe('AsyncQuestion Integration', () => {
  const supertest = setupIntegrationTest(asyncQuestionModule);
  let course: CourseModel;
  let TAuser: UserModel;
  let studentUser: UserModel;
  let studentUser2: UserModel;
  let asyncQuestion: AsyncQuestionModel;
  beforeEach(async () => {
    TAuser = await UserFactory.create({
      email: 'wskksw@student.ubc.ca',
      firstName: 'kevin',
      lastName: 'wang',
    });
    studentUser = await UserFactory.create({
      email: 'justino@ubc.ca',
      firstName: 'justin',
      lastName: 'oh',
    });
    studentUser2 = await UserFactory.create({
      email: 'tom@ubc.ca',
      firstName: 'tom',
      lastName: 'oh',
    });
    course = await CourseFactory.create({
      name: 'Test course',
    });
    await UserCourseFactory.create({
      user: TAuser,
      course,
      role: Role.TA,
    });
    await UserCourseFactory.create({
      user: studentUser,
      course,
      role: Role.STUDENT,
    });
    await UserCourseFactory.create({
      user: studentUser2,
      course,
      role: Role.STUDENT,
    });

    asyncQuestion = await AsyncQuestionFactory.create({ creator: studentUser });
  });
  describe('Async question creation', () => {
    it('Student can create a question', async () => {
      await supertest({ userId: studentUser.id })
        .post(`/asyncQuestions/${course.id}`)
        .send({
          questionAbstract: 'abstract',
          questionText: 'text',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'AIAnswered');
          expect(response.body).toHaveProperty('closedAt', null);
          expect(response.body).toHaveProperty('questionText', 'text');
          expect(response.body.status).toBe('AIAnswered');
          expect(response.body.closedAt).toBeNull();
        });
    });
  });

  describe('Async question update', () => {
    it('Faculty can modify any question', async () => {
      await supertest({ userId: TAuser.id })
        .patch(`/asyncQuestions/${asyncQuestion.id}`)
        .send({
          questionAbstract: 'abstract',
          questionText: 'text1',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('questionText', 'text1');
        });
      await supertest({ userId: TAuser.id })
        .patch(`/asyncQuestions/${asyncQuestion.id}`)
        .send({
          status: 'HumanAnswered',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'HumanAnswered');
          expect(response.body).toHaveProperty('closedAt');
          expect(response.body.status).toBe('HumanAnswered');
          expect(response.body.closedAt).not.toBeNull();
        });
    });

    it('Student can modify their own question', async () => {
      await supertest({ userId: studentUser.id })
        .patch(`/asyncQuestions/${asyncQuestion.id}`)
        .send({
          status: 'HumanAnswered',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'HumanAnswered');
          expect(response.body.status).toBe('HumanAnswered');
        });
    });

    it('Student cannot modify other students question', async () => {
      await supertest({ userId: studentUser2.id })
        .patch(`/asyncQuestions/${asyncQuestion.id}`)
        .send({
          status: 'HumanAnswered',
        })
        .expect(401);
    });
  });
});
