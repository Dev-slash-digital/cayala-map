import "./LogoOverlay.css";

const LogoOverlay = () => {
  return (
    <div
    className="logo-overlay"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '80px',
        height: '80px',
        zIndex: 0,
        pointerEvents: 'none',
        padding: '10px',
      }}
    >
      <img
        src="https://aqua-hippopotamus-349530.hostingersite.com/guatemala/uploads/logo-cayala.png"
        alt="Logo"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LogoOverlay;
