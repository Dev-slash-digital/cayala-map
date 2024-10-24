import "./Languages.css";
import { useState } from "react";

interface LanguagesProps {
  onLanguageChange: (lang: "es" | "en") => void;
  currentLanguage: "es" | "en";
}

function Languages({ onLanguageChange, currentLanguage }: LanguagesProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const languages: ("es" | "en")[] = ["es", "en"]; // Array tipado

  return (
    <div className="language-selector">
      <button 
        className="menu-btn-languages" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fa-solid fa-earth-americas"></i>
      </button>
      {showDropdown && (
        <ul className="language-dropdown">
          {languages.map((lang) => (
            <li 
              key={lang} 
              onClick={() => {
                onLanguageChange(lang); // Ahora 'lang' es compatible con "es" | "en"
                setShowDropdown(false);
              }}
              className={currentLanguage === lang ? "active" : ""}
            >
              {lang.toUpperCase()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export default Languages;