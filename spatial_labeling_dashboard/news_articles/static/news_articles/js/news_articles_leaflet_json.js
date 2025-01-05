document.addEventListener("DOMContentLoaded", async (event) => {
    var map = L.map('news_articles_deckgl_component').setView([10.668748, -61.516082], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const minoFileInputPath = document.getElementById('minio_parquet_rendering_path');
    const streamSpatialDataComponent = document.getElementById("stream_spatial_parquet_url").textContent;
    const spatialParquetStreamUrl = window.location.origin.concat(streamSpatialDataComponent.slice(0,-1).replace('"', ''));
    const spatialSearchDataList = document.getElementById("rendered_spatial_dataset_search_datalist")

    const spatialFieldNameMap = new Map();

    minoFileInputPath.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {

            spatialFieldNameMap.clear();
            while (spatialSearchDataList.firstChild) {
                spatialSearchDataList.removeChild(spatialSearchDataList.firstChild);
            }

            // Needs to be grabbed here because the component gets rendered via an ajax call after initalization:
            const minioBucket = document.getElementById('minio_bucket_dropdown').value

            fetch(
                spatialParquetStreamUrl,
                {
                    method: "POST",
                    headers: {"X-CSRFToken": csrftoken},
                    body: JSON.stringify({
                        format_type: 'geojson',
                        parquet_path: e.target.value,
                        bucket_name: minioBucket
                    })
                }
            )
            .then((response) => response)
            .then((response) => response.json())
            .then((data) =>  {
                L.geoJSON(JSON.parse(data), {
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
                    console.log(spatialFieldNameMap[selectedPopupName])
                })
                .addTo(map);

                // Also needs to create the dropdown event listener that pans when selects a name location:
                const panToSpatialFeatureSearch = document.getElementById('rendered_spatial_dataset_search')
                panToSpatialFeatureSearch.addEventListener('keypress', (e) => {
                    if (e.key === "Enter") {
                        var firstVertex = spatialFieldNameMap.get(e.target.value);
                        map.flyTo([firstVertex[1], firstVertex[0]], 18);
                    }
                })

            })

        }
    }) 


})