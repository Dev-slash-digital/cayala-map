const translations = {
  es: {
    categoriesTitle: "Categorías",
    searchPlaceholder: "Buscar tiendas",
    searchSpace: "espacio",
    searchDelete: "borrar",
    storeHours: "Horario",
    storeStep: "Paso a paso",
    storeStimate: "Tiempo aprox ",
    storeCodeTitle: "Escanear QR",
    storeCodeDescrip:"Escanea el codigo QR en tu celular.",
    storeClosed: "Cierra",
    storeBtnDirections: "Dirección",
    storeViewMore: "Ver más",
    storeViewLess: "Ver menos",
    levelUp: "Nivel superior",
    levelDown: "Nivel inferior",
  },
  en: {
    categoriesTitle: "Categories",
    searchPlaceholder: "Search store",
    searchSpace: "space",
    searchDelete: "delete",
    storeHours: "Schedule",
    storeStep: "Step by step",
    storeStimate: "Estimated time ",
    storeCodeTitle: "Scan QR",
    storeCodeDescrip:"Scan the QR code on your cell phone.",
    storeClosed: "Closed",
    storeBtnDirections: "Indications",
    storeViewMore: "See more",
    storeViewLess: "See Less",
    levelUp: "Upper Level",
    levelDown: "Lower Level",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = keyof typeof translations.es;

export default translations;
