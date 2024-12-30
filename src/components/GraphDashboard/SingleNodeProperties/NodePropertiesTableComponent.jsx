import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';

import './NodePropertiesTableStyles.css'

const columns = [
    {field: 'property_name', headerName: 'Name', width: 300},
    {field: 'property_value', headerName: 'Value', width: 700}
]

export default function SingleNodeTable({selectedNodeId, records}) {

    let selectedNodeProperties;
    let rows = [];
    if (selectedNodeId) {
        selectedNodeProperties = records.find(record => record._fields[0].id === selectedNodeId)

        for (const [key, value] of Object.entries(selectedNodeProperties._fields[0])) {
            rows.push({property_name: key, property_value: value})
        }
    }


    return (
        <>
        <div className='single_node_property_table'>
            {(rows.length != 0) && (
                <Paper sx={{ height: 700, width: '100%' }}>
                    <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.property_name}
                    pageSizeOptions={[5, 10]}
                    sx={{ border: 0 }}
                    />
                </Paper>
            )}
        </div>
        </>
    )
}