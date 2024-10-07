// src/components/CategoryList.tsx

import React, { useEffect } from "react";
import "./CategoryList.css";
import { MappedinCategory, MappedinLocation } from "@mappedin/mappedin-js";

type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

interface CategoryListProps {
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
  categories: MappedinCategory[];
  onCategorySelect: (category: MappedinCategory) => void;
  onLocationSelect: (location: MappedinLocation) => void;
  selectedCategory: MappedinCategory | null;
  onBackClick: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategorySelect,
  onLocationSelect,
  selectedCategory,
  onBackClick,
  menuState,
  onMenuStateChange,
}) => {


  useEffect(() => {
    const showCategoryList = document.getElementById("categoryList");
    if (showCategoryList) {
      showCategoryList.classList.add(menuState === "ShowCategories" ? "show" : "hide");
      showCategoryList.classList.remove(menuState === "ShowCategories" ? "hide" : "show");
    }
  }, [menuState]);

  if (selectedCategory) {
    return (
      <div id="categoryList" className="categoryList">
        <div className="containerHeaderCategory">
          <h2>{selectedCategory.name}</h2>
          <button onClick={onBackClick} className="backButton">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="containerListCategory">
          <ul>
            {selectedCategory.locations.map((location) => (
              <li
                className="locationItem"
                key={location.id}
                onClick={() => { onLocationSelect(location); }} // Eliminada llamada a onMenuStateChange
              >
                <div>
                  <div className="items_location">
                    <div className="items_location_image">
                      <img src={location.logo?.["66x66"] || 'URL_DE_IMAGEN_POR_DEFECTO'} alt={`${location.name} logo`} />
                    </div>
                    <p>{location.name}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <i className="fa-solid fa-sort-down"></i> 
      </div>
    );
  }

  return (
    <div id="categoryList" className="categoryList">
      <div className="containerHeaderCategory">
        <h2>Categorias</h2>
        <button
          className="backButton"
          onClick={() => {
            onMenuStateChange("ShowMenu");
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="containerListCategory">
        <ul>
          {categories.map((category) => (
            <li key={category.name} onClick={() => onCategorySelect(category)}>
              {category.name}
            </li>
          ))}
        </ul>
      </div>
      <i className="fa-solid fa-sort-down"></i>
    </div>
  );
};