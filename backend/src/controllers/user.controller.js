const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, created_at FROM users",
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("1.");
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
    console.log("2.");

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("3.");

    const result = await pool.query(
      "INSERT INTO users (username,password) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, hashedPassword],
    );
    console.log("4.", result.rows[0]);

    const user = result.rows[0];
    console.log("5.", user);
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    console.log("6.", token);

    res.status(201).json({ success: true, token, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
    const result = await pool.query(
      "SELECT id, username, password FROM users WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: true, message: "User does not exists" });
    }
    const isMatch = await bcrypt.compare(password, result.rows[0].password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({ success: true, token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, created_at FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getAllUsers, registerUser, loginUser, getMe };
