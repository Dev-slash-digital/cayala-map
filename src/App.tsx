// src/App.tsx

import "./App.css";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  CAMERA_EASING_MODE,
  E_SDK_EVENT,
  MappedinCategory,
  MappedinLocation,
  MappedinPolygon,
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";

import { CategoryList } from "./components/CategoryList";
import ShowMenuBar from "./components/ShowMenuBar";
import Languages from "./components/Languages";
import SearchBar from "./components/SearchBar";
import MapSelector from "./components/MapSelector"; 
import { options, walkingSpeed } from "./constants";
import { useMapView } from "./hooks/useMapView";
import { useSelectedLocation } from "./hooks/useSelectedLocation";
import { useVenue } from "./hooks/useVenue";
import { calculateWalkingTime } from "./utils";
import { ShowStore } from "./components/ShowStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Step } from "./types/types";

function App() {
  type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

  const [menuState, setMenuState] = useState<MenuState>("AllHidden");

  const handleMenuStateChange = useCallback((newState: MenuState) => {
    setMenuState(newState);
  }, []);

  const [departure, setDeparture] = useState<MappedinPolygon | null>(null);
  const [destination, setDestination] = useState<MappedinPolygon | null>(null);
  const [selectedMap, setSelectedMap] = useState("Planta Baja");
  const [steps, setSteps] = useState<Step[]>([]);
  const [totalWalkingTime, setTotalWalkingTime] = useState(0);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MappedinCategory | null>(null);
  const [categories, setCategories] = useState<MappedinCategory[]>([]);

  const venue = useVenue(options);
  const { elementRef, mapView } = useMapView(venue, {
    multiBufferRendering: true,
    xRayPath: true,
    loadOptions: {
      outdoorGeometryLayers: [
        "__TEXT__",
        "__AUTO__BORDER__",
        "Base",
        "Void",
        "Outdoor Obstruction",
        "Water Feature",
        "Parking Below",
        "Landscape Below",
        "Sidewalk Below",
        "Details Below",
        "Landscape",
        "Sidewalk",
        "Entrance Arrows",
        "Parking Lot Standard",
        "Parking Icon",
        "OD Tree Base",
        "OD Tree Top",
      ],
    },
    outdoorView: {
      enabled: true,
    },
    shadingAndOutlines: true,
  });

  const { selectedLocation, setSelectedLocation } = useSelectedLocation(mapView);

  const navigate = useNavigate();
  const location = useLocation();

  // Ref para rastrear la carga inicial
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (venue) {
      const sortedCategories = [...venue.categories].sort((a, b) =>
        a.name && b.name ? (a.name > b.name ? 1 : -1) : 0
      );
      setCategories(sortedCategories);
    }
  }, [venue]);

  // Función para determinar el bearing desde la instrucción
  const getBearingFromInstruction = useCallback((instruction: string): 'Left' | 'Right' | 'Straight' => {
    const instructionLower = instruction.toLowerCase();
    if (instructionLower.includes('izquierda') || instructionLower.includes('left')) {
      return 'Left';
    }
    if (instructionLower.includes('derecha') || instructionLower.includes('right')) {
      return 'Right';
    }
    return 'Straight';
  }, []);

  // Función centralizada para manejar la selección de una ubicación
  const handleLocationSelect = useCallback((location: MappedinLocation) => {
    // 1. Encontrar la ubicación de Microsoft
    const microsoftLocation = venue?.locations.find(loc => loc.name === "Microsoft");

    if (!microsoftLocation || microsoftLocation.polygons.length === 0) {
      console.error("Microsoft location not found or missing polygons.");
      return;
    }

    // 2. Establecer departure y destination
    const microsoftPolygon = microsoftLocation.polygons[0];
    setDeparture(microsoftPolygon);

    if (!location.polygons || location.polygons.length === 0) {
      console.error("Selected location does not have polygons.");
      // Aún así, establece selectedLocation y muestra el store sin generar ruta
      setSelectedLocation(location);
      handleMenuStateChange("ShowStore");
      navigate(`/?from=Microsoft&to=${encodeURIComponent(location.name)}`);
      return;
    }
    const destinationPolygon = location.polygons[0];
    setDestination(destinationPolygon);

    // 3. Actualizar el estado de la aplicación
    setSelectedLocation(location);

    // 4. Cambiar el estado del menú
    handleMenuStateChange("ShowStore");

    // 5. Actualizar la URL
    navigate(`/?from=Microsoft&to=${encodeURIComponent(location.name)}`);
  }, [venue, navigate, handleMenuStateChange]);

  // Manejar la generación de las rutas una vez que departure y destination están establecidos
  useEffect(() => {
    if (!mapView || !departure || !destination) {
      setSteps([]);
      setTotalWalkingTime(0);
      return;
    }

    const directions = departure.directionsTo(destination);

    mapView.Journey.draw(directions, {
      pathOptions: {
        color: "#fc0",
      },
    });

    mapView.Camera.focusOn(
      {
        nodes: directions.path,
        polygons: [departure, destination],
      },
      {
        minZoom: 2000,
        duration: 1000,
        easing: CAMERA_EASING_MODE.EASE_IN_OUT,
      }
    );

    let totalDistance = 0;
    const newSteps: Step[] = directions.instructions.map(
      (instruction: any,) => {  
       // index: number
        const distanceInMeters = Math.round(instruction.distance);
        totalDistance += distanceInMeters;

        const bearing = getBearingFromInstruction(instruction.instruction);

        return {
          action: {
            bearing: bearing,
          },
          description: `${instruction.instruction} - ${distanceInMeters} metros`,
        };
      }
    );

    setSteps(newSteps);
    setTotalWalkingTime(
      Number(calculateWalkingTime(totalDistance, walkingSpeed))
    );
  }, [mapView, departure, destination, getBearingFromInstruction, calculateWalkingTime, walkingSpeed]);

  // Manejar clics en el mapa
  useEffect(() => {
    if (!mapView || !venue) return;

    const handleMapClick = ({ polygons }: { polygons: MappedinPolygon[] }) => {
      if (polygons.length === 0) {
        setSelectedLocation(undefined);
        handleMenuStateChange("AllHidden");
        setDeparture(null);
        setDestination(null);
        mapView.Journey.clear();
        mapView.clearAllPolygonColors();
        console.warn("No hay ubicaciones para este polígono");
        return;
      }

      const clickedPolygon = polygons[0];
      const clickedLocation = clickedPolygon.locations?.[0];

      if (clickedLocation) {
        handleLocationSelect(clickedLocation);
      } else {
        handleMenuStateChange("AllHidden");
        setSelectedLocation(undefined);
      }
    };

    mapView.on(E_SDK_EVENT.CLICK, handleMapClick);
    mapView.addInteractivePolygonsForAllLocations();
    mapView.FloatingLabels.labelAllLocations();

    return () => {
      mapView.off(E_SDK_EVENT.CLICK, handleMapClick);
    };
  }, [mapView, venue, handleLocationSelect, handleMenuStateChange]);

  // Manejar selección desde la URL
  useEffect(() => {
    if (isInitialLoad.current) {
      const params = new URLSearchParams(location.search);
      const storeName = params.get("to");

      if (storeName && venue) {
        const selectedStore = venue.locations.find(
          (location) => location.name === storeName
        );

        if (selectedStore) {
          handleLocationSelect(selectedStore);
        }
      }
      isInitialLoad.current = false; // Marcar como manejado
    }
  }, [location, venue, handleLocationSelect]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromLocation = params.get("from");
    const toLocation = params.get("to");
  
    if (fromLocation && toLocation && venue) {
      const departureLocation = venue.locations.find(
        (location) => location.name === fromLocation
      );
      const destinationLocation = venue.locations.find(
        (location) => location.name === toLocation
      );
  
      if (departureLocation && destinationLocation) {
        handleLocationSelect(departureLocation);
        handleLocationSelect(destinationLocation);
      }
    }
  }, [location.search, venue, handleLocationSelect]);
  

  // Manejar cambio de mapa
  const handleMapChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = event.target.value;
      setSelectedMap(selectedOption);

      // Limpiar estados anteriores
      setDeparture(null);
      setDestination(null);
      setSteps([]);
      setTotalWalkingTime(0);
      setSelectedLocation(undefined);
      handleMenuStateChange("AllHidden"); // Opcional: Cierra cualquier menú abierto

      if (!mapView) return;

      const selectedMapObj = venue?.maps.find(
        (map) => map.name === selectedOption
      );
      if (selectedMapObj) {
        try {
          await mapView.setMap(selectedMapObj);
        } catch (error) {
          console.error("Error al cambiar el mapa:", error);
        }
      } else {
        console.warn(`No se encontró un mapa con el nombre ${selectedOption}`);
      }
    },
    [mapView, venue, handleMenuStateChange]
  );



  if (!venue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-principal">
      <div
        style={{ height: "100%", width: "100%", position: "absolute" }}
        ref={elementRef}
      ></div>
      <SearchBar
        setSelectedLocation={handleLocationSelect} // Pasar handleLocationSelect directamente
        menuState={menuState}
        onMenuStateChange={handleMenuStateChange}
        handleCategoryClick={() => {
          setShowCategoryList(!showCategoryList);
          setSelectedCategory(null);
        }}
      />
      <ShowStore
        selectedLocation={selectedLocation}
        onGoBack={() => {
          handleMenuStateChange("ShowCategories");
        }}
        menuState={menuState}
        onMenuStateChange={handleMenuStateChange}
        steps={steps}
        totalWalkingTime={totalWalkingTime}
        mapView={mapView}
        url={location.search}
      />
      <CategoryList
        menuState={menuState}
        onMenuStateChange={handleMenuStateChange}
        categories={categories}
        onCategorySelect={(category) => setSelectedCategory(category)}
        onLocationSelect={handleLocationSelect} // Pasar la función completa
        selectedCategory={selectedCategory}
        onBackClick={() => {
          setSelectedCategory(null);
        }}
      />
      <ShowMenuBar
        menuState={menuState}
        onMenuStateChange={handleMenuStateChange}
      />
      <Languages />
      <MapSelector
        selectedMap={selectedMap}
        handleMapChange={handleMapChange} // Corregido a handleMapChange
      />
    </div>
  );
}

export default App;