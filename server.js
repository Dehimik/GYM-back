require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "https://gymvoid.vercel.app/"],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server works!");
});

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const workoutRoutes = require("./routes/workouts"); // ✅ Нове ім'я змінної
app.use("/workouts", workoutRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
