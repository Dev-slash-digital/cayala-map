import { useEffect, useState } from "react";
import "./Carrusel.css";

interface CarruselProps {
  onFinish: () => void;
}

interface Image {
  id: number;
  file_name: string;
  file_path: string;
  category: string;
}

const Carrusel: React.FC<CarruselProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch('https://aqua-hippopotamus-349530.hostingersite.com/guatemala/fetch_files.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const carruselImages = data.filter((img: Image) => img.category === "Carrusel");
        setImages(carruselImages);
      })
      .catch((error) => console.error("Error al cargar las imágenes:", error));
  }, []);

  useEffect(() => {
    if (images.length > 0 && visible) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [images, visible]);


  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      setVisible(false);
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setVisible(true);
      }, 6000);
    };

    inactivityTimer = setTimeout(() => {
      setVisible(true);
    }, 6000);

    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("touchstart", resetInactivityTimer);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("touchstart", resetInactivityTimer);
    };
  }, []);

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const hideCarrusel = () => {
    setVisible(false);
    onFinish();
  };

  return (
    <div className={`carrusel-container ${visible ? "visible" : "hidden"}`} onClick={hideCarrusel}>
      {images.length > 0 ? (
        <div className="carousel">
          <button className="prev-button" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
          <i className="fa-solid fa-chevron-left"></i>
          </button>

          <img
            src={images[currentImageIndex].file_path}
            alt={`Carrusel ${currentImageIndex + 1}`}
            className="carrusel-image"
          />

          <button className="next-button" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
          <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      ) : (
        <p>Cargando imágenes...</p>
      )}
    </div>
  );
};

export default Carrusel;
