import { Collapse, Layout } from 'antd'
import NavBar from '../components/Nav/NavBar'
import 'antd/dist/antd.css'

const { Panel } = Collapse
const { Content, Footer } = Layout

const GuidePage = () => {
  return (
    <Layout className="layout">
      <NavBar />

      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <section id="welcome">
            <h1>Welcome to HelpMe</h1>
            <h2>For Instructors</h2>
            <h3> Video to get started</h3>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/RjNERqpIQaw"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <p>Everything you need to know to get started.</p>
          </section>

          <section id="instructors">
            <p>Learn how to create and manage your courses.</p>

            <Collapse accordion>
              <Panel header="Update Course Invite Code" key="2">
                <p>
                  Update your course invite code, which students can use to
                  register into the course
                </p>
              </Panel>

              <Panel header="Chatbot Settings" key="3">
                <ul>
                  <p>Change related documents in course admin panel</p>
                  <p>
                    The documents are always accompanied by the URl of resource
                  </p>
                  <p>Chatbot responses are returned with the URL</p>
                </ul>
              </Panel>

              <Panel header="Manage queue" key="4">
                <ul>
                  <li>
                    <p>
                      Open any queue, change the queue details to change details
                    </p>
                  </li>
                  <li>
                    <p>Check in to enable queue or manually enable</p>
                  </li>
                  <li>
                    <p>The last instructor to check out will disable queue</p>
                  </li>
                </ul>
              </Panel>

              <Panel header="View Insights on Insights Page" key="5">
                <p>View Insights of the the course in course insights page.</p>
              </Panel>
            </Collapse>
          </section>
          <section id="students">
            <h2>For Students</h2>
            <p>Guidelines on how to participate in courses.</p>
            <h3> Video to get started</h3>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/jaeivUdjHQ8"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <Collapse accordion>
              <Panel header="Join a Course" key="1">
                <p>Join a course using the course invite code</p>
              </Panel>
              <Panel header="Ask Questions" key="2">
                <p>Ask questions in the course queue, </p>
              </Panel>
              <Panel header="Chatbot" key="3">
                <p>Chatbot will respond to your questions</p>
              </Panel>
              <Panel header="async questions" key="4">
                <p>Ask async questions in the course async queue</p>
              </Panel>
            </Collapse>
          </section>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>HelpMe ©2023 </Footer>
    </Layout>
  )
}

export default GuidePage
