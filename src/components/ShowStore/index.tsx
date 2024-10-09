import { useState, useEffect, useRef } from "react";
import "./ShowStore.css";
import {
  MappedinLocation,
  MapView,
  CAMERA_EASING_MODE,
  MappedinNode,
  MappedinDirections,
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import QRCode from "qrcode";

type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

interface StepAction {
  bearing: 'Left' | 'Right' | 'Straight' | string;
}

interface Step {
  action: StepAction;
  description: string;
}

interface ShowStoreProps {
  onGoBack: () => void;
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
  selectedLocation: MappedinLocation | undefined;
  steps: Step[];
  totalWalkingTime: number;
  mapView: MapView | undefined;
  url: string;
  directions: MappedinDirections | undefined;
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

  useEffect(() => {
    const showStore = document.getElementById("show-store");
    if (showStore) {
      showStore.classList.add(menuState === "ShowStore" ? "show" : "hide");
      showStore.classList.remove(menuState === "ShowStore" ? "hide" : "show");
    }
  }, [menuState]);

  useEffect(() => {
    if (mapView && selectedLocation && menuState === "ShowStore") {
      mapView.Camera.focusOn(
        {
          polygons: selectedLocation.polygons,
        },
        {
          minZoom: 2000,
          duration: 1000,
          easing: CAMERA_EASING_MODE.EASE_IN_OUT,
        }
      );
    }
  }, [mapView, selectedLocation, menuState]);

  useEffect(() => {
    if (url) {
      const fullUrl = `${window.location.origin}${url}`;
      QRCode.toDataURL(fullUrl, { type: "image/jpeg", margin: 1 })
        .then((dataUrl: string) => {
          setQrCodeUrl(dataUrl);
        })
        .catch((err) => console.error(err));
    }
  }, [url]);

  // Dibujar la ruta una sola vez cuando las direcciones estén disponibles
  useEffect(() => {
    if (mapView && directions) {
      mapView.Journey.draw(directions, {
        pathOptions: {
          color: "green",
          displayArrowsOnPath: true,
        },
      });


      mapView.Camera.focusOn(
        {
          nodes: directions.path,
        },
        {
          minZoom: 4000,
          duration: 1000,
          easing: CAMERA_EASING_MODE.EASE_IN_OUT,
        }
      )
        .then(() => {
          console.log("Cámara ajustada para mostrar toda la ruta");
        })
        .catch((error) => {
          console.error("Error al ajustar la cámara para toda la ruta:", error);
        });
    }
  }, [mapView, directions]);

  const showStoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    const showStore = showStoreRef.current;

    if (showStore) {

      let isDragging = false;
      let offsetX: number, offsetY: number;

      const handleStart = (e: MouseEvent | TouchEvent) => {
        isDragging = true;
        const clientX = e instanceof MouseEvent ? e.clientX : e
.touches[0].clientX;
        const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
        offsetX = showStore.offsetLeft - clientX;
        offsetY = showStore.offsetTop - clientY;
      };
      const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
        showStore.style.left = (clientX + offsetX) + "px";
        showStore.style.top = (clientY + offsetY) + "px";
      };
      const handleEnd = () => {
        isDragging = false;
      };
      showStore.addEventListener("mousedown", handleStart);
      showStore.addEventListener("touchstart", handleStart);
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      
document.addEventListener("touchend", handleEnd);
      return () => {
        showStore.removeEventListener("mousedown", handleStart);
        showStore.removeEventListener("touchstart", handleStart);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, []);

  // Función para centrar la cámara en un nodo específico
  const focusOnNode = (node: MappedinNode) => {
    if (!mapView) {
      console.error("mapView no está definido.");
      return;
    }

    console.log("Centrando la cámara en el nodo:", node.id, node.x, node.y);

    mapView.Camera.focusOn(
      {
        nodes: [node],
      },
      {
        minZoom: 500,
        duration: 1500,
        easing: CAMERA_EASING_MODE.EASE_IN_OUT,
      }
    )
      .then(() => {
        console.log("Cámara animada a la posición del paso");
      })
      .catch((error) => {
        console.error("Error durante la animación de la cámara:", error);
      });
  };

  // Función para manejar el clic en los pasos
  const handleStepClick = (stepIndex: number) => {
    if (!mapView || !directions || !directions.path || directions.path.length === 0) {
      console.error("mapView, directions o directions.path no están disponibles.");
      return;
    }

    // Obtener la instrucción correspondiente al paso
    const instruction = directions.instructions[stepIndex];
    if (!instruction || !instruction.node) {
      console.error("Instrucción o nodo del paso no encontrado.");
      return;
    }

    const nodeId = typeof instruction.node === 'string' ? instruction.node : instruction.node.id;

    const targetNode = directions.path.find(node => node.id === nodeId);
    if (!targetNode) {
      console.error("targetNode no encontrado en directions.path");
      return;
    }

    console.log("Clic en el paso:", stepIndex, targetNode);

    focusOnNode(targetNode);
  };

  const renderBackButton = () => (
    <button
      className="btn-regresar"
      onClick={() => {
        onGoBack();
        onMenuStateChange("ShowCategories");
      }}
    >
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );

  const renderExitButton = () => (
    <button
      className="btn-salir"
      onClick={() => {
        onMenuStateChange("AllHidden");
      }}
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  );

  const renderShowStoreDetails = () => (
    <button
      className="btn-regresar"
      onClick={() => {
        setShowDirections(!showDirections);
      }}
    >
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );

  return (
    <div
      id="show-store"
      className={`show-store-container ${menuState === "ShowStore" ? "show" : "hide"}`}
      ref={showStoreRef}
      style={{ position: "absolute" }}
    >

      {showDirections === false && (
        <div className="containerStoreDetails">
          <div className="container-header-btns">
            {renderBackButton()}
            {renderExitButton()}
          </div>
          <div className="header-store">
            <div className="logo">
              {selectedLocation?.logo && selectedLocation?.logo.small && (
                <img src={selectedLocation.logo.small} alt={`${selectedLocation.name} logo`} />
              )}
            </div>
            <div className="container-header">
              <h2>{selectedLocation?.name}</h2>
              <div className="container-btn">
                <button className="btn-direccion" onClick={() => setShowDirections(!showDirections)}>Dirección</button>
                {selectedLocation?.phone && (
                  <button className="btn-telefono">
                    <i className="fa-solid fa-phone"></i>
                    {selectedLocation.phone.number}
                  </button>
                )}
              </div>

              <div className="operationHours">
                {selectedLocation?.operationHours && selectedLocation.operationHours.length > 0 ? (
                  selectedLocation.operationHours.map((operationHour, index) => (
                    <span key={index}>
                      <span className="open">Open:</span> {operationHour.opens}, <span className="close">Closed:</span> {operationHour.closes}
                      <br />
                    </span>
                  ))
                ) : (
                  <span>No hay horarios disponibles</span>
                )}
              </div>
            </div>
          </div>

          {selectedLocation?.categories && selectedLocation.categories.length > 0 && (
            <div className="container-detalles">
              <h4>Categorías:</h4>
              <ul>
                {selectedLocation.categories.map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="descripcion-store">
            {selectedLocation?.description && <p>{selectedLocation.description}</p>}
          </div>
        </div>
      )}

      {showDirections === true && (
        <>
          {totalWalkingTime && (
            <div className="containerPasos">
              <div className="container-header-btns">
                {renderShowStoreDetails()}
                {renderExitButton()}
              </div>
              <div className="container_step_by_step">

                <div className="containerFlexSteps">
                  <div className="containerStepsHeader">
                    <h3>Paso a paso</h3>
                  </div>

                  {steps.map((step, index) => {
                    if (!step || !step.action) return null;

                    return (
                      <section className="list_steps" key={index} onClick={() => handleStepClick(index)}>
                        {step.action.bearing === 'Left' && (
                          <i className="fa-solid fa-arrow-left"></i>
                        )}
                        {step.action.bearing === 'Right' && (
                          <i className="fa-solid fa-arrow-right"></i>
                        )}
                        {step.action.bearing === 'Straight' && (
                          <i className="fa-solid fa-arrow-up"></i>
                        )}
                        <div>{step.description}</div>
                      </section>
                    );
                  })}

                  <div className="steps_time">
                    <p>Tiempo aprox <span>{totalWalkingTime} min</span></p>
                  </div>

                </div>
                <div className="containerQr">
                  <h3>Escanear QR</h3>
                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                  <p>Escanea el codigo QR en tu celular</p>
                </div>
              </div>
            </div>

          )}
        </>
      )}
    </div>
  );
};
