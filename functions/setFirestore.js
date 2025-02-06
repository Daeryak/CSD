const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Firebase Admin SDK 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

// Firestore 객체 생성 방식 변경
const db = admin.firestore();  // 기본 Firestore 인스턴스 사용

// Firestore API 엔드포인트 명시 (아시아 리전용)
db.settings({
    host: "asia-northeast3-firestore.googleapis.com",
    ssl: true
});

// Firestore 연결 확인 로그
console.log(" Firestore 연결됨! 프로젝트 ID:", admin.app().options.projectId);


/**
 * 특정 컬렉션의 모든 문서를 삭제하는 함수 (하위 컬렉션 포함)
 */
async function deleteCollection(collectionPath) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`${collectionPath} 컬렉션이 비어 있습니다.`);
        return;
    }

    // 모든 문서 삭제
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`${collectionPath} 컬렉션 초기화 완료!`);
}

/**
 * 특정 컬렉션 내의 문서 + 하위 컬렉션까지 삭제하는 함수
 */
async function deleteCollectionWithSubcollections(collectionPath) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`${collectionPath} 컬렉션이 비어 있습니다.`);
        return;
    }

    for (const doc of snapshot.docs) {
        const docRef = collectionRef.doc(doc.id);

        // 하위 컬렉션 삭제 (entries, shared_entries)
        const subcollections = ["entries", "shared_entries"];
        for (const subcollection of subcollections) {
            await deleteSubcollection(docRef, subcollection);
        }

        // 상위 문서 삭제
        await docRef.delete();
        console.log(`Deleted document: ${docRef.path}`);
    }
}

/**
 * 특정 문서의 하위 컬렉션 삭제
 */
async function deleteSubcollection(parentDocRef, subcollectionName) {
    const subcollectionRef = parentDocRef.collection(subcollectionName);
    const subSnapshot = await subcollectionRef.get();

    if (subSnapshot.empty) {
        return;
    }

    for (const subDoc of subSnapshot.docs) {
        const subDocRef = subcollectionRef.doc(subDoc.id);

        // 감정 분석 & 이미지 생성 하위 컬렉션도 삭제
        const deeperSubcollections = ["emotion_analysis", "generated_images"];
        for (const deeperSub of deeperSubcollections) {
            await deleteSubcollection(subDocRef, deeperSub);
        }

        // 하위 문서 삭제
        await subDocRef.delete();
        console.log(`Deleted subdocument: ${subDocRef.path}`);
    }
}

/**
 * Firestore 데이터 초기화 실행 (삭제 + 데이터 추가)
 */
async function resetFirestore() {
    try {
        console.log("Firestore 데이터 초기화 시작...");

        // 사용자 컬렉션 삭제 (하위 컬렉션 포함)
        await deleteCollectionWithSubcollections("users");

        // 개별 컬렉션 삭제 (맞팔로우 관계)
        const collectionsToDelete = ["friendships"];
        for (const collection of collectionsToDelete) {
            await deleteCollection(collection);
        }

        console.log("Firestore 데이터 초기화 완료!");

        // Firestore에 기본 데이터 추가 (테스트용)
        await seedFirestoreData();

    } catch (error) {
        console.error("Firestore 초기화 중 오류 발생:", error);
    }
}

/**
 * Firestore에 기본 데이터 추가 (테스트용)
 */
async function seedFirestoreData() {
    console.log("Firestore에 테스트 데이터 추가 중...");

    // Firestore Batch 생성
    const batch = db.batch();

    // 기본 사용자 데이터 추가
    const userRef = db.collection("users").doc("testUser");
    batch.set(userRef, { 
        username: "testUser", 
        email: "test@example.com",
        profile_img: "https://example.com/profile.jpg",
        created_at: new Date()
    });

    // 감정 입력 데이터 추가
    const entryRef = userRef.collection("entries").doc("entry1");
    batch.set(entryRef, { 
        content: "오늘은 좋은 하루였다.",
        created_at: new Date()
    });

    // 감정 분석 데이터 추가
    const analysisRef = entryRef.collection("emotion_analysis").doc("analysis1");
    batch.set(analysisRef, {
        valence: 0.8,
        arousal: 0.6,
        emotion_tags: ["행복", "기쁨"],
        created_at: new Date()
    });

    // 생성된 감정 이미지 추가
    const imageRef = entryRef.collection("generated_images").doc("image1");
    batch.set(imageRef, {
        image_url: "https://example.com/generated_image.jpg",
        title: "따뜻한 햇살",
        description: "오늘 하루를 기분 좋게 마무리하는 감정",
        created_at: new Date()
    });

    // 친구 관계 추가
    const friendRef = db.collection("friendships").doc("friendship1");
    batch.set(friendRef, {
        user_id: "testUser",
        friend_id: "friend123",
        status: "accepted",
        created_at: new Date()
    });

    // Firestore에 데이터 커밋
    await batch.commit();
    console.log(" Firestore에 테스트 데이터 추가 완료!");
}

// 실행
resetFirestore();
