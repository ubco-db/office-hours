import {
  CreateAsyncQuestions,
  ERROR_MESSAGES,
  Role,
  AsyncQuestion,
  asyncQuestionStatus,
  UpdateAsyncQuestions,
  sendEmailAsync,
  asyncQuestionEventType,
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
  Res,
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
import { Response } from 'express';
import { AsyncQuestionVotesModel } from './asyncQuestionVotes.entity';

@Controller('asyncQuestions')
@UseGuards(JwtAuthGuard)
export class asyncQuestionController {
  constructor(
    private mailService: MailService,
    private questionService: asyncQuestionService,
  ) {}

  @Post(':qid/:vote')
  @Roles(Role.STUDENT, Role.TA, Role.PROFESSOR)
  async voteQuestion(
    @Param('qid') qid: number,
    @Param('vote') vote: number,
    @User() user: UserModel,
    @Res() res: Response,
  ): Promise<AsyncQuestion> {
    const question = await AsyncQuestionModel.findOne({
      where: { id: qid },
    });

    if (!question) {
      res
        .status(HttpStatus.NOT_FOUND)
        .send({ message: ERROR_MESSAGES.questionController.notFound });
      return;
    }

    let thisUserThisQuestionVote = await AsyncQuestionVotesModel.findOne({
      where: { userId: user.id, questionId: qid },
    });

    const hasVoted = thisUserThisQuestionVote !== undefined;
    const sumVotes = thisUserThisQuestionVote?.vote ?? 0;

    const newValue = sumVotes + vote;

    const canVote = newValue <= 1 && newValue >= -1;
    if (canVote) {
      if (hasVoted) {
        thisUserThisQuestionVote.vote = newValue;
      } else {
        thisUserThisQuestionVote = new AsyncQuestionVotesModel();
        thisUserThisQuestionVote.user = user;
        thisUserThisQuestionVote.question = question;
        thisUserThisQuestionVote.vote = newValue;
      }
    }

    await thisUserThisQuestionVote.save();

    const updatedQuestion = await AsyncQuestionModel.findOne({
      where: { id: qid },
    });

    res.status(HttpStatus.OK).send({
      questionSumVotes: updatedQuestion.votesSum,
      vote: thisUserThisQuestionVote?.vote ?? 0,
    });

    return;
  }

  @Post(':cid')
  @Roles(Role.STUDENT)
  async createQuestion(
    @Body() body: CreateAsyncQuestions,
    @Param('cid') cid: number,
    @User() user: UserModel,
    @Res() res: Response,
  ): Promise<any> {
    const c = await CourseModel.findOne({
      where: { id: cid },
    });

    if (!c) {
      res
        .status(HttpStatus.NOT_FOUND)
        .send({ message: ERROR_MESSAGES.questionController.notFound });
      return;
    }
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
        status: asyncQuestionStatus.Waiting,
        visible: body.visible || false,
        createdAt: new Date(),
      }).save();
      res.status(HttpStatus.CREATED).send(question);
      return;
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.questionController.saveQError });
      return;
    }
  }

  @Patch(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Body() body: UpdateAsyncQuestions,
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
    question.closedAt = new Date();
    question.save().then(async () => {
      //send notification
      const receiver = await UserModel.findOne({
        where: {
          id: question.creatorId,
        },
      });
      if (!receiver) {
        throw NotFoundException;
      }
      const post: sendEmailAsync = {
        receiver: receiver.email,
        subject: 'UBC helpme Async question status change',
        type: asyncQuestionEventType.deleted,
      };
      if (body.status === asyncQuestionStatus.Resolved) {
        post.type = asyncQuestionEventType.answered;
        this.mailService.sendEmail(post);
      } else if (body.status === asyncQuestionStatus.TADeleted) {
        post.type = asyncQuestionEventType.deleted;
        this.mailService.sendEmail(post);
      }
    });
    return question;
  }
}
