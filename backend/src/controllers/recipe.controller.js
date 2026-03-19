const pool = require("../config/db");

const createRecipe = async (req, res) => {
  try {
    const {
      categoryId,
      title,
      description,
      instructions,
      servings,
      time,
      private: isPrivate,
      ingredients,
      imageUrl,
    } = req.body;
    const result = await pool.query(
      "INSERT INTO recipes (user_id,category_id,title,description,instructions,servings,cook_time,is_private,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [
        req.user.id,
        categoryId,
        title,
        description,
        instructions,
        servings,
        time,
        isPrivate,
        imageUrl,
      ],
    );
    if (!title || !description || !categoryId || !time) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const recipe = result.rows[0];

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      await Promise.all(
        ingredients.map((ingredient) =>
          pool.query(
            "INSERT INTO ingredients (recipe_id, name) VALUES ($1, $2)",
            [recipe.id, ingredient],
          ),
        ),
      );
    }

    return res.status(201).json({
      success: true,
      recipe,
      ingredients: ingredients || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      title,
      description,
      instructions,
      servings,
      time,
      private: isPrivate,
      ingredients,
      imageUrl,
    } = req.body;

    const recipe = await pool.query(
      `SELECT * FROM recipes WHERE id=$1 AND user_id=$2`,
      [id, req.user.id],
    );

    if (recipe.rows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await pool.query(
      `UPDATE recipes SET
        category_id = $1,
        title = $2,
        description = $3,
        instructions = $4,
        servings = $5,
        cook_time = $6,
        is_private = $7,
        image_url = $8,
        updated_at = NOW()
      WHERE id = $9`,
      [
        categoryId,
        title,
        description,
        instructions,
        servings,
        time,
        isPrivate,
        imageUrl,
        id,
      ],
    );

    await pool.query(`DELETE FROM ingredients WHERE recipe_id = $1`, [id]);

    if (ingredients?.length) {
      for (const ingredient of ingredients) {
        await pool.query(
          `INSERT INTO ingredients (recipe_id, name) VALUES ($1, $2)`,
          [id, ingredient],
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT recipes.*, categories.name AS category_name 
        FROM recipes 
        LEFT JOIN categories ON recipes.category_id = categories.id
        WHERE recipes.is_private = false AND deleted_at IS NULL ORDER BY recipes.created_at DESC
`,
    );
    return res.status(200).json({
      success: true,
      allRecipes: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const getExactRecipe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT recipes.*, 
        categories.name AS category_name, 
        users.username,
        array_agg(ingredients.name) AS ingredients
        FROM recipes
        LEFT JOIN categories ON recipes.category_id = categories.id
        LEFT JOIN users ON recipes.user_id = users.id
        LEFT JOIN ingredients ON ingredients.recipe_id = recipes.id
        WHERE recipes.id = $1 AND recipes.deleted_at IS NULL
        GROUP BY recipes.id, categories.name, users.username`,
      [req.params.id],
    );
    return res.status(200).json({
      success: true,
      recipe: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const getRecipesByCategory = async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT * FROM recipes WHERE category_id=$1 AND is_private=false AND deleted_at IS NULL ORDER BY recipes.created_at DESC`,
      [req.params.categoryId],
    );
    return res.status(200).json({
      success: true,
      recipes: results.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const getRecipesMadeByMe = async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT * FROM recipes WHERE user_id=$1 AND deleted_at IS NULL ORDER BY recipes.created_at DESC`,
      [req.user.id],
    );
    return res.status(200).json({
      success: true,
      recipes: results.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
const getRecipesByUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const results = await pool.query(
      `SELECT recipes.*, users.username FROM recipes LEFT JOIN users ON recipes.user_id=users.id WHERE user_id=$1 AND is_private=false AND deleted_at IS NULL ORDER BY recipes.created_at DESC`,
      [userId],
    );
    return res.status(200).json({
      success: true,
      recipes: results.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteRecipe = async (req, res) => {
  const recipeId = req.params.id;
  try {
    const recipe = await pool.query(
      `SELECT * FROM recipes WHERE id=$1 AND user_id=$2`,
      [recipeId, req.user.id],
    );
    if (recipe.rows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await pool.query(`UPDATE recipes SET deleted_at=NOW() WHERE id=$1 `, [
      recipeId,
    ]);
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipes,
  getExactRecipe,
  getRecipesByCategory,
  getRecipesMadeByMe,
  getRecipesByUser,
};
