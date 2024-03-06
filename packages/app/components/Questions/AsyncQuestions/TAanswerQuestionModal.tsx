import { ReactElement, useEffect, useState } from 'react'
import Modal from 'antd/lib/modal/Modal'
import { Input, Form, Button, message, Checkbox, Image, Tooltip } from 'antd'
import { API } from '@koh/api-client'
import { AsyncQuestion, asyncQuestionStatus } from '@koh/common'
import { default as React } from 'react'

interface EditQueueModalProps {
  visible: boolean
  onClose: () => void
  question: AsyncQuestion
}

export function AnswerQuestionModal({
  visible,
  question,
  onClose,
}: EditQueueModalProps): ReactElement {
  const [form] = Form.useForm()
  const [visibleStatus, setVisibleStatus] = useState(false)
  //use questions for form validation
  useEffect(() => {
    form.setFieldsValue(question)
    console.log(question)
  }, [question])
  const postReponse = async (value) => {
    await API.asyncQuestions
      .update(question.id, {
        answerText: value.answerText,
        visible: visibleStatus,
        status: asyncQuestionStatus.HumanAnswered,
      })
      .then((value) => {
        if (value) {
          message.success('Response posted/edited')
        } else {
          message.error("Couldn't post response")
        }
      })
  }
  return (
    <Modal
      title="Post/Edit response to Student question"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Return
        </Button>,
        <Tooltip
          title="Submitting this response will mark the question as answered by a faculty member."
          key="submit"
        >
          <Button
            key="submit"
            type="primary"
            onClick={async () => {
              const value = await form.validateFields()
              console.log(value)
              postReponse(value)
              onClose()
            }}
          >
            Submit
          </Button>
        </Tooltip>,
      ]}
    >
      <span>
        <h3>Question:</h3>
        <p>
          <strong>{question.questionAbstract}</strong>
        </p>
        <p> {question.questionText}</p>
        {question?.images.map((i) => {
          return (
            <Image
              height={100}
              src={`/api/v1/image/${i.id}`}
              alt="none"
              key={i.id}
            />
          )
        })}
        <br></br>
      </span>
      <br></br>
      <h3>Response:</h3>
      <Form
        form={form}
        initialValues={{
          answerText: question.answerText,
          visible: question.visible,
        }}
      >
        <Form.Item
          name="answerText"
          rules={[{ required: true, message: 'Please input your response.' }]}
        >
          <Input.TextArea
            style={{ height: 150, marginBottom: 24 }}
            placeholder={'Your response to the question'}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
