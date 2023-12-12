import { ReactElement } from 'react'
import Modal from 'antd/lib/modal/Modal'
import { Switch, Input, Form, Button, Radio, message } from 'antd'
import styled from 'styled-components'
import { API } from '@koh/api-client'
import { useQueue } from '../../../hooks/useQueue'
import { AddQuestionTypeParams, UpdateQueueParams } from '@koh/common'
import { pick } from 'lodash'
import { default as React, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import { useCourse } from '../../../hooks/useCourse'
import { QuestionType } from '../QueueListSharedComponents'
import { SketchPicker } from 'react-color'

const NotesInput = styled(Input.TextArea)`
  border-radius: 6px;
  border: 1px solid #b8c4ce;
`

interface EditQueueModalProps {
  queueId: number
  visible: boolean
  onClose: () => void
}

export function EditQueueModal({
  queueId,
  visible,
  onClose,
}: EditQueueModalProps): ReactElement {
  const { queue, mutateQueue } = useQueue(queueId)
  const [form] = Form.useForm()
  const [questionsTypeState, setQuestionsTypeState] = useState<
    AddQuestionTypeParams[]
  >([])
  const [questionTypeAddState, setQuestionTypeAddState] = useState()
  const router = useRouter()
  const courseId = router.query['cid']
  const course = useCourse(Number(courseId))
  const [currentZoomLink, setCurrentZoomLink] = useState(
    course.course?.zoomLink,
  )
  const [color, setColor] = useState('#fff')

  const handleColorChange = (color) => {
    setColor(color.hex)
  }
  const [zoomLink, setZoomLink] = useState('')
  useEffect(() => {
    getQuestions()
  }, [])

  const editQueue = async (updateQueue: UpdateQueueParams) => {
    const newQueue = { ...queue, ...updateQueue }
    mutateQueue(newQueue, false)
    await API.queues.update(
      newQueue.id,
      pick(newQueue, ['notes', 'allowQuestions']),
    )
    mutateQueue()
  }

  const courseNumber = Number(courseId)
  const getQuestions = async () => {
    setQuestionsTypeState(await API.questions.questionTypes(courseNumber))
  }

  const onclick = useCallback(
    async (s: string) => {
      await API.questions.deleteQuestionType(courseNumber, s)
      const temp = await API.questions.questionTypes(courseNumber)
      await setQuestionsTypeState(temp)
    },
    [courseNumber],
  )

  const onAddChange = (e) => {
    setQuestionTypeAddState(e.target.value)
  }

  const onZoomLinkChange = (e) => {
    setZoomLink(e.target.value)
  }

  const addQuestionType = useCallback(async () => {
    await API.questions.addQuestionType(courseNumber, {
      name: questionTypeAddState,
      color: color,
    })
    setQuestionsTypeState(await API.questions.questionTypes(courseNumber))
    setQuestionTypeAddState(null)
  }, [courseNumber, questionTypeAddState, color])

  const changeZoomLink = async () => {
    await API.course
      .editCourseInfo(Number(courseId), {
        courseId: Number(courseId),
        zoomLink: zoomLink,
      })
      .then(() => {
        message.success('Zoom link Changed')
        setCurrentZoomLink(zoomLink)
      })
  }

  return (
    <Modal
      title="Edit Queue Details"
      visible={visible}
      onCancel={onClose}
      onOk={async () => {
        const value = await form.validateFields()
        await editQueue(value)
        onClose()
      }}
    >
      {queue && (
        <Form form={form} initialValues={queue}>
          <Form.Item label="Queue Notes" name="notes">
            <NotesInput allowClear={true} placeholder={''} />
          </Form.Item>
          <Form.Item
            label="Allow New Questions"
            name="allowQuestions"
            valuePropName="checked"
          >
            <Switch data-cy="allow-questions-toggle" />
          </Form.Item>
          <h4>Current Question Types: (click to delete)</h4>
          {questionsTypeState.length > 0 ? (
            questionsTypeState.map((questionType, index) => (
              <QuestionType
                key={index}
                typeName={questionType.name}
                typeColor={questionType.color}
                onClick={() => onclick(questionType.name)}
              />
            ))
          ) : (
            <p>No Questions types</p>
          )}
          <Form.Item name="add">
            <Input
              allowClear={true}
              placeholder="Enter New Question type name"
              value={questionTypeAddState}
              onChange={onAddChange}
              style={{ marginBottom: '10px' }}
            />
            <SketchPicker color={color} onChangeComplete={handleColorChange} />
            <Button onClick={addQuestionType}> Add </Button>
          </Form.Item>
          <h4 style={{ marginTop: '20px' }}>
            Current Zoom link:{' '}
            {currentZoomLink ? (
              <p style={{ color: 'blue' }}>{currentZoomLink} </p>
            ) : (
              <p> Zoomlink not Available</p>
            )}
          </h4>
          <Form.Item>
            <Input allowClear={true} onChange={onZoomLinkChange} />
            <Button onClick={changeZoomLink}> Change Link </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
