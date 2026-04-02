import { useMemo } from "react";
import {
  Circle,
  ImageOverlay,
  MapContainer,
  Marker,
  Pane,
  Tooltip,
} from "react-leaflet";
import { CRS, DivIcon, type LatLngBoundsExpression } from "leaflet";
import { ALARM_MAPS, normalizeMission } from "../../lib/alarmMapConfig";
import type { AlarmZone, Position } from "../../lib/types";
import {
  worldToImagePoint,
  imagePointToWorld,
  worldRadiusToImagePixels,
} from "../../lib/alarmMapMath";

import { useState } from "react";
import { useMapEvents } from "react-leaflet";

function CursorCoordinates({
  worldWidth,
  worldHeight,
  imageWidth,
  imageHeight,
}: {
  worldWidth: number;
  worldHeight: number;
  imageWidth: number;
  imageHeight: number;
}) {
  const [coords, setCoords] = useState<Position | null>(null);

  useMapEvents({
    mousemove(event) {
      const nextCoords = imagePointToWorld(
        [event.latlng.lat, event.latlng.lng],
        worldWidth,
        worldHeight,
        imageWidth,
        imageHeight,
      );

      setCoords(nextCoords);
    },
    mouseout() {
      setCoords(null);
    },
  });

  return (
    <div className="alarm-map-coordinates">
      <span className="alarm-map-coordinates__label">Cursor</span>
      <span className="alarm-map-coordinates__value">
        {coords ? `X: ${Math.round(coords.x)} Y: ${Math.round(coords.y)}` : "—"}
      </span>
    </div>
  );
}

type Props = {
  mission?: string | null;
  zones?: AlarmZone[];
};

function makeCenterIcon(color: string): DivIcon {
  return new DivIcon({
    className: "",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 0 0 3px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function AlarmMap({ mission, zones = [] }: Props) {
  const mapDefinition = useMemo(() => {
    return ALARM_MAPS[normalizeMission(mission)];
  }, [mission]);

  const imageBounds = useMemo<LatLngBoundsExpression>(() => {
    return [
      [0, 0],
      [mapDefinition.imagePixelHeight, mapDefinition.imagePixelWidth],
    ];
  }, [mapDefinition]);

  const center = useMemo<[number, number]>(() => {
    return [
      mapDefinition.imagePixelHeight / 2,
      mapDefinition.imagePixelWidth / 2,
    ];
  }, [mapDefinition]);

  return (
    <div className="alarm-map-card">
      <div className="alarm-map-card__header">
        <div>
          <h3 className="alarm-map-card__title">{mapDefinition.label} Map</h3>
          <p className="muted-text">
            Overview of configured alarm zones for this server.
          </p>
        </div>
      </div>

      <div className="alarm-map-shell">
        <MapContainer
          crs={CRS.Simple}
          center={center}
          zoom={-3}
          minZoom={-4.5}
          maxZoom={2}
          zoomSnap={0.25}
          zoomDelta={0.25}
          attributionControl={false}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          maxBounds={imageBounds}
          maxBoundsViscosity={1}
          bounceAtZoomLimits={false}
          className="alarm-map"
          preferCanvas={true}
        >
          <Pane name="map-image" style={{ zIndex: 200 }}>
            <ImageOverlay url={mapDefinition.imageUrl} bounds={imageBounds} />
          </Pane>

          <Pane name="alarm-zones" style={{ zIndex: 650 }}>
            {zones.map((zone) => {
              const center = worldToImagePoint(
                zone.origin,
                mapDefinition.worldWidth,
                mapDefinition.worldHeight,
                mapDefinition.imagePixelWidth,
                mapDefinition.imagePixelHeight,
              );

              const imageRadius = worldRadiusToImagePixels(
                zone.radius,
                mapDefinition.worldWidth,
                mapDefinition.imagePixelWidth,
              );

              return (
                <Pane
                  key={zone.id}
                  name={`alarm-zone-${zone.id}`}
                  style={{ zIndex: 650 }}
                >
                  <Marker position={center} icon={makeCenterIcon(zone.color)} />

                  <Circle
                    center={center}
                    radius={imageRadius}
                    pathOptions={{
                      color: zone.color,
                      fillColor: zone.color,
                      fillOpacity: 0.16,
                      opacity: 1,
                      weight: 2,
                      dashArray: zone.disabled ? "6 6" : undefined,
                    }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -32]}
                      opacity={1}
                      className="alarm-zone-tooltip"
                    >
                      <div className="alarm-zone-tooltip__content">
                        <div className="alarm-zone-tooltip__title">
                          {zone.name}
                        </div>

                        <div className="alarm-zone-tooltip__row">
                          <span className="alarm-zone-tooltip__label">
                            Coord
                          </span>
                          <span className="alarm-zone-tooltip__value">
                            {Math.round(zone.origin.x)},{" "}
                            {Math.round(zone.origin.y)}
                          </span>
                        </div>

                        <div className="alarm-zone-tooltip__row">
                          <span className="alarm-zone-tooltip__label">
                            Radius
                          </span>
                          <span className="alarm-zone-tooltip__value">
                            {zone.radius}m
                          </span>
                        </div>

                        <div className="alarm-zone-tooltip__row">
                          <span className="alarm-zone-tooltip__label">
                            Status
                          </span>
                          <span className="alarm-zone-tooltip__value">
                            {zone.disabled ? "Disabled" : "Active"}
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                  </Circle>
                </Pane>
              );
            })}
          </Pane>
          <CursorCoordinates
            worldWidth={mapDefinition.worldWidth}
            worldHeight={mapDefinition.worldHeight}
            imageWidth={mapDefinition.imagePixelWidth}
            imageHeight={mapDefinition.imagePixelHeight}
          />
        </MapContainer>
      </div>
    </div>
  );
}
