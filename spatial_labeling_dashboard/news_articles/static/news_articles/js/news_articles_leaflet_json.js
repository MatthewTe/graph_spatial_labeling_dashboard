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
    const layersConfig = JSON.parse(document.getElementById("tt_news_article_layers").textContent);
    
    const renderLabelOutputUrl = window.location.origin.concat(htmxRenderLabelingComponent.slice(0, -1).replace('"', '').replace(/\/None/g, ""));
    const spatialSearchDataList = document.getElementById("rendered_spatial_dataset_search_datalist")
    
    const spatialFieldNameMap = new Map();

    const createdLayers = {}
    for (const [key, value] of Object.entries(layersConfig)) {
        const layerResponse = await fetch(spatialParquetStreamUrl, {
            method: "POST",
            headers: {"X-CSRFToken": csrftoken},
            body: JSON.stringify({
                format_type: 'geojson',
                parquet_path: value.prefix,
                bucket_name: value.bucket
            }
        )})

        const layerResponseJSON = await layerResponse.json()
        var vectorLayer = L.geoJSON(JSON.parse(layerResponseJSON), {
            onEachFeature: (feature, layer) => {
                spatialFieldNameMap.set(feature.properties.name, feature.geometry.coordinates[0])
                var option = document.createElement('option');
                option.innerHTML = feature.properties.name;
                spatialSearchDataList.appendChild(option);
            }
        })
        .bindPopup(function (layer) {
            return layer.feature.properties[value.main_association_col]
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
            htmx.ajax("POST", `${renderLabelOutputUrl}/${selectedPopupName}/${selectedPoint.lat}/${selectedPoint.lng}/${selectedNodeId}/${value.main_association_col}/${value.prefix.replace("/", "-")}`, {
                target: '#news_articles_label_output_component',
                }
            )
        });

        createdLayers[key] = vectorLayer
    }

    var layerControl = L.control.layers(null, createdLayers).addTo(map);

    // Also needs to create the dropdown event listener that pans when selects a name location:
    const panToSpatialFeatureSearch = document.getElementById('rendered_spatial_dataset_search')
    panToSpatialFeatureSearch.addEventListener('keypress', (e) => {
        if (e.key === "Enter") {
            var firstVertex = spatialFieldNameMap.get(e.target.value);
            map.flyTo([firstVertex[1], firstVertex[0]], 18);
        }
    })
})