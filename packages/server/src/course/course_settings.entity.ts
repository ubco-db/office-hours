import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseModel } from './course.entity';

@Entity('course_settings_model')
export class CourseSettingsModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('boolean', { default: false })
  chatBotEnabled: boolean;

  @Column('boolean', { default: false })
  asyncQueueEnabled: boolean;

  @Column('boolean', { default: false })
  adsEnabled: boolean;

  @Column('boolean', { default: false })
  queueEnabled: boolean;

  @OneToOne((type) => CourseModel, (course) => course.courseSettings)
  @JoinColumn({ name: 'courseId' })
  course: CourseModel;

  @Column('int')
  courseId: number;
}
