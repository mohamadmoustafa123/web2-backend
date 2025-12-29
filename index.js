import express from "express";
import cors from "cors";
import mysql from "mysql2";
const app = express();

app.use(cors());
app.use(express.json());
app.listen(5000, () => {
  console.log("Server is Running");
});

const db = mysql.createPool({
  port: 3306,
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist",
});
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.get("/tasks", (req, res) => {
  const q = "SELECT * FROM tasks";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    } else {
      if (data.length === 0) {
        return res.status(204).send("not found");
      }
      return res.status(200).json(data);
    }
  });
});

app.post("/tasks", (req, res) => {
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }
  const { title } = req.body;
  const q = "INSERT INTO tasks (Task) VALUES (?)";
  db.query(q, [title], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    } else {
      return res
        .status(201)
        .json({ message: "Tasks created successfully", id: data.insertId });
    }
  });
});

app.put("/tasks/:id", (req, res) => {
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }
  const { id } = req.params;
  const { newtitle } = req.body;
  if (!id) {
    return res.status(400).send("you should send an ID");
  }
  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Task ID must be a number" });
  }
  const q = "UPDATE tasks SET Task = ? WHERE id = ?";

  db.query(q, [newtitle, id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    } else {
      if (data.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(200).json({ message: "Task updated successfully" });
    }
  });
});

app.put("/tasksIsCompleted/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("you should send an ID");
  }
  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Task ID must be a number" });
  }
  const q = "UPDATE tasks SET isCompleted = NOT isCompleted WHERE id = ?";

  db.query(q, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    } else {
      if (data.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(200).json({ message: "Task updated successfully" });
    }
  });

  app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("you should send an Id");
    }
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: "Student ID must be a number" });
    }
    
  });
});
