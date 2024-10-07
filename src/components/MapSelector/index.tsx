// src/components/MapSelector.tsx

import React from 'react';
import styles from "./MapSelector.module.css";

interface MapSelectorProps {
  selectedMap: string;
  handleMapChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ selectedMap, handleMapChange }) => {
  return (

    <div className={styles.map_selector_container}>
      <div className={styles.menu_btn_levels}>
        <i className="fa-solid fa-layer-group"></i>
      </div>
      <select
        aria-label="Select map"
        className={styles.map_selector}
        value={selectedMap}
        onChange={handleMapChange}
      >
        {/* Asegúrate de que los valores correspondan con los nombres en venue.maps */}
        <option value="Planta Baja">Planta Baja</option>
        <option value="Planta Superior">Planta Superior</option>
        {/* Agrega más opciones según los mapas disponibles */}
      </select>

    </div>

  );
};

export default MapSelector;