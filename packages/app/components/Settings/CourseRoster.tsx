import { DownOutlined, SearchOutlined } from '@ant-design/icons'
import { API } from '@koh/api-client'
import { Role } from '@koh/common'
import {
  Divider,
  Dropdown,
  message,
  Input,
  List,
  Menu,
  Pagination,
  Spin,
} from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import { useEffect, useState } from 'react'
import { ReactElement } from 'react'
import styled from 'styled-components'

type CourseRosterProps = { courseId: number }

type RenderTableProps = {
  courseId: number
  role: Role
  listTitle: string
  displaySearchBar: boolean
  searchPlaceholder: string
}

interface UserPartial {
  id: string
  photoURL: string
  name: string
  email: string
}

const CourseRosterComponent = styled.div`
  margin-left: auto;
  margin-right: auto;
`

const TableBackground = styled.div`
  background-color: white;
`

export default function CourseRoster({
  courseId,
}: CourseRosterProps): ReactElement {
  return (
    <CourseRosterComponent>
      <h1>Course Roster</h1>
      <RenderTable
        courseId={courseId}
        role={Role.PROFESSOR}
        listTitle={'Professors'}
        displaySearchBar={false}
        searchPlaceholder="Search Professors"
      />
      <br />
      <RenderTable
        courseId={courseId}
        role={Role.TA}
        listTitle={'Teaching Assistants'}
        displaySearchBar={true}
        searchPlaceholder="Search TAs"
      />
      <br />
      <RenderTable
        courseId={courseId}
        role={Role.STUDENT}
        listTitle={'Students'}
        displaySearchBar={true}
        searchPlaceholder="Search students"
      />
      <br />
      <Divider />
    </CourseRosterComponent>
  )
}

function RenderTable({
  courseId,
  role,
  listTitle,
  displaySearchBar,
  searchPlaceholder,
}: RenderTableProps): ReactElement {
  const [page, setPage] = useState(1)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(null)

  const handleInput = (event) => {
    event.preventDefault()
    setInput(event.target.value)
  }
  const handleSearch = (event) => {
    event.preventDefault()
    setSearch(event.target.value)
    setPage(1)
  }
  const fetchUsers = async () => {
    const data = await API.course.getUserInfo(courseId, page, role, search)
    setUsers(data.users)
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, role, courseId])

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      await API.course.updateUserRole(courseId, userId, newRole)
      message.success(`${userName} successfully updated to ${newRole} role`)
    } catch (error) {
      message.error(`Failed to update ${userName} to ${newRole}`)
    }
  }

  if (!users) {
    return <Spin tip="Loading..." size="large" />
  } else {
    return (
      <>
        <TableBackground>
          <div style={{ backgroundColor: '#f0f0f0', height: '56px' }}>
            <h3
              style={{
                position: 'relative',
                left: '10px',
                top: '14px',
              }}
            >
              {listTitle}
            </h3>
          </div>
          {displaySearchBar && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={input}
              onChange={handleInput}
              onPressEnter={handleSearch}
            />
          )}
          <List
            dataSource={users}
            renderItem={(item: UserPartial) => (
              <List.Item
                key={item.id}
                className="flex items-center justify-between"
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.photoURL} />}
                  title={<span className="mr-2">{item.name}</span>}
                  className="flex-grow"
                />
                <span className="flex-grow justify-center">{item.email}</span>
                <Dropdown
                  overlay={
                    <Menu
                      onClick={async (e) => {
                        handleRoleChange(item.id, e.key, item.name)
                      }}
                    >
                      {role !== Role.PROFESSOR ? (
                        <Menu.Item key={Role.PROFESSOR}>Professor</Menu.Item>
                      ) : null}
                      {role !== Role.TA ? (
                        <Menu.Item key={Role.TA}>Teaching Assistant</Menu.Item>
                      ) : null}
                      {role !== Role.STUDENT ? (
                        <Menu.Item key={Role.STUDENT}>Student</Menu.Item>
                      ) : null}
                    </Menu>
                  }
                  className="flex-grow-0"
                >
                  <a
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    Change Role <DownOutlined />
                  </a>
                </Dropdown>
              </List.Item>
            )}
            bordered
          />
        </TableBackground>
        <br />
        {users.total > 50 && (
          <Pagination
            style={{ float: 'right' }}
            current={page}
            pageSize={50}
            total={users.total}
            onChange={(page) => setPage(page)}
            showSizeChanger={false}
          />
        )}
      </>
    )
  }
}
