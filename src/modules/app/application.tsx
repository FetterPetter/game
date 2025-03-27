import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import {
  bloodLayer,
  enemyLayer,
  GameButton,
  playerLayer,
  source,
} from "./addGameCharacter";

useGeographic();

const map = new Map({
  view: new View({ center: [10.8, 59.9], zoom: 13 }),
  layers: [
    new TileLayer({ source: new OSM() }),
    bloodLayer,
    playerLayer,
    enemyLayer,
  ],
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <div className="game-container">
        <GameButton map={map} source={source} />
        <div ref={mapRef} className="game-map"></div>
      </div>
    </>
  );
}
