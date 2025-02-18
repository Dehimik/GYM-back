const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase"); // Firebase Admin SDK

// ✅ Реєстрація користувача (БЕЗ ТОКЕНА)
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Створюємо користувача в Firebase Authentication
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

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
