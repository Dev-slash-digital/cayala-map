import {
    E_SDK_EVENT,
    E_SDK_EVENT_PAYLOAD,
    MapView,
  } from "@mappedin/mappedin-js";
  import { useCallback, useEffect } from "react";
  
  export const useMapClick = (
    mapView: MapView | undefined,
    onClick: (payload: E_SDK_EVENT_PAYLOAD[E_SDK_EVENT.CLICK]) => void
  ) => {
    const handleClick = useCallback(
      (payload: E_SDK_EVENT_PAYLOAD[E_SDK_EVENT.CLICK]) => {
        onClick(payload);
      },
      [onClick]
    );
  
    // suscribe to E_SDK_EVENT.CLICK
  
    useEffect(() => {
      if (!mapView) return;
  
      mapView.FloatingLabels.labelAllLocations({ interactive: true });
  
      mapView.on(E_SDK_EVENT.CLICK, handleClick);
  
      // cleanups
      return () => {
        mapView.off(E_SDK_EVENT.CLICK, handleClick);
      };
    }, [mapView, handleClick]);
  };
  