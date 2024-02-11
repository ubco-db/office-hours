import { Form, Checkbox, Spin } from 'antd'
import { ReactElement } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'

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
  const { data } = useSWR(
    `${role}/${page}/${search}`,
    async () => await API.course.getUserInfo(courseId, page, role, search),
  )
  if (!data) {
    return <Spin tip="Loading..." size="large" />
  } else {
    return (
      <ToggleFeaturesPageComponent>
        <h2>Enable/Disable Features for this Course</h2>

        <Form className="ml-2 !text-2xl">
          <CustomFormItem>
            <Checkbox defaultChecked>Asynchronous Question Center</Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox defaultChecked>Chatbot</Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox defaultChecked>Queues</Checkbox>
          </CustomFormItem>
          <CustomFormItem>
            <Checkbox defaultChecked>Ads</Checkbox>
          </CustomFormItem>
        </Form>
      </ToggleFeaturesPageComponent>
    )
  }
}
