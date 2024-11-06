import { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onFinish: () => void;
}

interface Image {
  id: number;
  file_name: string;
  file_path: string;
  category: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(false); 
  const [images, setImages] = useState<Image[]>([]); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      setVisible(false);
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setVisible(true); 
      }, 600000); 
    };

    inactivityTimer = setTimeout(() => {
      setVisible(true);
    }, 600000); 

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

  useEffect(() => {
    fetch('https://aqua-hippopotamus-349530.hostingersite.com/guatemala/fetch_files.php') 
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const splashImages = data.filter((img: Image) => img.category === "Splash");
        console.log('Imágenes de Splash:', splashImages); 
        setImages(splashImages);
      })
      .catch((error) => console.error("Error al cargar las imágenes:", error));
  }, []);

  useEffect(() => {
    if (images.length > 0 && visible) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 300000); 

      return () => clearInterval(interval); 
    }
  }, [images, visible]);

  const hideSplashScreen = () => {
    setVisible(false);
    onFinish();
  };

  return visible ? (
    <div className="splash-screen" onClick={hideSplashScreen}>
      {images.length > 0 ? (
        <div className="carousel">
          <img
            src={images[currentImageIndex].file_path}
            alt={`Splash ${currentImageIndex + 1}`}
            className="carousel-image"
          />
        </div>
      ) : (
        <p>Cargando imágenes...</p>
      )}
    </div>
  ) : null;
};

export default SplashScreen;
