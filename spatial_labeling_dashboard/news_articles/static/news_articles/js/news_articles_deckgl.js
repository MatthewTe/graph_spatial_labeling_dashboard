document.addEventListener("DOMContentLoaded", async (event) => {

    const parquet = await import("https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.0/esm/+esm")
    await parquet.default();
    const arrow = await import("https://cdn.jsdelivr.net/npm/apache-arrow@18.1.0/+esm")
    
    const {DeckGL, ScatterplotLayer} = deck;

    const { GeoArrowPathLayer } = window["@geoarrow/deck"]["gl-geoarrow"];

    const map = new DeckGL({
        container: 'news_articles_deckgl_component',
        mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
        initialViewState: {
            longitude: -61.516082,
            latitude: 10.668748,
            zoom: 12
        },
        controller: true,
        layers: [
        ]
        });

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const minoFileInputPath = document.getElementById('minio_parquet_rendering_path');

    const streamSpatialDataComponent = document.getElementById("stream_spatial_parquet_url").textContent;
    const spatialParquetStreamUrl = window.location.origin.concat(streamSpatialDataComponent.slice(0,-1).replace('"', ''))

    
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
                        format_type: 'geoarrow_stream',
                        parquet_path: e.target.value,
                        bucket_name: minioBucket
                    })
                }
            )
            .then((response) => response.arrayBuffer())
            .then((buffer) => {
                const parquetUint8Array = new Uint8Array(buffer);
                const arrowWasmTable = parquet.readParquet(parquetUint8Array);
                const arrowTable = arrow.tableFromIPC(arrowWasmTable.intoIPCStream());

                const geometryLinestringLayer = new GeoArrowPathLayer({
                    id: 'labeling-geoarrow-layer',
                    data: arrowTable,
                    pickable: true,
                    getPosition: arrowTable.getChild("geometry"),
                }) 
                map.setProps({
                    layers: [geometryLinestringLayer] 
                });
            })
        }
    }) 
});
