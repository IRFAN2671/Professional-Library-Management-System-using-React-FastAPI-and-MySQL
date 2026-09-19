import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
const navigate = useNavigate();
const location = useLocation();

const handleLogout = () => {
localStorage.removeItem("access_token");
localStorage.removeItem("user");
navigate("/");
};

const menuItems = [
{
path: "/dashboard",
icon: "🏠",
label: "Dashboard",
},
{
path: "/books",
icon: "📚",
label: "Books",
},
{
path: "/members",
icon: "👥",
label: "Members",
},
{
path: "/issues",
icon: "📖",
label: "Issue / Return",
},
{
path: "/fines",
icon: "💰",
label: "Fines",
},
{
path: "/reservations",
icon: "📋",
label: "Reservations",
},
];

return (
<aside
style={{
width: "250px",
minHeight: "100vh",
background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
color: "white",
padding: "24px 16px",
boxSizing: "border-box",
position: "fixed",
left: 0,
top: 0,
display: "flex",
flexDirection: "column",
boxShadow: "4px 0 15px rgba(0, 0, 0, 0.12)",
zIndex: 1000,
}}
>
<div
style={{
padding: "8px 12px 28px",
borderBottom: "1px solid rgba(255,255,255,0.1)",
marginBottom: "24px",
}}
>
<div
style={{
fontSize: "30px",
marginBottom: "8px",
}}
>
📚 </div>

    <h2
      style={{
        margin: 0,
        fontSize: "21px",
        fontWeight: "700",
        letterSpacing: "0.3px",
      }}
    >
      Library System
    </h2>

    <p
      style={{
        margin: "6px 0 0",
        color: "#9ca3af",
        fontSize: "13px",
      }}
    >
      Management Portal
    </p>
  </div>

  <nav
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}
  >
    {menuItems.map((item) => {
      const isActive = location.pathname === item.path;

      return (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "13px 14px",
            borderRadius: "8px",
            color: isActive ? "white" : "#d1d5db",
            backgroundColor: isActive
              ? "#374151"
              : "transparent",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: isActive ? "600" : "500",
            transition: "all 0.2s ease",
            borderLeft: isActive
              ? "3px solid #60a5fa"
              : "3px solid transparent",
          }}
        >
          <span
            style={{
              width: "24px",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            {item.icon}
          </span>

          <span>{item.label}</span>
        </Link>
      );
    })}
  </nav>

  <div style={{ marginTop: "auto" }}>
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        marginBottom: "16px",
      }}
    />

    <button
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: "12px 14px",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        color: "#fca5a5",
        backgroundColor: "rgba(127, 29, 29, 0.25)",
        textAlign: "left",
      }}
    >
      🚪 &nbsp; Logout
    </button>
  </div>
</aside>


);
}

export default Sidebar;
