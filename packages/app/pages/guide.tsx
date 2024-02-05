import NavBar from '../components/Nav/NavBar'
import 'antd/dist/antd.css'

const GuidePage = () => {
  return (
    <div>
      <NavBar />

      <div id="welcome" className="pt-9/16 w-full text-center">
        <h1 className="mx-auto my-4 text-5xl font-bold">Welcome to HelpMe</h1>
        <iframe
          className="min-h-200px mx-auto"
          src="https://www.youtube.com/embed/RjNERqpIQaw"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div id="features" className="my-10">
        <h2 className="my-6 text-center text-3xl font-semibold">
          Key Features
        </h2>
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          <div className="mb-4 w-[500px] rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">The Chatbot </h3>
            <ul className="list-none space-y-2 text-lg">
              <li>Easy management of chatbot</li>
              <li>Q & A analytics </li>
              <li>Customized chatbot for every class</li>
            </ul>
          </div>

          <div className="mb-4 w-[500px] rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Office hours</h3>
            <ul className="list-none space-y-2 text-lg">
              <li>Join office hour queue</li>
              <li>Visualize queue in each office hour</li>
              <li>Prephrase questions in queue ticket</li>
            </ul>
          </div>

          <div className="mb-4 w-[500px] rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">
              Async question center
            </h3>
            <ul className="list-none space-y-2 text-lg">
              <li>Ask your question anytime</li>
              <li>Get answers from all faculties </li>
              <li>View public questions and answers </li>
            </ul>
          </div>

          <div className="mb-4 w-[500px] rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Insights</h3>
            <ul className="list-none space-y-2 text-lg">
              <li>View student questions</li>
              <li>Analyze help seeking behavior in any class</li>
              <li>
                Anlytics statistics of teaching assistant and student
                interactions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuidePage
