import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'chat_message_model' })
export class ChatMessageModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
