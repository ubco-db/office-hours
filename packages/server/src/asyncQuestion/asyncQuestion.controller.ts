import {
  CreateAsyncQuestions,
  ERROR_MESSAGES,
  Role,
  AsyncQuestion,
  asyncQuestionStatus,
  UpdateAsyncQuestions,
} from '@koh/common';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { User } from '../decorators/user.decorator';
import { UserModel } from '../profile/user.entity';
import { AsyncQuestionModel } from './asyncQuestion.entity';
import { asyncQuestionService } from './asyncQuestion.service';
import { CourseModel } from 'course/course.entity';
import { MailService } from 'mail/mail.service';
import { UserCourseModel } from 'profile/user-course.entity';

@Controller('asyncQuestions')
@UseGuards(JwtAuthGuard)
export class asyncQuestionController {
  constructor(
    private mailService: MailService,
    private questionService: asyncQuestionService,
  ) {}

  @Post(':cid')
  @Roles(Role.STUDENT)
  async createQuestion(
    @Body() body: CreateAsyncQuestions,
    @Param('cid') cid: number,
    @User() user: UserModel,
  ): Promise<any> {
    // const { text, questionType, groupable, queueId, force } = body;
    const c = await CourseModel.findOne({
      where: { id: cid },
    });

    if (!c) {
      throw new NotFoundException(
        ERROR_MESSAGES.questionController.createQuestion.invalidQueue,
      );
    }

    //check whether there are images to be added
    try {
      const question = await AsyncQuestionModel.create({
        courseId: cid,
        creator: user,
        creatorId: user.id,
        course: c,
        questionAbstract: body.questionAbstract,
        questionText: body.questionText || null,
        answerText: body.answerText || null,
        aiAnswerText: body.aiAnswerText,
        questionTypes: body.questionTypes,
        status: body.status || asyncQuestionStatus.AIAnswered,
        visible: false,
        verified: false,
        createdAt: new Date(),
      }).save();
      return question;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        ERROR_MESSAGES.questionController.saveQError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Body() body: UpdateAsyncQuestions,
    @User() user: UserModel,
  ): Promise<AsyncQuestion> {
    const question = await AsyncQuestionModel.findOne({
      where: { id: questionId },
      relations: ['creator', 'images'],
    });
    if (question === undefined) {
      throw new NotFoundException();
    }

    question.aiAnswerText = body.aiAnswerText;
    question.answerText = body.answerText;

    //If not creator, check if user is TA/PROF of course of question

    Object.assign(question, body);
    if (
      body.status === asyncQuestionStatus.HumanAnswered ||
      body.status === asyncQuestionStatus.AIAnsweredResolved
    ) {
      question.closedAt = new Date();
    }
    if (body.status === asyncQuestionStatus.HumanAnswered) {
      question.taHelpedId = user.id;
    }
    // if creator, can update question anytime
    // otherwise has to be TA/PROF of course
    if (question.creatorId !== user.id) {
      const requester = await UserCourseModel.findOne({
        where: {
          userId: user.id,
        },
      });
      if (requester.role === Role.STUDENT) {
        throw new HttpException(
          'No permission to update question.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
    question.save();
    return question;
  }
}
