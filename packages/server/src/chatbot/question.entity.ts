import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InteractionModel } from './interaction.entity';
// each chatbot_question links to one interaction
@Entity('chatbot_questions_model')
export class ChatbotQuestionModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => InteractionModel)
  @JoinColumn({ name: 'interaction' })
  interaction: InteractionModel;

  @Column()
  interactionId: number;

  @Column()
  questionText: string;

  @Column()
  responseText: string;

  @Column()
  timestamp: Date;

  @Column({ default: 0 })
  userScore: number;
}
