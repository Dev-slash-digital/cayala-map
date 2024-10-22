import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./ShowStore.css";
import {
  MappedinLocation,
  MapView,
  CAMERA_EASING_MODE,
  MappedinNode,
  MappedinDirections,
  ACTION_TYPE,
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import QRCode from "qrcode";

// Tipos
type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";
type StepAction = { bearing: 'Left' | 'Right' | 'Straight' | string };
type Step = { action: StepAction; description: string };

interface ShowStoreProps {
  selectedLocation: MappedinLocation | undefined;
  onGoBack: () => void;
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
  steps: Step[];
  totalWalkingTime: number;
  mapView: MapView | undefined;
  url: string;
  directions: MappedinDirections | undefined;
}

interface DescripcionStoreProps {
  description: string;
}

export const ShowStore: React.FC<ShowStoreProps> = ({
  selectedLocation,
  onGoBack,
  menuState,
  onMenuStateChange,
  steps,
  totalWalkingTime,
  mapView,
  url,
  directions,
}) => {
  const [showDirections, setShowDirections] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const showStoreRef = useRef<HTMLDivElement>(null);

  const decodeText = useCallback((text: string | undefined): string => {
    if (!text) return '';
    try {
      return decodeURIComponent(text);
    } catch (e) {
      try {
        return decodeURIComponent(escape(text));
      } catch (e2) {
        console.warn("No se pudo decodificar el texto:", text);
        return text;
      }
    }
  }, []);

  // mostrar y ocultar la popup de la tienda  
  useEffect(() => {
    const showStore = document.getElementById("show-store");
    if (showStore) {
      showStore.classList.toggle("show", menuState === "ShowStore");
      showStore.classList.toggle("hide", menuState !== "ShowStore");
    }
  }, [menuState]);

  //Ajustar la camara para la ruta de la tienda
  useEffect(() => {
    if (mapView && selectedLocation && menuState === "ShowStore") {
      mapView.Camera.focusOn(
        { polygons: selectedLocation.polygons },
        { minZoom: 2000, duration: 1000, easing: CAMERA_EASING_MODE.EASE_IN_OUT }
      );
    }
  }, [mapView, selectedLocation, menuState]);

  //Generar el codigo QR
  useEffect(() => {
    if (url) {
      const fullUrl = `${window.location.origin}${url}`;
      QRCode.toDataURL(fullUrl, { type: "image/jpeg", margin: 1 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [url]);

  //dibujar la ruta desde el punto inicial al punto final
  useEffect(() => {
    if (mapView && directions) {
      mapView.Journey.draw(directions, {
        pathOptions: {
          color: "#1216ff",
          displayArrowsOnPath: true,
          interactive: true,
          pulseColor: "white",
          showPulse: true,
          farZoom: 10000,
          farRadius: 2.3,
        },
        inactivePathOptions: { color: "#1216ff" },
      });

      mapView.Camera.focusOn(
        { nodes: directions.path },
        { minZoom: 2000, duration: 1000, easing: CAMERA_EASING_MODE.EASE_IN_OUT }
      ).catch(console.error);
    }
  }, [mapView, directions]);

  //mover el popup de la tienda en la pantalla
  useEffect(() => {
    const showStore = showStoreRef.current;
    if (!showStore) return;

    const isMobile = window.innerWidth < 600;

    if (isMobile) {
      showStore.style.top = '10%';
      showStore.style.transform = 'translateX(-50%)';
    }

    const isLargeScreen = !isMobile;
    if (!isLargeScreen) return;

    let isDragging = false;
    let offsetX: number, offsetY: number;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      offsetX = showStore.offsetLeft - clientX;
      offsetY = showStore.offsetTop - clientY;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      showStore.style.left = `${clientX + offsetX}px`;
      showStore.style.top = `${clientY + offsetY}px`;
    };

    const handleEnd = () => { isDragging = false; };

    showStore.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    return () => {
      showStore.removeEventListener("mousedown", handleStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, []);


  const focusOnNode = useCallback(async (node: MappedinNode, index: number) => {
    if (!mapView || !directions || !directions.instructions) {
      console.error("mapView, directions o directions.instructions no están definidos.");
      return;
    }
  
    const nextInstruction = directions.instructions[index + 1];
  
    // Función para calcular la rotación
    const calculateRotation = (currentNode: MappedinNode, nextNode?: MappedinNode) => {
      if (!nextNode) return 0;
      const dx = nextNode.x - currentNode.x;
      const dy = nextNode.y - currentNode.y;
      return Math.atan2(dy, dx);
    };
  
    // Función para cambiar el mapa
    const changeMap = async (newMapName: string) => {
      const newMap = mapView.venue.maps.find((map: any) => map.name === newMapName);
      if (newMap) {
        await mapView.setMap(newMap);
        console.log(`Cambiado al mapa: ${newMapName}`);
      } else {
        console.error(`Mapa no encontrado: ${newMapName}`);
      }
    };
  
    // Verificar si necesitamos cambiar de piso
    const currentMapName = mapView.currentMap.name;
    const nodeMapName = node.map.name;
    if (currentMapName !== nodeMapName) {
      await changeMap(nodeMapName);
      // Esperar un momento después de cambiar el mapa
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  
    // Calcular la rotación
    const rotation = calculateRotation(node, nextInstruction?.node);
  
    // Enfocar en el nodo con rotación
    await mapView.Camera.focusOn(
      { nodes: [node] },
      { 
        rotation: rotation,
        tilt: 0, 
        duration: 1500, 
        easing: CAMERA_EASING_MODE.EASE_IN_OUT 
      },

    );
  
    mapView.Journey.setStep(index);
  }, [mapView, directions]);

  const handleStepClick = useCallback((stepIndex: number) => {
    setSelectedStepIndex(stepIndex);

    if (!mapView || !directions || !directions.instructions) {
      console.error("mapView, directions o directions.instructions no están disponibles.");
      return;
    }

    const instruction = directions.instructions[stepIndex];
    if (!instruction || !instruction.node) {
      console.error("Instrucción o nodo del paso no encontrado.");
      return;
    }

    const node = instruction.node;
    focusOnNode(node, stepIndex);

  }, [mapView, directions, focusOnNode]);


  //hora de operacion de los locales
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const renderOperationHours = useMemo(() => {
    if (!selectedLocation?.operationHours || selectedLocation.operationHours.length === 0) {
      return <span>No hay horarios disponibles</span>;
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().getDay();
    const currentDay = daysOfWeek[today === 0 ? 6 : today - 1];

    const currentHours = selectedLocation.operationHours.find(hour => hour.dayOfWeek.includes(currentDay));
    const isOpen = currentHours && new Date().toLocaleTimeString() >= currentHours.opens && new Date().toLocaleTimeString() < currentHours.closes;

    return (
      <div className="operation-hours-container">
        <div className="container-button-hours">
          <h4 className="operation-hours-title">Horario </h4>
          <span className={`status ${isOpen ? 'open' : 'closed'}`}>{isOpen ? 'Open' : 'Closed'}</span>
          <div className="operation-hours-button" onClick={() => setIsHoursExpanded(!isHoursExpanded)}>
            <div className="location-open-status">
              {isOpen && currentHours && <p className="update-text">Cierra {formatTime(currentHours.closes)}</p>}
            </div>
            <i className={`chevron fa-solid fa-chevron-${isHoursExpanded ? 'up' : 'down'}`}></i>
          </div>
        </div>
        <div className={`operation-hours-list ${isHoursExpanded ? 'expanded' : 'collapsed'}`}>
          {daysOfWeek.map((day, index) => {
            const dayHours = selectedLocation.operationHours?.find(hour => hour.dayOfWeek.includes(day));
            const isDayOpen = dayHours && new Date().toLocaleTimeString() >= dayHours.opens && new Date().toLocaleTimeString() < dayHours.closes;
            return (
              <div key={index} className="operation-hours-item">
                <div className="operation-hours-day-time">
                  <span className="operation-hours-day">{day}</span>
                  {dayHours ? (
                    <span className={`operation-hours-time ${isDayOpen ? 'open' : 'closed'}`}>
                      <span className="operation-hours-open">{formatTime(dayHours.opens)}</span>
                      <span className="operation-hours-separator">-</span>
                      <span className="operation-hours-close">{formatTime(dayHours.closes)}</span>
                    </span>
                  ) : (
                    <span className="operation-hours-closed">Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [selectedLocation?.operationHours, isHoursExpanded]);

  //descripcion de los locales
  function DescripcionStore({ description }: DescripcionStoreProps) {
    const [showMore, setShowMore] = useState(false);

    const toggleShowMore = () => {
      setShowMore(!showMore);
    };

    return (
      <div className="descripcion-store">
        <p className={showMore ? '' : 'texto-limitado'}>
          {description}
        </p>
        <button onClick={toggleShowMore}>
          {showMore ? 'Ver menos' : 'Ver más'}
        </button>
      </div>
    );
  }

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleHeight = () => {
    const container = document.querySelector(".container_step_by_step") as HTMLElement;
    if (!container) return;

    setIsExpanded(!isExpanded);
    container.classList.toggle('showSteps');
  };


  const renderBackButton = () => (
    <button className="btn-regresar" onClick={() => { onGoBack(); onMenuStateChange("ShowCategories"); }}>
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );

  const renderExitButton = () => (
    <button className="btn-salir" onClick={() => onMenuStateChange("AllHidden")}>
      <i className="fa-solid fa-xmark"></i>
    </button>
  );

  const renderShowStoreDetails = () => (
    <button className="btn-regresar" onClick={() => setShowDirections(!showDirections)}>
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );

  return (
    <div
      id="show-store"
      className={`show-store-container ${menuState === "ShowStore" ? "show" : "hide"}`}
      ref={showStoreRef}
      style={{ position: "absolute" }}>
      {!showDirections ? (
        <div className="containerStoreDetails">
          <div className="container-header-btns">
            {renderBackButton()}
            {renderExitButton()}
          </div>
          <div className="header-store">
            <div className="logo">
              {selectedLocation?.logo?.small && (
                <img src={selectedLocation.logo.small} alt={`${selectedLocation.name} logo`} />
              )}
            </div>
            <div className="title-16">
              <h2>{(selectedLocation?.name)}</h2>
            </div>
          </div>
          <div className="container-btn">
            <button className="btn-direccion" onClick={() => setShowDirections(true)}>Dirección</button>
            {selectedLocation?.phone && (
              <button className="btn-telefono">
                <i className="fa-solid fa-phone"></i>
                {decodeText(selectedLocation.phone.number)}
              </button>
            )}
          </div>
          {renderOperationHours}
          {selectedLocation?.categories && selectedLocation.categories.length > 0 && (
            <div className="container-categorias">
              <h4>Categorías</h4>
              <ul>
                {selectedLocation?.categories.map((category) => (
                  <li key={category.id}>{decodeText(category.name)}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="descripcion-store">
            {selectedLocation?.description && (
              <DescripcionStore description={decodeText(selectedLocation.description)} />
            )}
          </div>
        </div>
      ) : (
        <>
          {totalWalkingTime && (
            <div className="containerPasos">
              <div className="container-header-btns">
                {renderShowStoreDetails()}
                {renderExitButton()}
              </div>
              <div className="container_step_by_step">
                <div className="containerFlexSteps">
                  <div className="title-16">
                    <h3>Paso a paso</h3>
                  </div>
                  <div className="steps_time">
                    <p>Tiempo aprox <span>{totalWalkingTime} min.</span></p>
                  </div>
                  {/*html lista de nodos de la ruta o paso a paso*/}
                  <div className="container-step">
                    {steps.map((step, index) => {
                      if (!step || !step.action) return null;
                      const isSelected = index === selectedStepIndex;
                      return (
                        <section
                          className={`list_steps ${isSelected ? 'selected-step' : ''}`}
                          key={index}
                          onClick={() => handleStepClick(index)}>
                          <i className={`fa-solid fa-arrow-${step.action.bearing === 'Left' ? 'left' : step.action.bearing === 'Right' ? 'right' : 'up'}`}></i>
                          <div>{decodeText(step.description)}</div>
                        </section>
                      );
                    })}
                  </div>
                </div>
                <div className="containerQr">
                  <div className="title-16">
                    <h3>Escanear QR</h3>
                  </div>
                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                  <p>Escanea el codigo QR en tu celular.</p>
                </div>
              </div>
              <div>
                    <i
                      id="bajar"
                      className={`fa-solid fa-angle-${!isExpanded ? 'down' : 'up'}`}
                      onClick={toggleHeight}
                    ></i>
                  </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};