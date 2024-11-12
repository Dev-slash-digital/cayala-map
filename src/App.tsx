import "./App.css";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  CAMERA_EASING_MODE,
  E_SDK_EVENT,
  MappedinCategory,
  MappedinLocation,
  MappedinPolygon,
  GET_VENUE_EVENT,
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
import SplashScreen from "./components/SplashScreen";
import ZoomButtons from "./components/ZoomButtons";
import Carrusel from "./components/Carrusel";
import LogoOverlay from './components/LogoOverlay';
import { useNavigate, useLocation } from "react-router-dom";
import { Step } from "./types/types";
import translations from "./utils/translations";


function App() {
  type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

  const [menuState, setMenuState] = useState<MenuState>("AllHidden");
  const [departure, setDeparture] = useState<MappedinPolygon | null>(null);
  const [destination, setDestination] = useState<MappedinPolygon | null>(null);
  const [selectedMap, setSelectedMap] = useState("Planta Baja");
  const [steps, setSteps] = useState<Step[]>([]);
  const [totalWalkingTime, setTotalWalkingTime] = useState(0);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MappedinCategory | null>(null);
  const [categories, setCategories] = useState<MappedinCategory[]>([]);
  const [showApp, setShowApp] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof translations>("es");

  const venue = useVenue(options);
  const { elementRef, mapView } = useMapView(venue, {
    multiBufferRendering: true,
    xRayPath: true,
    loadOptions: {
      outdoorGeometryLayers: [
        "__TEXT__", "__AUTO__BORDER__", "Base", "Void", "Outdoor Obstruction",
        "Water Feature", "Parking Below", "Landscape Below", "Sidewalk Below",
        "Details Below", "Landscape", "Sidewalk", "Entrance Arrows",
        "Parking Lot Standard", "Parking Icon", "OD Tree Base", "OD Tree Top",
      ],
    },
    outdoorView: { enabled: true },
    shadingAndOutlines: true,
  });

  const handleSplashFinish = () => {
    setShowApp(true);
  };

  const { selectedLocation, setSelectedLocation } = useSelectedLocation(mapView);

  const navigate = useNavigate();
  const location = useLocation();

  const isInitialLoad = useRef(true);

  const handleMenuStateChange = useCallback((newState: MenuState) => {
    setMenuState(newState);
  }, []);

  const getBearingFromInstruction = useCallback((instruction: string): 'Left' | 'Right' | 'Straight' => {
    const instructionLower = instruction.toLowerCase();
    if (instructionLower.includes('izquierda') || instructionLower.includes('left')) return 'Left';
    if (instructionLower.includes('derecha') || instructionLower.includes('right')) return 'Right';
    return 'Straight';
  }, []);

  const handleLocationSelect = useCallback((location: MappedinLocation) => {
    const microsoftLocation = venue?.locations.find(loc => loc.name === "Microsoft");

    if (!microsoftLocation || microsoftLocation.polygons.length === 0) {
      console.error("Ubicación de Microsoft no encontrada o faltan polígonos.");
      return;
    }

    setDeparture(microsoftLocation.polygons[0]);

    if (!location.polygons || location.polygons.length === 0) {
      console.error("La ubicación seleccionada no tiene polígonos.");
      setSelectedLocation(location);
      handleMenuStateChange("ShowStore");
      navigate(`/?from=Microsoft&to=${encodeURIComponent(location.name)}`);
      return;
    }

    setDestination(location.polygons[0]);
    setSelectedLocation(location);
    handleMenuStateChange("ShowStore");
    navigate(`/?from=Microsoft&to=${encodeURIComponent(location.name)}`);
  }, [venue, navigate, handleMenuStateChange, setSelectedLocation]);

  useEffect(() => {
    if (venue) {
      const sortedCategories = [...venue.categories].sort((a, b) =>
        a.name && b.name ? (a.name > b.name ? 1 : -1) : 0
      );
      setCategories(sortedCategories);
    }
  }, [venue]);

  useEffect(() => {
    if (!mapView || !departure || !destination) {
      setSteps([]);
      setTotalWalkingTime(0);
      return;
    }

    const directions = departure.directionsTo(destination);

    mapView.Journey.draw(directions, {
      pathOptions: { color: "blue" },
    });

    mapView.Camera.focusOn(
      {
        nodes: directions.path,
        polygons: [departure, destination],
      },
      {
        minZoom: 3000,
        duration: 1000,
        easing: CAMERA_EASING_MODE.EASE_IN_OUT,
      }
    );

    let totalDistance = 0;
    const newSteps: Step[] = directions.instructions.map((instruction: any) => {
      const distanceInMeters = Math.round(instruction.distance);
      totalDistance += distanceInMeters;

      return {
        action: {
          bearing: getBearingFromInstruction(instruction.instruction),
        },
        description: `${instruction.instruction} - ${distanceInMeters} metros`,
      };
    });

    setSteps(newSteps);
    setTotalWalkingTime(Number(calculateWalkingTime(totalDistance, walkingSpeed)));
  }, [mapView, departure, destination, getBearingFromInstruction]);

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
        return;
      }

      const clickedLocation = polygons[0].locations?.[0];

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

    venue.on(GET_VENUE_EVENT.LANGUAGE_CHANGED, () => {
      mapView.FloatingLabels.removeAll();
      mapView.FloatingLabels.labelAllLocations();
    });

    return () => {
      mapView.off(E_SDK_EVENT.CLICK, handleMapClick);
    };
  }, [mapView, venue, handleLocationSelect, handleMenuStateChange, setSelectedLocation]);

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
      isInitialLoad.current = false;
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

  const handleMapChange = useCallback(async (selectedOption: string) => {
    setSelectedMap(selectedOption);
    setDeparture(null);
    setDestination(null);
    setSteps([]);
    setTotalWalkingTime(0);
    setSelectedLocation(undefined);
    handleMenuStateChange("AllHidden");

    if (!mapView) return;

    const selectedMapObj = venue?.maps.find((map) => map.name === selectedOption);
    if (selectedMapObj) {
      try {
        await mapView.setMap(selectedMapObj);
      } catch (error) {
        console.error("Error al cambiar el mapa:", error);
      }
    } else {
      console.warn(`No se encontró un mapa con el nombre ${selectedOption}`);
    }
  }, [mapView, venue, handleMenuStateChange]);

  const handleLanguageChange = useCallback((lang: keyof typeof translations) => {
    if (venue) {
      venue.changeLanguage(lang);
      setCurrentLanguage(lang);
    }
  }, [venue]);

  const handleCategorySelect = (category: MappedinCategory) => {
    setSelectedCategory(category);
    setMenuState("ShowCategories");
  };

  const memoizedShowStore = useMemo(() => (
    <ShowStore
      onCategorySelect={handleCategorySelect}
      translations={translations[currentLanguage]}
      selectedLocation={selectedLocation}
      onGoBack={() => handleMenuStateChange("ShowCategories")}
      menuState={menuState}
      onMenuStateChange={handleMenuStateChange}
      steps={steps}
      totalWalkingTime={totalWalkingTime}
      mapView={mapView}
      url={location.search}
      directions={departure && destination ? departure.directionsTo(destination) : undefined}
    />
  ), [currentLanguage, selectedLocation, menuState, handleMenuStateChange, steps, totalWalkingTime, mapView, location.search, departure, destination]);

  if (!venue) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SplashScreen onFinish={handleSplashFinish} />
      {showApp && (
        <div className="container-principal">
          <div
            style={{ height: "100%", width: "100%", position: "absolute" }}
            ref={elementRef}
          />
          <SearchBar
            translations={translations[currentLanguage]}
            setSelectedLocation={handleLocationSelect}
            menuState={menuState}
            onMenuStateChange={handleMenuStateChange}
            handleCategoryClick={() => {
              setShowCategoryList(!showCategoryList);
              setSelectedCategory(null);
            }}
          />
          {memoizedShowStore}
          <CategoryList
            translations={translations[currentLanguage]}
            menuState={menuState}
            onMenuStateChange={handleMenuStateChange}
            categories={categories}
            onCategorySelect={setSelectedCategory}
            onLocationSelect={handleLocationSelect}
            selectedCategory={selectedCategory}
            onBackClick={() => setSelectedCategory(null)}
          />
          <ShowMenuBar
            menuState={menuState}
            onMenuStateChange={handleMenuStateChange}
          />
          <Languages
            onLanguageChange={handleLanguageChange}
            currentLanguage={currentLanguage}
          />
          <MapSelector
            selectedMap={selectedMap}
            handleMapChange={handleMapChange}
            mapView={mapView}
          />
          {mapView && <ZoomButtons mapView={mapView} />}
          <Carrusel 
          onFinish={handleSplashFinish} 
          />
          <LogoOverlay />
        </div>
      )}
    </>
  );
}

export default App;