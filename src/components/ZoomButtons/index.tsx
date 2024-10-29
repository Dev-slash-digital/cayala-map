
import React, { useEffect, useCallback } from 'react';
import "./ZoomButtons.css";

interface ZoomButtonsProps {
  mapView: any;
}

const ZoomButtons: React.FC<ZoomButtonsProps> = ({ mapView }) => {
  useEffect(() => {
    console.log('mapView in ZoomButtons:', mapView);
    console.log('mapView.Camera in ZoomButtons:', mapView?.Camera);

    if (mapView && mapView.Camera) {
      console.log('Camera methods and properties:');
      for (let prop in mapView.Camera) {
        console.log(prop, typeof mapView.Camera[prop]);
      }
    }
  }, [mapView]);

  const changeZoom = useCallback((zoomFactor: number) => {
    if (mapView && mapView.Camera) {
      const currentZoom = mapView.Camera.zoom;
      console.log('Current zoom:', currentZoom);

      const newZoom = currentZoom * zoomFactor;
      console.log('Attempting to set new zoom:', newZoom);

      if (typeof mapView.Camera.setZoom === 'function') {
        mapView.Camera.setZoom(newZoom);
      } else if (typeof mapView.Camera.set === 'function') {
        mapView.Camera.set({ zoom: newZoom });
      } else if (typeof mapView.Camera.focusOn === 'function') {
        mapView.Camera.focusOn({
          zoom: newZoom,
          position: mapView.Camera.position,
          duration: 500
        });
      } else {
        console.error('No method found to change zoom');
      }

      if (typeof mapView.update === 'function') {
        setTimeout(() => {
          mapView.update();
          console.log('New zoom after update:', mapView.Camera.zoom);
        }, 100);
      }
    } else {
      console.log('mapView or mapView.Camera is not available');
    }
  }, [mapView]);

  const handleZoomIn = () => {
    console.log('Zoom In clicked');
    changeZoom(0.8); 
  };

  const handleZoomOut = () => {
    console.log('Zoom Out clicked');
    changeZoom(1.2); 
  };

  return (
    <div className="zoom-buttons">
      <button onClick={handleZoomIn}><i className="fa-solid fa-plus"></i></button>
      <button onClick={handleZoomOut}><i className="fa-solid fa-minus"></i></button>
    </div>
  );
};

export default ZoomButtons;