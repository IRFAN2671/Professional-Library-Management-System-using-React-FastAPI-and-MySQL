import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Issues from "./pages/Issues";
import Fines from "./pages/Fines";
import Reservations from "./pages/Reservations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/books"
          element={<Books />}
        />

        <Route
          path="/members"
          element={<Members />}
        />

        <Route
          path="/issues"
          element={<Issues />}
        />

        <Route
          path="/fines"
          element={<Fines />}
        />

        <Route
          path="/reservations"
          element={<Reservations />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;