const express = require("express");
var fs = require("fs");
let path = require("path");
const server = express();
let morgan = require("morgan");
const PORT = 4500;

const logDirectory = "src";
const logFileName = "access.log";

const accessLogPath = path.join(logDirectory, logFileName);

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(accessLogPath), {
  flags: "a",
});

const customFormat =
  ":method :status :res[content-length] - :response-time ms :date[clf] HTTP/:http-version :url";

server.use(morgan(customFormat, { stream: accessLogStream }));
server.use(express.json());

server.get("/", (req, res) => {
  res.status(200).send("Welcome to the root route");
});

server.get("/get-users", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "db.json"), "utf-8")
  );
  res.status(200).send(data);
});

server.post("/add-user", (req, res) => {
  const newTask = req.body;

  const db = JSON.parse(
    fs.readFileSync(path.join(__dirname, "db.json"), "utf8")
  );

  db.todos.push(newTask);

  fs.writeFileSync(
    path.join(__dirname, "db.json"),
    JSON.stringify(db, null, 2),
    "utf8"
  );

  res.status(201).send(newTask);
});

server.put("/user/:id", (req, res) => {
  const updateTask = req.body;
  const taskId = parseInt(req.params.id, 10);

  const db = JSON.parse(
    fs.readFileSync(path.join(__dirname, "db.json"), "utf-8")
  );

  const taskIndex = db.todos.findIndex((task) => task.id === taskId);

  //   console.log(taskIndex);

  if (taskIndex === -1) {
    return res.status(404).send("task Id not found");
  }

  db.todos[taskIndex] = { ...db.todos[taskIndex], ...updateTask };

  fs.writeFileSync(
    path.join(__dirname, "db.json"),
    JSON.stringify(db, null, 2),
    "utf8"
  );

  res.status(201).send(`task-${taskId} is updated`);
});

server.delete("/user/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const dbPath = path.join(__dirname, "db.json");

  try {
    // Read the db.json file
    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    // Filter out the task with the given id
    const updatedTodos = db.todos.filter((task) => task.id !== taskId);

    // Check if any task was removed
    if (updatedTodos.length === db.todos.length) {
      return res.status(404).send("Task ID not found");
    }

    // Update the db object
    db.todos = updatedTodos;

    // Write the updated tasks array back to the db.json file
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

    res.status(200).send(`Task-${taskId} is deleted`);
  } catch (error) {
    console.error("Error updating db.json:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
