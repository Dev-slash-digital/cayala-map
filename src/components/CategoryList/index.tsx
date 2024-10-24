// src/components/CategoryList.tsx

import React, { useEffect } from "react";
import translations from "../../utils/translations.tsx";  
import "./CategoryList.css";
import { MappedinCategory, MappedinLocation } from "@mappedin/mappedin-js";

type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";
type TranslationType = typeof translations[keyof typeof translations];

interface CategoryListProps {
  translations: TranslationType;
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
  categories: MappedinCategory[];
  onCategorySelect: (category: MappedinCategory) => void;
  onLocationSelect: (location: MappedinLocation) => void;
  selectedCategory: MappedinCategory | null;
  onBackClick: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  translations,
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

  const renderBackButton = () => (
    <button
      className="btn-regresar"
      onClick={() => {
        onBackClick();
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

  const renderBackMenu = () => (
    <button
      className="btn-regresar"
      onClick={() => {
        onMenuStateChange("ShowMenu");
      }}
    >
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );

  if (selectedCategory) {
    return (
      <div id="categoryList" className="categoryList">
        <div className="container-header-btns">
          {renderBackButton()}
          {renderExitButton()}
        </div>
        <div className="containerHeaderCategory">
          <h2>{selectedCategory.name}</h2>
        </div>
        <div className="containerListCategory">
          <ul>
            {selectedCategory.locations.map((location) => (
              <li
                className="locationItem"
                key={location.id}
                onClick={() => { onLocationSelect(location); }}
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
      <div className="container-header-btns">
          {renderBackMenu()}
          {renderExitButton()}
        </div>
      <div className="containerHeaderCategory">
        <h2>{translations.categoriesTitle}</h2>
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