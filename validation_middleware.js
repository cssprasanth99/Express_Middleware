const express = require("express");

const app = express();
const PORT = 4500;

app.use(express.json());

// Validation Middleware
function validateTodoRequest(req, res, next) {
  const schema = {
    ID: "number",
    Name: "string",
    Rating: "number",
    Description: "string",
    Genre: "string",
    Cast: "array",
  };

  const errors = [];

  for (const key in schema) {
    if (!req.body.hasOwnProperty(key)) {
      errors.push(`Missing field: ${key}`);
    } else if (typeof req.body[key] !== schema[key]) {
      if (schema[key] === "array" && Array.isArray(req.body[key])) {
        if (!req.body[key].every((item) => typeof item === "string")) {
          errors.push(`Field '${key}' should be an array of strings.`);
        }
      } else {
        errors.push(
          `Invalid type for field '${key}'. Expected ${
            schema[key]
          }, but received ${typeof req.body[key]}.`
        );
      }
    }
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ message: "bad request. some data is incorrect.", errors });
  }

  next();
}

// POST Route
app.post("/", validateTodoRequest, (req, res) => {
  console.log(req.body);
  res.status(200).send("data received");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
