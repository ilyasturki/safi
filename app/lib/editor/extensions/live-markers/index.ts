import { createMarkerHider } from './hide-marker'
import { marker } from './marker'

export const liveMarkers = [
    createMarkerHider(marker.heading),
    createMarkerHider(marker.quote),
    createMarkerHider(marker.emphasis),
    createMarkerHider(marker.strikethrough),
    createMarkerHider(marker.code),
    createMarkerHider(marker.horizontalRule),
]
