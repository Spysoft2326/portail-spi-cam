"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function EntrepriseMap({ latitude, longitude, name }: MapProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(name)
      .openPopup();

    return () => {
      map.remove();
    };
  }, [latitude, longitude, name]);

  return <div id="map" className="w-full h-64 rounded-xl" />;
}
