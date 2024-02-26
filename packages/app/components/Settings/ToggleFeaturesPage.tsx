import { QuestionCircleOutlined } from '@ant-design/icons'
import { API } from '@koh/api-client'
import { Form, Spin, message, Switch, Tooltip } from 'antd'
import { ReactElement } from 'react'
import styled from 'styled-components'
import useSWR, { mutate } from 'swr'

type ToggleFeaturesPageProps = { courseId: number }

const ToggleFeaturesPageComponent = styled.div`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
`

const CustomFormItem = styled(Form.Item)`
  padding-bottom: 1rem;
  margin-bottom: 1rem;

  font-size: 1rem;
  line-height: 0.5rem;

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
  }
`

const CustomSwitch = styled(Switch)`
  margin-right: 1rem;
`

export default function ToggleFeaturesPage({
  courseId,
}: ToggleFeaturesPageProps): ReactElement {
  const { data: courseFeatures } = useSWR(
    `${courseId}/features`,
    async () => await API.course.getCourseFeatures(courseId),
  )
  if (!courseFeatures) {
    return <Spin tip="Loading..." size="large" />
  } else {
    return (
      <ToggleFeaturesPageComponent>
        <h2>Enable/Disable Features for this Course</h2>

        <Form className="ml-2">
          <CustomFormItem>
            <CustomSwitch
              defaultChecked={courseFeatures.asyncQueueEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'asyncQueueEnabled',
                    e.valueOf() as boolean,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set async queue feature to ' + e.valueOf(),
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling async question centre: ${error.message}`,
                    )
                  })
              }}
            />
            <span>
              Asynchronous Question Centre&nbsp;
              <Tooltip
                title={
                  'This feature allows students to ask questions asynchronously (e.g. outside of office hours or labs) that can then be responded to by the professor. It also features automatic AI-generated answers based on uploaded course content.'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          </CustomFormItem>
          <CustomFormItem>
            <CustomSwitch
              defaultChecked={courseFeatures.chatBotEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'chatBotEnabled',
                    e.valueOf() as boolean,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set chatbot feature to ' + e.valueOf(),
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling chatbot: ${error.message}`,
                    )
                  })
              }}
            />
            <span>
              Chatbot&nbsp;
              <Tooltip
                title={
                  'This feature allows students to ask questions to an AI chatbot that will answer their questions based on uploaded lab content.'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          </CustomFormItem>
          <CustomFormItem>
            <CustomSwitch
              defaultChecked={courseFeatures.queueEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'queueEnabled',
                    e.valueOf() as boolean,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set queues feature to ' + e.valueOf(),
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling queues feature: ${error.message}`,
                    )
                  })
              }}
            />
            <span>
              Queues&nbsp;
              <Tooltip
                title={
                  'This feature allows students to ask questions in a queue that can then be answered by the professor or a TA. Suitable for online, hybrid, and in-person office hours and labs.'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          </CustomFormItem>
          <CustomFormItem>
            <CustomSwitch
              defaultChecked={courseFeatures.adsEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'adsEnabled',
                    e.valueOf() as boolean,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set ads feature to ' + e.valueOf(),
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling ads: ${error.message}`,
                    )
                  })
              }}
            />
            <span>
              Advertisements (Not currently implemented)&nbsp;
              <Tooltip
                title={
                  'Displays non-intrusive advertisements to help keep the servers running (and to keep us from going bankrupt from those darn OpenAI API fees).'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          </CustomFormItem>
        </Form>
      </ToggleFeaturesPageComponent>
    )
  }
}
