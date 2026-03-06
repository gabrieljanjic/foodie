const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  getAllUsers,
  registerUser,
  loginUser,
  getMe,
} = require("./controllers/user.controller");
const { getAllCategories } = require("./controllers/category.controller");
const {
  createRecipe,
  getAllRecipes,
  getExactRecipe,
  getRecipesByCategory,
  getRecipesMadeByMe,
  getRecipesByUser,
  updateRecipe,
  deleteRecipe,
} = require("./controllers/recipe.controller");
const {
  uploadMiddleware,
  uploadPicture,
} = require("./controllers/upload.controller");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

router.get("/me", verifyToken, getMe);
router.get("/users", getAllUsers);
router.post("/register-user", registerUser);
router.post("/login-user", loginUser);

router.get("/categories", getAllCategories);

router.post("/recipe", verifyToken, createRecipe);
router.put("/recipe/:id", verifyToken, updateRecipe);
router.put("/delete-recipe/:id", verifyToken, deleteRecipe);
router.get("/recipes", getAllRecipes);
router.get("/recipe/:id", getExactRecipe);
router.get("/recipe-by-category/:categoryId", getRecipesByCategory);
router.get("/recipes-by-me", verifyToken, getRecipesMadeByMe);
router.get("/recipes-by-user/:id", getRecipesByUser);

router.post("/upload", uploadMiddleware, uploadPicture);

module.exports = router;
