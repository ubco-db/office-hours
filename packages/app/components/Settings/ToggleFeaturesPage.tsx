import { API } from '@koh/api-client'
import { Form, Checkbox, Spin, message } from 'antd'
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

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
  }
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

        <Form className="ml-2 !text-2xl">
          <CustomFormItem>
            <Checkbox
              defaultChecked={courseFeatures.asyncQueueEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'asyncQueueEnabled',
                    e.target.checked,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set async queue feature to ' +
                        e.target.checked,
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling async question centre: ${error.message}`,
                    )
                  })
              }}
            >
              Asynchronous Question Center
            </Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox
              defaultChecked={courseFeatures.chatBotEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(
                    courseId,
                    'chatBotEnabled',
                    e.target.checked,
                  )
                  .then(() => {
                    message.success(
                      'Successfully set chatbot feature to ' + e.target.checked,
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling chatbot: ${error.message}`,
                    )
                  })
              }}
            >
              Chatbot
            </Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox
              defaultChecked={courseFeatures.queueEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(courseId, 'queueEnabled', e.target.checked)
                  .then(() => {
                    message.success(
                      'Successfully set queue feature to ' + e.target.checked,
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling queue: ${error.message}`,
                    )
                  })
              }}
            >
              Queues
            </Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox
              defaultChecked={courseFeatures.adsEnabled}
              onChange={async (e) => {
                await API.course
                  .setCourseFeature(courseId, 'adsEnabled', e.target.checked)
                  .then(() => {
                    message.success(
                      'Successfully set ads feature to ' + e.target.checked,
                    )
                    mutate(`${courseId}/features`)
                  })
                  .catch((error) => {
                    message.error(
                      `An error occured while toggling ads: ${error.message}`,
                    )
                  })
              }}
            >
              Ads
            </Checkbox>
          </CustomFormItem>
        </Form>
      </ToggleFeaturesPageComponent>
    )
  }
}
