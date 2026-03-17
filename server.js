const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function makeToken(size = 24) {
  return crypto.randomBytes(size).toString("hex");
}

app.get("/api/csrf", (req, res) => {
  const csrfToken = makeToken(16);

  res.cookie("csrfToken", csrfToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 20 * 60 * 1000,
    path: "/",
  });

  res.json({ csrfToken });
});

app.post("/api/login", (req, res) => {
  const { username, password, csrfToken } = req.body;

  if (!csrfToken || csrfToken !== req.cookies.csrfToken) {
    return res.status(403).json({ message: "Invalid CSRF token." });
  }

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  res.cookie("authToken", "user123", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json({
    message: "Login successful.",
    username,
    expiresInDays: 7,
    note: "Cookie is set on the server with HttpOnly and Secure policy.",
  });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.json({ message: "Logged out. authToken removed." });
});

app.get("/api/session", (req, res) => {
  const isAuthenticated = Boolean(req.cookies.authToken);
  res.json({ isAuthenticated });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Web Storage running at http://localhost:${PORT}`);
});
