import React, { useEffect, useState } from 'react';
import styles from "./MapSelector.module.css";

interface MapSelectorProps {
  selectedMap: string;
  handleMapChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  mapView: any; 
}

const MapSelector: React.FC<MapSelectorProps> = ({ selectedMap, handleMapChange, mapView }) => {
  const [availableMaps, setAvailableMaps] = useState<string[]>([]); 
  const [showSelector, setShowSelector] = useState(false); 

  useEffect(() => {
    if (mapView && mapView.venue && mapView.venue.maps) {
      const mapNames = mapView.venue.maps.map((map: any) => map.name); 
      setAvailableMaps(mapNames);
    }
  }, [mapView]);

  const handleToggleSelector = () => {
    setShowSelector(!showSelector); 
  };

  return (
    <div className={styles.map_selector_container}>
      <div className={styles.menu_btn_levels} onClick={handleToggleSelector}>
        <i className="fa-solid fa-layer-group"></i>
      </div>

      <select
        aria-label="Select map"
        className={`${styles.map_selector} ${showSelector ? styles.show : ''} ${styles['transition-slide']}`}
        value={selectedMap}
        onChange={handleMapChange}
      >
        {availableMaps.map((mapName) => (
          <option key={mapName} value={mapName}>
            {mapName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MapSelector;
