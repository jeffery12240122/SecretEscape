import { useEffect, useState } from "react";
import { roomData } from "../data/roomData";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../components/Header";
import RoomReviewSection from "../components/RoomReviewSection";

const RoomListPage = () => {
  const [clickedRooms, setClickedRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
      await setDoc(roomRef, {
        ...room,
        playedAt: new Date(),
      });
      setClickedRooms((prev) => [...prev, room.id]);
    } catch (err) {
      console.error("儲存紀錄失敗：", err);
    }
  };

  if (loading) return <div className="p-4">載入中...</div>;

  return (
    <>
      <Header user={user} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">密室清單 🗂️</h1>
        <div className="flex flex-col gap-6">
          {roomData.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:shadow-xl"
            >
              {/* 🖼️ 左邊圖片區塊 */}
              <div className="w-40 h-40 flex-shrink-0">
                <img
                  src={`/images/${room.id}.jpg`}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* 📄 右邊文字內容 */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="text-xl font-bold text-gray-800 mb-1">{room.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{room.location}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <RoomReviewSection roomId={room.id} />
                </div>

                <button
                  disabled={clickedRooms.includes(room.id)}
                  onClick={() => handleMarkAsPlayed(room)}
                  className={`mt-4 py-2 px-4 text-sm rounded-lg font-medium transition ${
                    clickedRooms.includes(room.id)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {clickedRooms.includes(room.id) ? "✅ 已玩過" : "🎮 我玩過"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RoomListPage;
