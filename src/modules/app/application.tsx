import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";
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
const darkMatterLayer = new TileLayer({
  source: new XYZ({
    url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attributions: '&copy; <a href="https://carto.com/">CARTO</a>',
  }),
});
const osmLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: "map",
  view: new View({
    center: [10.8, 59.9],
    zoom: 12.82,
    minZoom: 12.82,
    maxZoom: 12.82,
  }),
  layers: [darkMatterLayer, bloodLayer, playerLayer, enemyLayer],
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
