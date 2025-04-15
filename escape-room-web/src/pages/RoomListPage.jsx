// src/pages/RoomListPage.jsx
import { useEffect, useState } from "react";
import { roomData } from "../data/roomData";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const RoomListPage = () => {
  const [clickedRooms, setClickedRooms] = useState([]);
  const [user, setUser] = useState(null); // 存登入狀態
  const [loading, setLoading] = useState(true); // 防止閃跳

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("登入狀態變化：", currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsPlayed = async (room) => {
    if (!user) {
      alert("請先登入");
      return;
    }

    try {
      const roomRef = doc(db, "users", user.uid, "playedRooms", room.id);
      const now = new Date();
      console.log("記錄時間：", now);

      await setDoc(roomRef, {
        ...room,
        playedAt: now
      });

      setClickedRooms((prev) => [...prev, room.id]);
    } catch (err) {
      console.error("儲存紀錄失敗：", err);
    }
  };

  if (loading) {
    return <div className="p-4">載入中...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">密室清單</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {roomData.map((room) => (
          <div
            key={room.id}
            className="bg-white shadow-md rounded-lg p-4 border flex flex-col"
          >
            <div className="text-lg font-semibold">{room.name}</div>
            <div className="text-sm text-gray-500">{room.location}</div>
            <div className="text-yellow-600">⭐️ {room.rating}</div>
            <div className="text-xs mt-1">
              {room.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <button
              disabled={clickedRooms.includes(room.id)}
              onClick={() => handleMarkAsPlayed(room)}
              className={`mt-auto bg-green-500 hover:bg-green-600 text-white py-2 px-4 mt-4 rounded ${
                clickedRooms.includes(room.id) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {clickedRooms.includes(room.id) ? "✅ 已玩過" : "🎮 我玩過"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomListPage;
