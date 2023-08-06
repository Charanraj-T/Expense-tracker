const validateBody = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    res.status(400).json({ error: "Invalid Input" });
    return;
  } else next();
};

const invalidRequest = (req, res) => {
  res.status(501).json({ error: "Method not implemented" });
};

module.exports = { validateBody, invalidRequest };
