// src/components/RoomReviewSection.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const RoomReviewSection = ({ roomId }) => {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [editStates, setEditStates] = useState({});
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  const fetchReviews = async () => {
    const colRef = collection(db, "reviews", roomId, "userReviews");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReviews(data);

    const scores = data.map((r) => r.score).filter((s) => typeof s === "number");
    if (scores.length > 0) {
      const avg = (
        scores.reduce((a, b) => a + b, 0) / scores.length
      ).toFixed(1);
      setAverage(avg);
    } else {
      setAverage(null);
    }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm("確定要刪除這則評論嗎？")) return;

    try {
      const ref = doc(db, "reviews", roomId, "userReviews", uid);
      await deleteDoc(ref);
      alert("已刪除評論！");
      fetchReviews();
    } catch (error) {
      console.error("刪除評論失敗：", error);
    }
  };

  const handleEditChange = (id, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleEditSubmit = async (id) => {
    const review = editStates[id];
    if (!review) return;
    try {
      const ref = doc(db, "reviews", roomId, "userReviews", id);
      await updateDoc(ref, {
        text: review.text,
        score: parseInt(review.score),
      });
      alert("✅ 已更新評論！");
      setEditStates((prev) => ({ ...prev, [id]: null }));
      fetchReviews();
    } catch (error) {
      console.error("更新失敗：", error);
    }
  };

  return (
    <div className="mt-4 text-sm border-t pt-3 space-y-2">
      {average && (
        <div className="text-yellow-600 font-semibold">
          ⭐️ 平均評分：{average} / 5
        </div>
      )}
      {reviews.length === 0 ? (
        <div className="text-gray-400">暫無評論</div>
      ) : (
        reviews.map((r) => {
          const isMyReview = currentUser?.uid === r.id;
          const isEditing = editStates[r.id] !== undefined;
          return (
            <div key={r.id} className="bg-gray-100 p-2 rounded">
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-800">
                  {r.displayName || "匿名"}：{r.score} / 5
                </div>
                {isMyReview && (
                  <div className="flex gap-2">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() =>
                            setEditStates((prev) => ({
                              ...prev,
                              [r.id]: { score: r.score, text: r.text },
                            }))
                          }
                          className="text-blue-500 text-xs hover:underline"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          刪除
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editStates[r.id]?.score || ""}
                    onChange={(e) =>
                      handleEditChange(r.id, "score", e.target.value)
                    }
                    className="border px-2 py-1 rounded w-16"
                  />
                  <textarea
                    rows="2"
                    className="w-full border px-2 py-1 rounded"
                    value={editStates[r.id]?.text || ""}
                    onChange={(e) =>
                      handleEditChange(r.id, "text", e.target.value)
                    }
                  />
                  <button
                    onClick={() => handleEditSubmit(r.id)}
                    className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() =>
                      setEditStates((prev) => ({ ...prev, [r.id]: undefined }))
                    }
                    className="text-gray-500 text-xs ml-2 hover:underline"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="text-gray-600">{r.text}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default RoomReviewSection;