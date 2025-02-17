const admin = require('firebase-admin');

module.exports = async function checkFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Тепер у decodedToken зберігаються uid, email тощо
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

