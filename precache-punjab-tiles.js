const fs = require('fs');
const path = require('path');
const http = require('http');

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

const bounds = {
  minLat: 30.95,
  maxLat: 31.35,
  minLon: 74.85,
  maxLon: 75.85,
};

const zooms = [10, 11, 12, 13];

async function fetchTile(z, x, y) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000/api/map-tiles/${z}/${x}/${y}.png`, (res) => {
      res.resume();
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function main() {
  console.log('Pre-caching Punjab Sutlej Basin map tiles...');
  let total = 0;
  for (const z of zooms) {
    const minX = lon2tile(bounds.minLon, z);
    const maxX = lon2tile(bounds.maxLon, z);
    const minY = lat2tile(bounds.maxLat, z);
    const maxY = lat2tile(bounds.minLat, z);

    console.log(`Zoom ${z}: X[${minX}..${maxX}], Y[${minY}..${maxY}]`);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        await fetchTile(z, x, y);
        total++;
      }
    }
  }
  console.log(`Done! Pre-cached ${total} tiles.`);
}

main();
