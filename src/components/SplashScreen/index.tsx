import { useEffect, useState } from "react";
import "./SplashScreen.css"

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(false); 

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

  const hideSplashScreen = () => {
    setVisible(false);
    onFinish();
  };

  return visible ? (
    <div className="splash-screen" onClick={hideSplashScreen}>
      <img src="/path/to/your/ad-image.jpg" alt="Publicidad" />
    </div>
  ) : null;
};

export default SplashScreen;
