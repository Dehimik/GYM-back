const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase"); // Використовуємо Firebase Admin SDK

// 📌 ✅ Реєстрація нового користувача
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Створюємо користувача у Firebase Authentication (АДМІНСЬКА ВЕРСІЯ)
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username,
        });

        // Додаємо користувача у Firestore
        await db.collection("users").doc(userRecord.uid).set({
            username,
            email,
            createdAt: new Date().toISOString(),
        });

        // Генеруємо токен
        const token = await admin.auth().createCustomToken(userRecord.uid);

        res.status(201).json({ message: "User registered", uid: userRecord.uid, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// 📌 ✅ Логін користувача
router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        // Отримуємо користувача через email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Генеруємо кастомний токен
        const token = await admin.auth().createCustomToken(userRecord.uid);

        res.status(200).json({ message: "Login successful", uid: userRecord.uid, token });
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
