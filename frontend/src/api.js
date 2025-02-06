const API_URL = "https://us-central1-genai-cc7f9.cloudfunctions.net/addData"; 

/**
 * Firestore에 감정 기록을 저장하는 API 호출 함수
 * @param {string} userId - 사용자 ID
 * @param {string} content - 사용자가 입력한 감정 기록
 * @param {string} emotionID - 감정 분석 결과
 * @param {string} generatedImageUrl - 생성된 감정 이미지 URL
 * @param {string} Imagetitle - 감정 이미지 제목
 * @returns {Promise<object>} - Firestore 응답
 */
async function addDiaryEntry(userId, content, emotionID, generatedImageUrl, Imagetitle) {
    try {
        const requestBody = {
            userId,
            content,
            emotionID,
            generatedImageUrl: generatedImageUrl || "https://via.placeholder.com/300", // 기본 테스트 이미지
            Imagetitle: Imagetitle || `[테스트] ${emotionID} 감정 이미지`
        };

        // Firebase Cloud Functions API 호출
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status} - ${responseData.error}`);
        }

        console.log("Firestore 저장 완료:", responseData);
        return responseData;

    } catch (error) {
        console.error("Firestore 저장 오류:", error);
        return { error: "Firestore 저장 실패" };
    }
}

export default addDiaryEntry;