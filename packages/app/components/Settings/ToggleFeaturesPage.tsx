import { ReactElement } from 'react'
import CourseOverrideSettings from './CourseOverrideSettings'
import styled from 'styled-components'
import CourseRoster from './CourseRoster'

type CourseRosterPageProps = { courseId: number }

const CourseRosterPageComponent = styled.div`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
`

export default function ToggleFeaturesPage({
  courseId,
}: CourseRosterPageProps): ReactElement {
  return (
    <CourseRosterPageComponent>
      <h1>hello world!</h1>
    </CourseRosterPageComponent>
  )
}
