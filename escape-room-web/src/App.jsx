// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RoomListPage from "./pages/RoomListPage"; // 暫時可空頁
import MyRecordsPage from "./pages/MyRecordsPage"; // 暫時可空頁

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/rooms" element={<RoomListPage />} />
        <Route path="/my" element={<MyRecordsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
