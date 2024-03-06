import React, { ReactElement, useState } from 'react'
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

interface AsyncCardProps {
  question: AsyncQuestion
  cid: number
  qid: number
  isStaff: boolean
  userId: number
  onQuestionTypeClick: (questionType: any) => void
}

export default function AsyncCard({
  question,
  cid,
  qid,
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
      const status = resolved
        ? asyncQuestionStatus.AIAnsweredResolved
        : asyncQuestionStatus.HumanAnswered
      await API.asyncQuestions.update(question.id, { status })
      message.success(
        `Question has been marked as ${
          resolved ? 'resolved' : 'needing faculty attention'
        }.`,
      )
      // Optionally, refresh the question list or update local state to reflect the change
    } catch (error) {
      console.error('Failed to update question status', error)
      message.error('Failed to update question status. Please try again.')
    }
  }

  return (
    <Card
      className="mb-2 rounded-lg bg-white p-2 shadow-lg"
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
                queueId={qid}
                question={question}
                hasUnresolvedRephraseAlert={false}
                setIsExpandedTrue={setIsExpandedTrue}
              />
            </>
          )}
          {userId == question.creatorId &&
          question.status === asyncQuestionStatus.AIAnswered ? (
            <>
              {/* Students can edit their own questions, but only if question is not resolved, note that AIAnswer is default */}
              <StudentQuestionDetailButtons
                queueId={qid}
                question={question}
                hasUnresolvedRephraseAlert={false}
                setIsExpandedTrue={setIsExpandedTrue}
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
              Need Faculty Help
            </Button>
          </div>
        )}
    </Card>
  )
}
