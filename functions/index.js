// 기본 모듈 호출
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // CORS 정책 해결

// Firebase Admin SDK 초기화
admin.initializeApp();
const db = admin.firestore();

// Firestore에 데이터 저장 API
exports.addData = functions.https.onRequest(async (req, res) => {
    console.log("Received Request Body:", req.body); // 요청 본문 로그

    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "POST 요청만 지원됩니다." });
        }

        try {
            const { userId, content, emotionID = "미설정", generatedImageUrl = "https://via.placeholder.com/300", Imagetitle = "제목 없음" } = req.body;
            //클라이언트에서 보낸 데이터, 감정ID랑 URL은 임시

            // 필수 입력값 검증
            if (!userId || !content) {
                return res.status(400).json({ error: "필수 입력값이 없습니다." });
            }

            // Firestore의 users/{userId}/entries에 저장
            const newEntryRef = db.collection("users").doc(userId).collection("entries").doc();
            await newEntryRef.set({
                content,
                emotionID,
                generatedImageUrl,
                Imagetitle,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log("Firestore 저장 완료! 문서 ID:", newEntryRef.id);

            // 성공 응답 반환
            res.status(200).json({ id: newEntryRef.id, message: "데이터가 Firestore에 저장되었습니다!" });

        } catch (error) {
            console.error("Firestore 저장 실패:", error);
            res.status(500).json({ error: error.message });
        }
    });
});