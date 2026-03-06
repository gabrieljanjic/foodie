const pool = require("../config/db");

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM categories");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { getAllCategories };
