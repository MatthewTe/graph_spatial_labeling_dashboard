import { useEffect } from "react"

export default function SpatialLabelingComponent({selectedNodeId, records, bucketName, fileName}) {

    if (selectedNodeId) {
        console.log(fileName)
    }

    return (
        <div>
            Hello World
        </div>
    )
}