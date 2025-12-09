import { Link, useLocation } from "react-router-dom";

const navContainerStyle = {
  backgroundColor: "#166534", // green-800 for brand consistency
  padding: "12px 24px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
};

const navListStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  margin: 0,
  padding: 0,
  listStyle: "none",
};

const linkBaseStyle = {
  color: "#ecfdf3",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: 600,
  transition: "background-color 0.2s ease, color 0.2s ease",
};

const defaultNavItems = [
  { label: "Home", path: "/" },
  { label: "Pests", path: "/pests" },
  { label: "Soil", path: "/soil" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Plants", path: "/plants" },
  { label: "Garden", path: "/garden" },
  { label: "Journal", path: "/journal" },
  { label: "Weather", path: "/weather" },
  { label: "Community", path: "/community" },
];

export default function Navbar({ navItems }) {
  const { pathname } = useLocation();
  const links = navItems && navItems.length ? navItems : defaultNavItems;

  const getLinkStyle = (path) => ({
    ...linkBaseStyle,
    backgroundColor: pathname === path ? "#15803d" : "transparent", // green-700 active
    color: pathname === path ? "#ecfdf3" : "#dcfce7",
  });

  return (
    <nav style={navContainerStyle}>
      <ul style={navListStyle}>
        {links.map((item) => (
          <li key={item.path}>
            <Link to={item.path} style={getLinkStyle(item.path)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}