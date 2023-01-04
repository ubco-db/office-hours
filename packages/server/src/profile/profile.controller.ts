import {
  DesktopNotifPartial,
  ERROR_MESSAGES,
  GetProfileResponse,
  QuestionStatusKeys,
  UpdateProfileParams,
} from '@koh/common';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as checkDiskSpace from 'check-disk-space';
import { Response } from 'express';
import * as fs from 'fs';
import { pick } from 'lodash';
import { memoryStorage } from 'multer';
import * as path from 'path';
import * as sharp from 'sharp';
import { Connection } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationService } from '../notification/notification.service';
import { User } from '../decorators/user.decorator';
import { UserModel } from './user.entity';
import { ProfileService } from './profile.service';
import { UserCourseModel } from './user-course.entity';
import { Role } from '@koh/common';
import { throwError } from 'rxjs';
import { QuestionModel } from 'question/question.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Controller('profile')
export class ProfileController {
  constructor(
    private connection: Connection,
    private notifService: NotificationService,
    private profileService: ProfileService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  //forgetpassword route used for creating links to be sent to the email
  @Post('/forgetpassword/:e')
  async forgetpassword(
    @Res() res: Response,
    @Param('e') e: string,
  ): Promise<any> {
    UserModel.findOne({
      where: { email: e },
    })
      .then(async user => {
        if (!user) {
          throw new HttpException(
            ERROR_MESSAGES.profileController.accountNotAvailable,
            HttpStatus.NOT_FOUND,
          );
        }
        const token = await this.jwtService.signAsync(
          { userId: user.id },
          { expiresIn: 60 },
        );
        if (token === null || token === undefined) {
          console.error('Temporary JWT is invalid');
          throw new HttpException(
            ERROR_MESSAGES.loginController.invalidTempJWTToken,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        return res.status(200).send({ token, e });
      })
      .catch(err => {
        res.status(500).send({ message: err });
      });
  }
  // enter reset page
  @Get('/enter_resetpassword')
  async enterReset(
    @Res() res: Response,
    @Query('token') token: string,
  ): Promise<void> {
    const isVerified = await this.jwtService.verifyAsync(token);

    if (!isVerified) {
      throw new UnauthorizedException();
    }

    const payload = this.jwtService.decode(token) as { userId: number };
    this.enter(res, payload.userId);
  }
  // Set cookie and redirect to proper page
  private async enter(res: Response, userId: number) {
    // Expires in 30 days
    const authToken = await this.jwtService.signAsync({
      userId,
      expiresIn: 60 * 10,
    });

    if (authToken === null || authToken === undefined) {
      console.error('Authroziation JWT is invalid');
      throw new HttpException(
        ERROR_MESSAGES.loginController.invalidTempJWTToken,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    //final step to send below link to user's email
    this.configService.get<string>('DOMAIN').startsWith('https://');
    res.redirect(302, `/forgetpassword/reset/${authToken}`);
  }
  //two functions, one is verify user through authToken, another is to update password using userId and new password
  @Get('verify_token')
  async verifyToken(@Query('token') token: string): Promise<boolean> {
    const isVerified = await this.jwtService.verifyAsync(token).catch(() => {
      return false;
    });
    if (!isVerified) {
      return false;
    }
    return true;
  }
  @Patch(':password/update_password')
  async updatePassword(
    @Param('password') p: string,
    @Query('token') token: string,
  ): Promise<void> {
    const payload = this.jwtService.decode(token) as { userId: number };
    UserModel.findOne({
      where: { id: payload.userId },
    }).then(async user => {
      if (!user) {
        throw new NotFoundException();
      } else {
        console.log(p);
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(p, salt);
        user = Object.assign(user, { password: newPassword });
        await user.save();
      }
    });
  }
  //potential problem-should fix later. Currently checking whether question in database, but student can be in different queues(so find with both queues and user id)
  @Get(':c/id')
  @UseGuards(JwtAuthGuard)
  async getAllStudents(
    @Param('c') c: number,
    @Res() res: Response,
  ): Promise<any> {
    const studentIds = await UserCourseModel.find({
      where: {
        courseId: c,
        role: Role.STUDENT,
      },
    });
    const students = [];
    studentIds.forEach((userCourse, i) => {
      const tempId = userCourse.userId;
      UserModel.findOne({
        where: {
          id: userCourse.userId,
        },
      })
        .then(function(result) {
          students.push({ value: result.name, id: tempId });
          if (i + 1 === studentIds.length) {
            res.status(200).send(students);
            return students;
          }
        })
        .catch(e => {
          console.error(e);
        });
    });
  }
  @Get(':id/inQueue')
  @UseGuards(JwtAuthGuard)
  async inQueue(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<boolean> {
    const questions = await QuestionModel.find({
      where: {
        creatorId: id,
      },
    });
    if (!questions) {
      throwError;
    }
    for (let i = 0; i < questions.length; i++) {
      if (questions[i]?.status === QuestionStatusKeys.Queued) {
        console.log(questions[i].status);
        console.log(QuestionStatusKeys.Queued);
        res.status(200).send(true);
        return true;
      }
    }
    res.status(200).send(false);
    return false;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async get(
    @User(['courses', 'courses.course', 'phoneNotif', 'desktopNotifs'])
    user: UserModel,
  ): Promise<GetProfileResponse> {
    if (user === null || user === undefined) {
      console.error(ERROR_MESSAGES.profileController.accountNotAvailable);
      throw new HttpException(
        ERROR_MESSAGES.profileController.accountNotAvailable,
        HttpStatus.NOT_FOUND,
      );
    }

    const courses = user.courses
      .filter(userCourse => userCourse.course.enabled)
      .map(userCourse => {
        return {
          course: {
            id: userCourse.courseId,
            name: userCourse.course.name,
          },
          role: userCourse.role,
        };
      });

    const desktopNotifs: DesktopNotifPartial[] = user.desktopNotifs.map(d => ({
      endpoint: d.endpoint,
      id: d.id,
      createdAt: d.createdAt,
      name: d.name,
    }));

    const userResponse = pick(user, [
      'id',
      'email',
      'name',
      'sid',
      'firstName',
      'lastName',
      'photoURL',
      'defaultMessage',
      'includeDefaultMessage',
      'desktopNotifsEnabled',
      'phoneNotifsEnabled',
      'insights',
    ]);

    if (userResponse === null || userResponse === undefined) {
      console.error(ERROR_MESSAGES.profileController.userResponseNotFound);
      throw new HttpException(
        ERROR_MESSAGES.profileController.userResponseNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const pendingCourses = await this.profileService.getPendingCourses(user.id);

    return {
      ...userResponse,
      courses,
      phoneNumber: user.phoneNotif?.phoneNumber,
      desktopNotifs,
      pendingCourses,
    };
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async patch(
    @Body() userPatch: UpdateProfileParams,
    @User(['courses', 'courses.course', 'phoneNotif', 'desktopNotifs'])
    user: UserModel,
  ): Promise<GetProfileResponse> {
    user = Object.assign(user, userPatch);

    // check that the user is trying to update the phone notifs
    if (userPatch.phoneNotifsEnabled && userPatch.phoneNumber) {
      // only register new phone if the notifs are enables and the phone number is new
      if (
        user.phoneNotifsEnabled &&
        userPatch.phoneNumber !== user.phoneNotif?.phoneNumber
      ) {
        await this.notifService.registerPhone(userPatch.phoneNumber, user);
      }
    }

    await user.save();

    return this.get(user);
  }

  @Post('/upload_picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserModel,
  ): Promise<void> {
    if (user.photoURL) {
      fs.unlink(process.env.UPLOAD_LOCATION + '/' + user.photoURL, err => {
        console.error(
          'Error deleting previous picture at: ',
          user.photoURL,
          err,
          'the previous image was at an invalid location?',
        );
      });
    }

    const spaceLeft = await checkDiskSpace(path.parse(process.cwd()).root);

    if (spaceLeft.free < 1000000000) {
      // if less than a gigabyte left
      throw new ServiceUnavailableException(
        ERROR_MESSAGES.profileController.noDiskSpace,
      );
    }

    const fileName =
      user.id +
      '-' +
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);

    await sharp(file.buffer)
      .resize(256)
      .toFile(path.join(process.env.UPLOAD_LOCATION, fileName));

    user.photoURL = fileName;
    await user.save();
  }

  @Get('/get_picture/:photoURL')
  @UseGuards(JwtAuthGuard)
  async getImage(
    @Param('photoURL') photoURL: string,
    @Res() res: Response,
  ): Promise<void> {
    fs.stat(
      path.join(process.env.UPLOAD_LOCATION, photoURL),
      async (err, stats) => {
        if (stats) {
          res.sendFile(photoURL, { root: process.env.UPLOAD_LOCATION });
        } else {
          const user = await UserModel.findOne({
            where: {
              photoURL,
            },
          });
          user.photoURL = null;
          await user.save();
          throw new NotFoundException();
        }
      },
    );
  }

  @Delete('/delete_profile_picture')
  @UseGuards(JwtAuthGuard)
  async deleteProfilePicture(@User() user: UserModel): Promise<void> {
    if (user.photoURL) {
      fs.unlink(
        process.env.UPLOAD_LOCATION + '/' + user.photoURL,
        async err => {
          if (err) {
            const errMessage =
              'Error deleting previous picture at : ' +
              user.photoURL +
              'the previous image was at an invalid location?';
            console.error(errMessage, err);
            throw new BadRequestException(errMessage);
          } else {
            user.photoURL = null;
            await user.save();
            return;
          }
        },
      );
    }
  }
}
