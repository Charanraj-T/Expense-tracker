const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    return res.status(400).json({ message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : err.message,
  });
};

module.exports = { notFound, errorHandler };