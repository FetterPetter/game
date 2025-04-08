import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import {
  bloodLayer,
  bossLayer,
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
const capitalCities = [
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Washington, D.C.", lat: 38.9072, lon: -77.0369 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "New Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Brasília", lat: -15.7801, lon: -47.9292 },
  { name: "Ottawa", lat: 45.4215, lon: -75.6992 },
  { name: "Canberra", lat: -35.2809, lon: 149.13 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Abuja", lat: 9.0578, lon: 7.4951 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
  { name: "Kuala Lumpur", lat: 3.139, lon: 101.6869 },
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Oslo", lat: 59.9139, lon: 10.7522 },
];
const getRandomCapitalCity = () => {
  const randomIndex = Math.floor(Math.random() * capitalCities.length);
  return capitalCities[randomIndex];
};

const randomCity = getRandomCapitalCity();
const map = new Map({
  target: "map",
  view: new View({
    center: [randomCity.lon, randomCity.lat],
    zoom: 12.82,
    minZoom: 12.82,
    maxZoom: 12.82,
  }),
  layers: [darkMatterLayer, bloodLayer, playerLayer, enemyLayer, bossLayer],
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <div className={`game-container`}>
        <GameButton map={map} source={source} />
        <div ref={mapRef} className="game-map"></div>
      </div>
    </>
  );
}
