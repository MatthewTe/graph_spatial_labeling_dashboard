import * as React from 'react';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import clsx from 'clsx';

import SingleNodeTable from '../SingleNodeProperties/NodePropertiesTableComponent';
import StaticSpatialFileSearch from '../StaticSpatailFiles/StaticSpatialFilesComponent';
import SpatialLabelingComponent from '../SpatialLabelingComponent/SpatialLabelingComponent';

import "./MainNodesStyling.css"

const columns = [
    { field: 'id', headerName: 'ID', width: 400 },
    { 
        field: 'labels',
        headerName: 'Labels',
        description: 'All of the Labels associated with the node',
        width: 400
    },
    {
        field: 'has_spatial_references',
        headerName: 'Has Spatial References',
        cellClassName: (params => {
            if (params.value == null) {
                return ''
            }

            return clsx('main-node-table', {
                valid: params.value == true,
                invalid: params.value == false
            })

        }),
        width: 400
    }
];

const paginationModel = { page: 0, pageSize: 5 };

export default function MainNodeTable({records}) {
    
    const [selectedNodeId, setSelectedNodeId ] = useState(null)
    const [selectedMinioBucket, setSelectedMinioBucket] = useState(null)
    const [selectedMinioFilePath, setSelectedMinioFilePath] = useState(null)

    // Populating the main table from all of the nodes:
    const rows = []
    records.forEach(nodeRecord => {
        rows.push({
            id: nodeRecord._fields[0].id, 
            labels: nodeRecord._fields[0].nodeLabels,
            has_spatial_references: nodeRecord._fields[0].hasSpatialRelationship
        })
    });

    // Callbacks that set the selected static file path and the bucket:
    function onMinioBucketSelection(bucketName) {
        setSelectedMinioBucket(bucketName)
    }

    function onMinioFilePathSelection(minioFilePath) {
        setSelectedMinioFilePath(minioFilePath)
    }

    return (
    <>
    <div className="main_nodes_table_container">
        <Box
            sx={{
                height: 300,
                width: '100%',
                '& .super-app-theme--cell': {
                backgroundColor: 'rgba(224, 183, 60, 0.55)',
                color: '#1a3e72',
                fontWeight: '600',
                },
                '& .main-node-table.valid': {
                backgroundColor: 'rgba(157, 255, 118, 0.49)',
                color: '#1a3e72',
                fontWeight: '600',
                },
                '& .main-node-table.invalid': {
                backgroundColor: '#d47483',
                color: '#1a3e72',
                fontWeight: '600',
                },
            }}
        >
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            onRowClick={(params) => setSelectedNodeId(params.row.id)}
            sx={{ border: 0 }}
            />
        </Paper>
        </Box>
    </div>
    <span style={{ display: "inline-flex", gap: "10px", width: "100%", alignItems: "stretch"}}>
        <SingleNodeTable 
            selectedNodeId={selectedNodeId}
            records={records}
            style={{ flex: "1 1 50%" }}
        >
        </SingleNodeTable>

        <StaticSpatialFileSearch
            selectedNodeId={selectedNodeId}
            onMinioBucketSelection={onMinioBucketSelection}
            selectedMinioBucket={selectedMinioBucket}
            onMinioFilePathSelection={onMinioFilePathSelection}
            style={{ flex: "1 1 50%" }}
        >
        </StaticSpatialFileSearch>
    </span>
    <div style={{width: "100%", border: "2px solid black", marginTop: "2rem"}}>
        <SpatialLabelingComponent 
            records={records}
            selectedNodeId={selectedNodeId}
            bucketName={selectedMinioBucket}
            fileName={selectedMinioFilePath}
        ></SpatialLabelingComponent>       
    </div>
    </>
    );
}