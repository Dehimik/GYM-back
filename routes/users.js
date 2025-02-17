const express = require("express");
const router = express.Router();
const admin = require("../firebase"); // Firebase Admin SDK
const db = admin.firestore();
const firebase = require("firebase/app");
require("firebase/auth");

// Ініціалізація Firebase (якщо ще не ініціалізовано)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 📌 ✅ Реєстрація нового користувача
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Створюємо користувача у Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // Додаємо користувача у Firestore
        await db.collection("users").doc(uid).set({
            username,
            email,
            createdAt: new Date().toISOString(),
        });

        // Отримуємо токен для сесії
        const token = await userCredential.user.getIdToken();

        res.status(201).json({ message: "User registered", uid, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// 📌 ✅ Логін користувача
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Авторизація у Firebase Authentication
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        const uid = userCredential.user.uid;

        res.status(200).json({ message: "Login successful", uid, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid email or password" });
    }
});

// 📌 ✅ Отримання інформації про користувача (захищений маршрут)
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Отримуємо токен з заголовка
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        // Перевіряємо токен Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // Отримуємо користувача з Firestore
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });

        res.json({ uid, ...userDoc.data() });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Unauthorized" });
    }
});

module.exports = router;
