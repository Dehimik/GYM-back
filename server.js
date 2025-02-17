require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "https://your-frontend-url.com", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server works!");
});

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
