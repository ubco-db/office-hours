import { CalendarService } from './calendar.service';
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CalendarModel } from './calendar.entity';
import { Calendar, ERROR_MESSAGES } from '@koh/common';
import { CourseModel } from 'course/course.entity';
import { Between } from 'typeorm';
import moment from 'moment';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}
  @Post()
  async addEvent(@Body() body: Calendar) {
    console.log(body);
    const course = await CourseModel.findOne(body.cid);
    if (!course) {
      console.error(
        ERROR_MESSAGES.courseController.courseNotFound +
          'Course ID: ' +
          body.cid,
      );
      throw new HttpException(
        ERROR_MESSAGES.courseController.courseNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const event = await CalendarModel.create({
        title: body.title,
        start: body.start,
        end: body.end,
        endDate: body.endDate || null,
        locationType: body.locationType,
        locationDetail: body.locationDetail || null,
        course: course,
        allDay: body.allDay || false,
        daysOfWeek: body.daysOfWeek || null,
      }).save();

      return event;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'Calendar create error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async updateEvent(@Param('id') id: string, @Body() body: Partial<Calendar>) {
    const event = await CalendarModel.findOne(id);

    if (!event) {
      console.error('Event not found with ID: ' + id);
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    Object.keys(body).forEach((key) => {
      event[key] = body[key];
    });

    try {
      await event.save();
      return event;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'Calendar update error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':cid')
  async getAllEvents(@Param('cid') cid: number): Promise<CalendarModel[]> {
    const events = await CalendarModel.find({ where: { course: cid } });
    if (!events || events.length === 0) {
      console.error(ERROR_MESSAGES.courseController.courseNotFound + 'events');
      throw new HttpException(
        ERROR_MESSAGES.courseController.courseNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }
  @Get(':cid/:date')
  async getEventsForDay(
    @Param('cid') cid: number,
    @Param('date') date: string,
    @Query('timezone') timezone: string,
  ): Promise<CalendarModel[]> {
    // Parse the date string into a Date object
    const targetDate = new Date(date);

    // Get the start and end of the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find events for the given course ID that fall on the target date
    const events = await CalendarModel.find({
      where: {
        course: cid,
        start: Between(startOfDay, endOfDay),
      },
    });

    if (!events || events.length === 0) {
      console.error(ERROR_MESSAGES.courseController.courseNotFound + 'events');
      throw new HttpException(
        ERROR_MESSAGES.courseController.courseNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }

  @Delete(':id/delete')
  async deleteQuestionType(
    @Param('id') eventId: number,
  ): Promise<CalendarModel> {
    const event = await CalendarModel.findOne(eventId);
    if (!event) {
      console.error('Event not found');
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    return event.remove();
  }
}
