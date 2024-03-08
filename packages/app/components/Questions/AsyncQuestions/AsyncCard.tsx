import React, { ReactElement, useEffect, useState } from 'react'
import { Button, Card, Image, message } from 'antd'
import { Text } from '../Shared/SharedComponents'
import { QuestionType } from '../Shared/QuestionType'
import { KOHAvatar } from '../../common/SelfAvatar'
import { TAquestionDetailButtons } from './TAquestionDetailButtons'
import { getAsyncWaitTime } from '../../../utils/TimeUtil'
import { AsyncQuestion, asyncQuestionStatus } from '@koh/common'
import { useProfile } from '../../../hooks/useProfile'
import StudentQuestionDetailButtons from './StudentQuestionDetailButtons'
import { API } from '@koh/api-client'
import { set } from 'lodash'

interface AsyncCardProps {
  question: AsyncQuestion
  cid: number
  qid: number
  isStaff: boolean
  userId: number
  onStatusChange: () => void
  onQuestionTypeClick: (questionType: any) => void
}

export default function AsyncCard({
  question,
  onStatusChange,
  isStaff,
  userId,
  onQuestionTypeClick,
}: AsyncCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleImageClick = (event) => {
    event.stopPropagation() // Prevents the click from closing the card
  }

  const setIsExpandedTrue = (event) => {
    event.stopPropagation()
    setIsExpanded(true)
  }

  const handleFeedback = async (resolved) => {
    try {
      const newstatus = resolved
        ? asyncQuestionStatus.AIAnsweredResolved
        : asyncQuestionStatus.AIAnsweredNeedsAttention
      await API.asyncQuestions.update(question.id, { status: newstatus })
      message.success(
        `Question has been marked as ${
          resolved ? 'resolved' : 'needing faculty attention'
        }.`,
      )
      onStatusChange()
    } catch (error) {
      console.error('Failed to update question status', error)
      message.error('Failed to update question status. Please try again.')
    }
  }

  return (
    <Card
      className={`mb-2 rounded-lg bg-white p-2 shadow-lg ${
        question.status === asyncQuestionStatus.HumanAnswered
          ? 'bg-green-100/30'
          : 'bg-yellow-100/50'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="mb-4 flex items-start justify-between">
        {isStaff || userId == question.creatorId ? (
          <>
            {/* Staff can see all questions details, question creator can see their own */}
            <KOHAvatar
              size={46}
              name={question.creator.name}
              photoURL={question.creator.photoURL}
              className="mr-3" // Tailwind margin right
            />
            <div className="flex-grow text-sm italic">
              {question.creator.name}
            </div>
          </>
        ) : (
          <div className="flex-grow text-sm italic">Anonymous Student</div>
        )}
        <div className="flex items-center">
          <Text className="text-sm">{getAsyncWaitTime(question)}</Text>
          {/*Stuff gets buttons to edit and delete questions*/}
          {isStaff && (
            <>
              <TAquestionDetailButtons
                question={question}
                setIsExpandedTrue={setIsExpandedTrue}
                onStatusChange={onStatusChange}
              />
            </>
          )}
          {userId === question.creatorId &&
          question.status === asyncQuestionStatus.AIAnswered ? (
            <>
              {/* Students can edit their own questions, but only if question is not resolved, note that AIAnswer is default */}
              <StudentQuestionDetailButtons
                question={question}
                setIsExpandedTrue={setIsExpandedTrue}
                onStatusChange={onStatusChange}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-bold">{question.questionAbstract}</h4>
        {isExpanded && (
          <div>
            {question?.images.map((i) => {
              return (
                <Image
                  height={300}
                  src={`/api/v1/image/${i.id}`}
                  alt="none"
                  key={i.id}
                  onClick={handleImageClick}
                />
              )
            })}
            {question.questionText && <Text>{question.questionText}</Text>}

            {question.answerText ? (
              <>
                <br />
                <div>
                  <strong>Answer</strong>
                  <Text>{question.answerText}</Text>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap">
        {question.questionTypes?.map((questionType, index) => (
          <QuestionType
            key={index}
            typeName={questionType.name}
            typeColor={questionType.color}
            onClick={() => onQuestionTypeClick(questionType.id)}
          />
        ))}
      </div>
      {question.status === asyncQuestionStatus.AIAnswered &&
        userId === question.creatorId && (
          <div className="mt-4 flex justify-center space-x-4">
            {/* Students vote on whether they still need faculty help */}
            <Button onClick={() => handleFeedback(true)}>Satisfied</Button>
            <Button type="primary" onClick={() => handleFeedback(false)}>
              Still need faculty Help
            </Button>
          </div>
        )}
    </Card>
  )
}
