import "./ShowMenuBar.css";

type MenuState = "ShowCategories" | "ShowMenu" | "ShowStore" | "AllHidden";

interface ShowMenuBarProps {
  menuState: MenuState;
  onMenuStateChange: (newState: MenuState) => void;
}

function ShowMenuBar({ menuState, onMenuStateChange }: ShowMenuBarProps) {
  const handleClick = () => {
    const newState = menuState === "AllHidden" ? "ShowMenu" : "AllHidden";
    onMenuStateChange(newState);
  };

  return (
    <div>
      <button className="menu-btn" onClick={handleClick}>
        {menuState === "ShowMenu" ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <i className="fa-solid fa-magnifying-glass"></i>
        )}
      </button>
    </div>
  );
}

export default ShowMenuBar;
