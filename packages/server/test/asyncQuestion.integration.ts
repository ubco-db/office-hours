import { setupIntegrationTest } from './util/testUtils';
import { asyncQuestionModule } from '../src/asyncQuestion/asyncQuestion.module';
import {
  AsyncQuestionFactory,
  CourseFactory,
  UserFactory,
  VotesFactory,
} from './util/factories';
import { asyncQuestionStatus } from '@koh/common';

describe('Async Question Integration', () => {
  const supertest = setupIntegrationTest(asyncQuestionModule);

  describe('POST /asyncQuestions/:qid/:vote', () => {
    it('should vote on a question', async () => {
      const student = await UserFactory.create();
      const question = await AsyncQuestionFactory.create({
        createdAt: new Date('2020-03-01T05:00:00.000Z'),
      });

      const response = await supertest({ userId: student.id }).post(
        `/asyncQuestions/${question.id}/1`,
      );

      expect(response.status).toBe(200);
      expect(response.body.vote).toBe(1);
    });

    it('should update an existing vote on a question', async () => {
      const student = await UserFactory.create();
      const question = await AsyncQuestionFactory.create({
        createdAt: new Date('2020-03-01T05:00:00.000Z'),
      });
      await VotesFactory.create({ userId: student.id, vote: 1, question });

      const response = await supertest({ userId: student.id }).post(
        `/asyncQuestions/${question.id}/-1`,
      );

      expect(response.status).toBe(200);
      expect(response.body.vote).toBe(0);
    });

    it('should not allow voting beyond the allowed range', async () => {
      const student = await UserFactory.create();
      const question = await AsyncQuestionFactory.create({
        createdAt: new Date('2020-03-01T05:00:00.000Z'),
      });
      await VotesFactory.create({ userId: student.id, vote: 1, question });

      const response = await supertest({ userId: student.id }).post(
        `/asyncQuestions/${question.id}/2`,
      );

      expect(response.status).toBe(200);
      expect(response.body.vote).toBe(1); // original vote
    });

    it('should not allow voting by unauthorized users', async () => {
      const question = await AsyncQuestionFactory.create({
        createdAt: new Date('2020-03-01T05:00:00.000Z'),
      });

      const response = await supertest().post(
        `/asyncQuestions/${question.id}/1`,
      );

      expect(response.status).toBe(401);
    });

    it('should return an error if the question does not exist', async () => {
      const student = await UserFactory.create();

      const response = await supertest({ userId: student.id }).post(
        `/asyncQuestions/9999/1`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /asyncQuestions/:cid', () => {
    it('should create a question', async () => {
      const student = await UserFactory.create();
      const course = await CourseFactory.create();
      const response = await supertest({ userId: student.id })
        .post(`/asyncQuestions/${course.id}`)
        .send({
          questionAbstract: 'abstract',
          questionText: 'text',
          answerText: 'answer',
          aiAnswerText: 'ai',
          questionTypes: [],
          visible: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.aiAnswerText).toBe('ai');
      expect(response.body.answerText).toBe('answer');
      expect(response.body.status).toBe(asyncQuestionStatus.Waiting);
    });

    it('should not create a question in a non-existent course', async () => {
      const student = await UserFactory.create();
      const response = await supertest({ userId: student.id })
        .post(`/asyncQuestions/9999`)
        .send({
          questionAbstract: 'abstract',
          questionText: 'text',
          answerText: 'answer',
          aiAnswerText: 'ai',
          questionTypes: [],
          visible: true,
        });

      expect(response.status).toBe(404);
    });

    it('should not allow unauthorized users to create a question', async () => {
      const course = await CourseFactory.create();
      const response = await supertest()
        .post(`/asyncQuestions/${course.id}`)
        .send({
          questionAbstract: 'abstract',
          questionText: 'text',
          answerText: 'answer',
          aiAnswerText: 'ai',
          questionTypes: [],
          visible: true,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /asyncQuestions/:questionId', () => {
    it('should successfully update a question', async () => {
      const user = await UserFactory.create();
      const question = await AsyncQuestionFactory.create({
        creatorId: user.id,
      });
      const updatedFields = {
        aiAnswerText: 'updated AI answer',
        answerText: 'updated answer',
        status: asyncQuestionStatus.Resolved,
      };

      const response = await supertest({ userId: user.id })
        .patch(`/asyncQuestions/${question.id}`)
        .send(updatedFields);

      expect(response.status).toBe(200);
      expect(response.body.aiAnswerText).toBe(updatedFields.aiAnswerText);
      expect(response.body.answerText).toBe(updatedFields.answerText);
      expect(response.body.status).toBe(updatedFields.status);
    });

    it('should return an error if the question does not exist', async () => {
      const user = await UserFactory.create();
      const nonExistentQuestionId = 9999;
      const updatedFields = {
        aiAnswerText: 'updated AI answer',
        answerText: 'updated answer',
      };

      const response = await supertest({ userId: user.id })
        .patch(`/asyncQuestions/${nonExistentQuestionId}`)
        .send(updatedFields);

      expect(response.status).toBe(404);
    });
  });
});
