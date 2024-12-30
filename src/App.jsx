import { Neo4jProvider } from 'use-neo4j'

import GraphDashboard from "./components/GraphDashboard/LabelingGraphDashboard"

function App() {

  return (
    <>
      <Neo4jProvider>
        <GraphDashboard></GraphDashboard>
      </Neo4jProvider>
    </>
  )
}

export default App
