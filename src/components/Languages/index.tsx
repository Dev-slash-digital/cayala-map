import "./Languages.css";

//type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

interface LanguajesProps {
  
}
function Languajes({  }: LanguajesProps) {
  
  return (
    <div>
      <button className="menu-btn-languages">
          <i className="fa-solid fa-earth-americas"></i>
      </button>
    </div>
  );
}

export default Languajes;
