const admin = require("firebase-admin");

// Завантажуємо конфігурацію напряму
const serviceAccount = require("./firebase-adminsdk.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
module.exports = { admin, db };
