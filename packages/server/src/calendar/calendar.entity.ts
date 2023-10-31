import { CourseModel } from '../course/course.entity';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('calendar_model')
export class CalendarModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  title: string;

  @Column({ type: 'timestamp' })
  start: Date;

  @Column({ type: 'timestamp' })
  end: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column('text', { array: true, nullable: true, default: null })
  daysOfWeek: string[];

  @Column({ nullable: true })
  allDay: boolean;

  @Column({ type: 'enum', enum: ['in-person', 'zoom'] })
  locationType: 'in-person' | 'zoom';

  @Column({ nullable: true })
  locationDetail: string;

  @ManyToOne((type) => CourseModel)
  @JoinColumn({ name: 'course' })
  @Exclude()
  course: CourseModel;
}
