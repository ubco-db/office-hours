import { API } from '@koh/api-client'
import { Form, Spin, message, Switch } from 'antd'
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
            Asynchronous Question Centre
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
            Chatbot
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
            Queues
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
            Ads
          </CustomFormItem>
        </Form>
      </ToggleFeaturesPageComponent>
    )
  }
}
