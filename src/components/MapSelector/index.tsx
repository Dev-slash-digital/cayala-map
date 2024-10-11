import React, { useEffect, useState } from 'react';
import styles from "./MapSelector.module.css";

interface MapSelectorProps {
  selectedMap: string;
  handleMapChange: (mapName: string) => void;
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

  const handleSelectMap = (mapName: string) => {
    handleMapChange(mapName);
    setShowSelector(false);
  };

  return (
    <div className={styles['map_selector_container']}>
      <div className={styles['menu_btn_levels']} onClick={handleToggleSelector}>
        <i className="fa-solid fa-layer-group"></i>
      </div>
      {showSelector && (
        <ul className={`${styles['map_selector']} ${styles.show}`} id="mapSelector">
          {availableMaps.map((mapName) => (
            <li 
              key={mapName} 
              className={`${styles['map_item']} ${selectedMap === mapName ? styles.selected : ''}`}
              onClick={() => handleSelectMap(mapName)}
            >
              {mapName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapSelector;