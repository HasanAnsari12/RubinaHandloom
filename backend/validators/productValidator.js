// @desc    Validate product creation payload data
const validateCreateProduct = (req, res, next) => {
  const { title, description, category, price, stock, images } = req.body;

  // 1. Title validation (required, 2-150 characters, trimmed)
  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product title is required",
    });
  }

  const trimmedTitle = title.trim();
  req.body.title = trimmedTitle;

  if (trimmedTitle.length < 2 || trimmedTitle.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Product title must be between 2 and 150 characters long",
    });
  }

  // 2. Description validation (required, minimum 10 characters, trimmed)
  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product description is required",
    });
  }

  const trimmedDesc = description.trim();
  req.body.description = trimmedDesc;

  if (trimmedDesc.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Product description must be at least 10 characters long",
    });
  }

  // 3. Category validation (required, trimmed)
  if (!category || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product category is required",
    });
  }
  req.body.category = category.trim();

  // 4. Price validation (required, positive number)
  if (price === undefined || price === null || price === "") {
    return res.status(400).json({
      success: false,
      message: "Product price is required",
    });
  }

  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({
      success: false,
      message: "Product price must be a positive number",
    });
  }
  req.body.price = priceNum;

  // 5. Stock validation (optional, must be 0 or greater)
  if (stock !== undefined && stock !== null && stock !== "") {
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Product stock must be a number equal to or greater than 0",
      });
    }
    req.body.stock = stockNum;
  }

  // 6. Images validation (optional, must be an array)
  if (images !== undefined && images !== null) {
    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Product images must be formatted as an array of strings",
      });
    }
  }

  next();
};

// @desc    Validate product update payload data
const validateUpdateProduct = (req, res, next) => {
  const { title, description, category, price, stock, images } = req.body;

  // 1. Title validation (if provided)
  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product title cannot be empty",
      });
    }

    const trimmedTitle = title.trim();
    req.body.title = trimmedTitle;

    if (trimmedTitle.length < 2 || trimmedTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Product title must be between 2 and 150 characters long",
      });
    }
  }

  // 2. Description validation (if provided)
  if (description !== undefined) {
    if (!description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product description cannot be empty",
      });
    }

    const trimmedDesc = description.trim();
    req.body.description = trimmedDesc;

    if (trimmedDesc.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Product description must be at least 10 characters long",
      });
    }
  }

  // 3. Category validation (if provided)
  if (category !== undefined) {
    if (!category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product category cannot be empty",
      });
    }
    req.body.category = category.trim();
  }

  // 4. Price validation (if provided)
  if (price !== undefined) {
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be a positive number",
      });
    }
    req.body.price = priceNum;
  }

  // 5. Stock validation (if provided)
  if (stock !== undefined && stock !== null && stock !== "") {
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Product stock must be a number equal to or greater than 0",
      });
    }
    req.body.stock = stockNum;
  }

  // 6. Images validation (if provided)
  if (images !== undefined && images !== null) {
    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Product images must be formatted as an array of strings",
      });
    }
  }

  next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
};
