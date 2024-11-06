import "./SearchBar.css";
import translations from "../../utils/translations.tsx";
import { useEffect, useState, useRef } from 'react';
import {
  getVenue,
  OfflineSearch,
  MappedinLocation,
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { options } from "../../constants";

type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";
type TranslationType = typeof translations[keyof typeof translations];

interface SearchBarProps {
  translations: TranslationType;
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
  setSelectedLocation: (location: MappedinLocation) => void;
  handleCategoryClick: () => void;
}

function SearchBar({
  translations,
  menuState,
  onMenuStateChange,
  setSelectedLocation,
  handleCategoryClick,
}: SearchBarProps) {

  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<MappedinLocation[]>([]);
  const venueRef = useRef<any>(null);


  useEffect(() => {
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
      searchBar.classList.toggle('show', menuState === "ShowMenu");
      searchBar.classList.toggle('hide', menuState !== "ShowMenu");
    }
  }, [menuState]);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        venueRef.current = await getVenue(options);
      } catch (error) {
        console.error("Error al obtener la venue:", error);
      }
    };
    fetchVenue();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (venueRef.current && inputValue.trim() !== '') {
        try {
          const offlineSearch = new OfflineSearch(venueRef.current);
          const results = await offlineSearch.search(inputValue);
          const locations = results
            .filter((result) => result.type === 'MappedinLocation' && (result.object as MappedinLocation).type === 'tenant')
            .map((result) => result.object as MappedinLocation);
          setSearchResults(locations);
        } catch (error) {
          console.error("Error al realizar la búsqueda:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };
    search();
  }, [inputValue]);

  const handleKeyboardClick = (letter: string) => {
    setInputValue((prevValue) => prevValue + letter);
  };

  const handleDelete = () => {
    setInputValue((prevValue) => prevValue.slice(0, -1));
  };

  return (

    <div id="searchBar" className="hide">
      <div className="search-container">
        <button className="search-icon">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        <input
          type="text"
          id="locationsearch"
          placeholder={translations.searchPlaceholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <button className="items-menu" onClick={() => { onMenuStateChange("ShowCategories"); handleCategoryClick(); }}>
          <i className="fa-solid fa-list"></i>
        </button>
      </div>
      {searchResults.length > 0 && (
        <div id="container-tiendas-busqueda" className="container-tiendas-busqueda">
          <ul>
            {searchResults.map((location) => (
              <li key={location.id} className="item-tienda"
                onClick={() => {
                  setSelectedLocation(location);
                  console.log(location);
                }}
              >
                <div className="containerImagen">
                  <img
                    src={location.logo?.["66x66"] || 'URL_DE_IMAGEN_POR_DEFECTO'}
                    alt={`${location.name} logo`}
                  />
                </div>
                <p className="nombre-tienda">{location.name}</p>
              </li>
            ))}
          </ul>
          <i className="fa-solid fa-sort-down"></i>
        </div>
      )}

      <div className="keyboard">
        <div className="keyboard-row">
          {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((letter) => (
            <button key={letter} onClick={() => handleKeyboardClick(letter)}>
              {letter}
            </button>
          ))}
        </div>
        <div className="keyboard-row">
          {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'].map((letter) => (
            <button key={letter} onClick={() => handleKeyboardClick(letter)}>
              {letter}
            </button>
          ))}
        </div>
        <div className="keyboard-row">
          {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((letter) => (
            <button key={letter} onClick={() => handleKeyboardClick(letter)}>
              {letter}
            </button>
          ))}
          <button className="espacio" onClick={() => handleKeyboardClick(' ')}>{translations.searchSpace}</button>
          <button className="borrar" onClick={handleDelete}>{translations.searchDelete}</button>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;