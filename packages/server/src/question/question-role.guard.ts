import { Injectable } from '@nestjs/common';
import { UserModel } from '../profile/user.entity';
import { RolesGuard } from 'guards/role.guard';
import { QuestionModel } from './question.entity';

@Injectable()
export class QuestionRolesGuard extends RolesGuard {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async setupData(
    request: any,
  ): Promise<{ courseId: number; user: UserModel }> {
    const question = await QuestionModel.findOne(request.params.questionId);
    const courseId = question.queue.course.id;
    const user = request.user;
    return { courseId, user };
  }
}
