import "./StaticSpatialContainerStyles.css"
import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { error } from "neo4j-driver";

const columns = [
    {
        field: 'file_name',
        headerName: 'Name',
        width: 400
    },
    {
        field: 'file_size',
        headerName: 'Size', 
        width: 100
    },
    {
        field: 'list_modified',
        headerName: 'Last Modified',
        width: 200
    }
]

export default function StaticSpatialFileSearch({
    selectedNodeId, 
    onMinioBucketSelection, 
    selectedMinioBucket,
    onMinioFilePathSelection 
}) {

    const [staticFolderPath, setStaticFolderPath] = useState('');
    const [availableMinioBuckets, setAvailableMinioBuckets] = useState([])
    const [minioBucketData, setMinioBucketData] = useState(null)

    useEffect(() => {
        if (selectedNodeId) {
            const response = fetch(`http://localhost:8080/v1/api/minio/list_objects?${new URLSearchParams({
                prefix: staticFolderPath,
                bucket_name: selectedMinioBucket
            })}`)
            .then(response => response.json())
            .then(data => {
                setMinioBucketData(data)
            })
            .catch(error => console.log(error))
        }
    }, [staticFolderPath])
    

    useEffect(() => {
        const response = fetch(`http://localhost:8080/v1/api/minio/buckets`)
        .then(response => response.json())
        .then(data => {
            setAvailableMinioBuckets(data)
            onMinioBucketSelection(data[0])
        })
        .catch(error => console.log(error))
    }, [])
    
    return (
        <>
        <div className="static_spatial_files_container">
            <div className="static_file_bucket_selection">
                <label htmlFor="static_file_bucket_selection"></label>
                <select onChange={(e) => onMinioBucketSelection(e.target.value)} name="static_file_bucket_selection" id="static_file_bucket_selection">
                    {
                        availableMinioBuckets.map((bucketName) => (
                            <option key={bucketName} id={bucketName} value={bucketName}>
                                {bucketName}
                            </option>
                        ))
                    }
                </select>
            </div>
            <div className="static_file_search_box">
                <label htmlFor="minio_bucket_search_input">Minio Prefix:</label>
                <input 
                    id="minio_bucket_search_input" 
                    type="text" 
                    onChange={e => setStaticFolderPath(e.target.value)}
                />
            </div>
            <div className="static_file_objects_list">
                <DataGrid
                    rows={minioBucketData}
                    columns={columns}
                    getRowId={(row) => row.file_name}
                    onRowClick={(params) => onMinioFilePathSelection(params.row.file_name)}
                >
                </DataGrid>
            </div>
        </div>
        </>
    )
}