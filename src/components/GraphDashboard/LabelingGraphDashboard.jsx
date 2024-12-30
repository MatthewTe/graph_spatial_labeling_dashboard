import { useState } from 'react';
import './LabelingGraphDashboard.css';
import MainTableDashboard from './MainNodeTables/MainNodesTables'
import { useReadCypher } from 'use-neo4j';

export default function GraphDashboard() {
    const [cypherQuery, setCypherQuery] = useState(`
        MATCH (n) 
        RETURN 
        n {
            .*,
            hasSpatialRelationship: EXISTS { MATCH (n)-[:SPATIAL_LABEL]-() },
            nodeLabels: labels(n)
        } AS nodeWithFlag
        `
    );
    const [queryToRun, setQueryToRun] = useState(cypherQuery);
    const { loading, records, error, run } = useReadCypher(queryToRun);

    const handleRunQuery = () => {
        // Run the Cypher query when the button is clicked
        setQueryToRun(cypherQuery);
        run();
    };

    return (
        <div className="wrapper">
            <textarea
                cols="30"
                rows="5"
                value={cypherQuery}
                onChange={(e) => setCypherQuery(e.target.value)}
                placeholder="Enter Cypher query here"
            ></textarea>
            <button onClick={handleRunQuery} className="run-query-btn">
                Run Query
            </button>

            <div className="result">
                {loading && <div>Loading...</div>}
                {error && <div>Error: {error.message}</div>}
                {!loading && records && (
                    <div>
                        <MainTableDashboard records={records}></MainTableDashboard>
                   </div>
                )}
            </div>
        </div>
    );
}
