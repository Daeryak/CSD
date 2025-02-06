import React, { useState } from "react";
import addDiaryEntry from "./api"; // Firestore API 호출
import "./App.css"; // CSS 유지

function App() {
    const [userId, setUserId] = useState(""); // 사용자 ID
    const [content, setContent] = useState(""); // 감정 기록 텍스트
    const [serverResponse, setServerResponse] = useState(""); // Firestore 응답 메시지
    const [loading, setLoading] = useState(false); // 로딩 상태

    // Firestore 데이터 저장 (버튼 클릭 시 실행)
    const handleSend = async () => {
        if (!userId.trim() || !content.trim()) {
            alert("사용자 ID와 감정 기록을 입력해주세요!");
            return;
        }

        setLoading(true);
        setServerResponse("");

        try {
            // AI 감정 분석 API 호출
            const emotionID = await analyzeEmotion(content);
            // AI 감정 기반 이미지 생성 API 호출
            const generatedImageUrl = await generateEmotionImage(emotionID);

            // Firestore에 저장
            const result = await addDiaryEntry(userId, content, emotionID, generatedImageUrl, `[테스트] ${emotionID} 감정 이미지`);

            setServerResponse(result.message || "Firestore 저장 완료!");
            setUserId("");
            setContent("");

        } catch (error) {
            console.error("데이터 저장 오류:", error);
            setServerResponse("저장 실패. 다시 시도해주세요.");
        }

        setLoading(false);
    };

    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>Gen AI Studio _ HYU Capstone Design</h1>
          <p>Firebase와 AI 감정 분석 모델 연동 테스트 중... - 승근</p>

          {/* 입력 필드 */}
          <div style={{ marginBottom: "20px" }}>
              <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="사용자 ID"
                  style={{ padding: "10px", width: "300px", marginRight: "10px" }}
              />
              <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="오늘의 감정 기록"
                  style={{ padding: "10px", width: "300px" }}
              />
          </div>

          {/* Firestore 저장 버튼 */}
          <button
              onClick={handleSend}
              disabled={loading}
              style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  backgroundColor: loading ? "#6c757d" : "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
              }}
          >
              {loading ? "저장 중..." : "DB에 저장"}
          </button>

          {/* Firestore 저장 응답 메시지 */}
          {serverResponse && (
              <p
                  style={{
                      marginTop: "20px",
                      fontWeight: "bold",
                      color: serverResponse.includes("실패") ? "red" : "green",
                  }}
              >
                  {serverResponse}
              </p>
          )}
      </div>
  );
}

// AI 감정 분석 API (랜덤 감정 반환)
async function analyzeEmotion(text) {
  console.log("AI 감정 분석 실행:", text);
  const emotions = ["기쁨", "슬픔", "분노", "놀람", "평온"];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  return randomEmotion; // 랜덤 감정 선택
}

// AI 감정 기반 이미지 생성 API (랜덤 테스트 이미지 반환)
async function generateEmotionImage(emotion) {
  console.log("AI 이미지 생성 실행:", emotion);
  const imageUrls = {
      "기쁨": "https://via.placeholder.com/300/FFFF00/000000?text=기쁨",
      "슬픔": "https://via.placeholder.com/300/0000FF/FFFFFF?text=슬픔",
      "분노": "https://via.placeholder.com/300/FF0000/FFFFFF?text=분노",
      "놀람": "https://via.placeholder.com/300/FFA500/000000?text=놀람",
      "평온": "https://via.placeholder.com/300/008000/FFFFFF?text=평온"
  };

  return imageUrls[emotion] || "https://via.placeholder.com/300"; // 기본 이미지
}

export default App;