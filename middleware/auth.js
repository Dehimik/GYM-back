const admin = require('firebase-admin');

module.exports = async function checkFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.error("⛔ No token provided");
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log("🔑 Received token:", token); // Додано логування

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log("✅ Token decoded successfully:", decodedToken); // Лог розшифрованого токена
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("🔥 Token verification failed:", error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
