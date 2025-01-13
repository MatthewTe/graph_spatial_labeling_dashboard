document.addEventListener("DOMContentLoaded", async (event) => {
    var map = L.map('news_articles_deckgl_component').setView([10.668748, -61.516082], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const minoFileInputPath = document.getElementById('minio_parquet_rendering_path');
    const streamSpatialDataComponent = document.getElementById("stream_spatial_parquet_url").textContent;
    const htmxRenderLabelingComponent = document.getElementById("render_news_article_labeling_component_url").textContent;

    const spatialParquetStreamUrl = window.location.origin.concat(streamSpatialDataComponent.slice(0,-1).replace('"', ''));
    const renderLabelOutputUrl = window.location.origin.concat(htmxRenderLabelingComponent.slice(0, -1).replace('"', '').replace(/\/None/g, ""));
    const spatialSearchDataList = document.getElementById("rendered_spatial_dataset_search_datalist")
    
    const spatialFieldNameMap = new Map();

    fetch(
        spatialParquetStreamUrl,
        {
            method: "POST",
            headers: {"X-CSRFToken": csrftoken},
            body: JSON.stringify({
                format_type: 'geojson',
                parquet_path: 'layers/tt_roads.parquet',
                bucket_name: 'trinidad-tobago'
            })
        }
    )
    .then((response) => response)
    .then((response) => response.json())
    .then((data) =>  {
        const roadsVectorLayer = L.geoJSON(JSON.parse(data), {
            onEachFeature: (feature, layer) => {

                spatialFieldNameMap.set(feature.properties.name, feature.geometry.coordinates[0])
                var option = document.createElement('option');
                option.innerHTML = feature.properties.name;
                spatialSearchDataList.appendChild(option);
            }
        })
        .bindPopup(function (layer) {
            return layer.feature.properties.name
        })
        .on("popupopen", function (event) {
            var selectedPopupName = event.popup._contentNode.innerHTML;
            var selectedPoint = event.popup._latlng
            
            // O(n^2) yikes
            var renderedSingleNodeTable = document.getElementById('singleNode-table')
            var selectedNodeId;
            for (let i = 0, row; row = renderedSingleNodeTable.rows[i]; i++ ) {
                for (let j = 0, col; col = row.cells[j]; j++) {
                    if (col.innerHTML === "id") {
                        selectedNodeId = row.cells[j+1].innerHTML
                    }
                }
            }

            // This is broken for some reason I can't pass values through the ajax request directly:
            console.log("Hello World?")
            htmx.ajax("POST", `${renderLabelOutputUrl}/${selectedPopupName}/${selectedPoint.lat}/${selectedPoint.lng}/${selectedNodeId}`, {
                target: '#news_articles_label_output_component',
                }
            )
            });

        fetch(
            spatialParquetStreamUrl,
            {
                method: "POST",
                headers: {"X-CSRFToken": csrftoken},
                body: JSON.stringify({
                    format_type: 'geojson',
                    parquet_path: 'layers/tt_admin_regions.parquet',
                    bucket_name: 'trinidad-tobago'
                })
            }
        )
        .then((response) => response)
        .then((response) => response.json())
        .then((data) =>  {
            const adminPolygonVectorLayer = L.geoJSON(JSON.parse(data), {
            })
            .bindPopup((layer) => {
                return layer.feature.properties.NAME_1
            })

            var layerControl = L.control.layers(null, {
                "osm_roads": roadsVectorLayer, 
                "osm_admin_areas": adminPolygonVectorLayer
            }).addTo(map);
        })

        

        // Also needs to create the dropdown event listener that pans when selects a name location:
        const panToSpatialFeatureSearch = document.getElementById('rendered_spatial_dataset_search')
        panToSpatialFeatureSearch.addEventListener('keypress', (e) => {
            if (e.key === "Enter") {
                var firstVertex = spatialFieldNameMap.get(e.target.value);
                map.flyTo([firstVertex[1], firstVertex[0]], 18);
            }
        })

    })
})