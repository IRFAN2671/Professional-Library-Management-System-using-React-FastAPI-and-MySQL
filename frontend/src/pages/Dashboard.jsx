import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  const fetchDashboard = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/dashboard/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load dashboard");
        return;
      }

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const resetSystem = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the system?\n\nThis will delete all books, members, issues, reservations, and fines."
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setResetting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/dashboard/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "System reset failed");
        return;
      }

      alert("System has been reset successfully.");

      await fetchDashboard();
    } catch (error) {
      console.error("Reset error:", error);
      setError("Unable to reset system");
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !dashboard) {
    return (
      <div style={pageStyle}>
        <Sidebar />

        <main style={mainStyle}>
          <h1 style={titleStyle}>Library Dashboard</h1>
          <p style={subtitleStyle}>
            Loading dashboard...
          </p>
        </main>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div style={pageStyle}>
        <Sidebar />

        <main style={mainStyle}>
          <h1 style={titleStyle}>Library Dashboard</h1>

          <div style={errorStyle}>
            <h3>Unable to load dashboard</h3>

            <p>{error}</p>

            <button
              onClick={fetchDashboard}
              style={refreshButtonStyle}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={mainStyle}>

        <div style={headerStyle}>

          <div>
            <h1 style={titleStyle}>
              Library Dashboard
            </h1>

            <p style={subtitleStyle}>
              Overview of your library management system
            </p>
          </div>

          <div style={buttonContainerStyle}>

            <button
              onClick={fetchDashboard}
              disabled={loading || resetting}
              style={{
                ...refreshButtonStyle,
                opacity:
                  loading || resetting ? 0.7 : 1,
                cursor:
                  loading || resetting
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "↻ Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={resetSystem}
              disabled={resetting}
              style={{
                ...resetButtonStyle,
                opacity: resetting ? 0.7 : 1,
                cursor: resetting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {resetting
                ? "⟳ Resetting..."
                : "🔄 Reset System"}
            </button>

          </div>

        </div>

        {error && (
          <div style={errorStyle}>
            <p style={{ margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {dashboard && (
          <>
            <div style={cardsGridStyle}>

              <div style={cardStyle}>
                <div style={iconStyle}>📚</div>

                <div>
                  <p style={labelStyle}>
                    Total Books
                  </p>

                  <h2 style={numberStyle}>
                    {dashboard.total_books}
                  </h2>
                </div>
              </div>


              <div style={cardStyle}>
                <div style={iconStyle}>👥</div>

                <div>
                  <p style={labelStyle}>
                    Total Members
                  </p>

                  <h2 style={numberStyle}>
                    {dashboard.total_members}
                  </h2>
                </div>
              </div>


              <div style={cardStyle}>
                <div style={iconStyle}>📖</div>

                <div>
                  <p style={labelStyle}>
                    Currently Issued
                  </p>

                  <h2 style={numberStyle}>
                    {dashboard.issued_books}
                  </h2>
                </div>
              </div>


              <div style={cardStyle}>
                <div style={iconStyle}>↩️</div>

                <div>
                  <p style={labelStyle}>
                    Returned Books
                  </p>

                  <h2 style={numberStyle}>
                    {dashboard.returned_books}
                  </h2>
                </div>
              </div>


              <div style={cardStyle}>
                <div style={iconStyle}>⚠️</div>

                <div>
                  <p style={labelStyle}>
                    Unpaid Fines
                  </p>

                  <h2 style={numberStyle}>
                    {dashboard.unpaid_fines}
                  </h2>
                </div>
              </div>


              <div style={cardStyle}>
                <div style={iconStyle}>💰</div>

                <div>
                  <p style={labelStyle}>
                    Unpaid Fine Amount
                  </p>

                  <h2 style={numberStyle}>
                    Rs.{" "}
                    {Number(
                      dashboard.total_fine_amount
                    ).toFixed(2)}
                  </h2>
                </div>
              </div>

            </div>


            <div style={bottomSectionStyle}>

              <h2 style={sectionTitleStyle}>
                Library Overview
              </h2>

              <p style={overviewTextStyle}>
                Your dashboard provides a quick overview
                of books, members, issued books, returned
                books, and outstanding fines.
              </p>

            </div>
          </>
        )}

      </main>
    </div>
  );
}


const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f5f7fb",
};


const mainStyle = {
  marginLeft: "240px",
  padding: "35px",
};


const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};


const buttonContainerStyle = {
  display: "flex",
  gap: "12px",
};


const titleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#1f2937",
};


const subtitleStyle = {
  marginTop: "8px",
  color: "#6b7280",
  fontSize: "15px",
};


const refreshButtonStyle = {
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  padding: "11px 18px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
};


const resetButtonStyle = {
  border: "none",
  backgroundColor: "#dc2626",
  color: "white",
  padding: "11px 18px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
};


const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "20px",
};


const cardStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.07)",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  minHeight: "105px",
};


const iconStyle = {
  fontSize: "32px",
  width: "55px",
  height: "55px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
};


const labelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
};


const numberStyle = {
  margin: "7px 0 0 0",
  color: "#111827",
  fontSize: "28px",
};


const bottomSectionStyle = {
  backgroundColor: "white",
  marginTop: "30px",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
};


const sectionTitleStyle = {
  marginTop: 0,
  color: "#1f2937",
};


const overviewTextStyle = {
  color: "#6b7280",
  lineHeight: "1.7",
};


const errorStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
  maxWidth: "600px",
  marginBottom: "20px",
};


export default Dashboard;