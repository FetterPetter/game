import React, { useEffect, useRef } from "react";
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
  { name: "Austin", lat: 30.2672, lon: -97.7431 }, // Texas, USA
  { name: "Denver", lat: 39.7392, lon: -104.9903 }, // Colorado, USA
  { name: "Dallas", lat: 32.7767, lon: -96.797 }, // Texas, USA
  { name: "Phoenix", lat: 33.4484, lon: -112.074 }, // Arizona, USA
  { name: "Chicago", lat: 41.8781, lon: -87.6298 }, // Illinois, USA (near lake, not ocean)
  { name: "Madrid", lat: 40.4168, lon: -3.7038 }, // Spain — deep inland
  { name: "Vienna", lat: 48.2082, lon: 16.3738 }, // Austria
  { name: "Prague", lat: 50.0755, lon: 14.4378 }, // Czech Republic
  { name: "Budapest", lat: 47.4979, lon: 19.0402 }, // Hungary
  { name: "Munich", lat: 48.1351, lon: 11.582 }, // Southern Germany
  { name: "Johannesburg", lat: -26.2041, lon: 28.0473 }, // South Africa (not coastal like Cape Town)
  { name: "Nairobi", lat: -1.2921, lon: 36.8219 }, // Kenya
  { name: "Addis Ababa", lat: 9.03, lon: 38.74 }, // Ethiopia
  { name: "Brasília", lat: -15.7801, lon: -47.9292 }, // Brazil (inland capital)
  { name: "New Delhi", lat: 28.6139, lon: 77.209 }, // India
  { name: "Moscow", lat: 55.7558, lon: 37.6173 }, // Russia
  { name: "Canberra", lat: -35.2809, lon: 149.13 }, // Australia
  { name: "Abuja", lat: 9.0578, lon: 7.4951 }, // Nigeria
  { name: "Lima", lat: -12.0464, lon: -77.0428 },
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
