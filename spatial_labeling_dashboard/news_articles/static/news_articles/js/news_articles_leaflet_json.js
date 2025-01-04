document.addEventListener("DOMContentLoaded", async (event) => {
    var map = L.map('news_articles_deckgl_component').setView([10.668748, -61.516082], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const minoFileInputPath = document.getElementById('minio_parquet_rendering_path');
    const streamSpatialDataComponent = document.getElementById("stream_spatial_parquet_url").textContent;
    const spatialParquetStreamUrl = window.location.origin.concat(streamSpatialDataComponent.slice(0,-1).replace('"', ''));

    minoFileInputPath.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            
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
                L.geoJSON(JSON.parse(data)).addTo(map);
            })

        }
    }) 


})