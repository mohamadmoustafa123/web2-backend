import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
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
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("you should send an Id");
  }
  if (isNaN(Number(id))) {
    return res.status(400).json({ message: "Student ID must be a number" });
  }
  const q = "DELETE FROM tasks WHERE id = ?";
  db.query(q, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    } else {
      if (data.affectedRows === 0) {
        return res.status(404).json({ message: "task not found" });
      }
      return res.status(200).json({ message: "Task deleted successfully" });
    }
  });
});
/* ----------------------------------------------------
    Sign in   login 
---------------------------------------------------- */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }
  const q = "SELECT * FROM users WHERE Email = ? ";
  db.query(q, [email, password], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length === 0) {
      return res.status(401).json("Email or password incorrect");
    }

    const isMatch = bcrypt.compareSync(password, data[0].Password);
    if (!isMatch) {
      return res.status(401).json("Email or password incorrect");
    }
    res.status(200).json("Login success");
  });
});
/* ----------------------------------------------------
    Sign up 
---------------------------------------------------- */
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json("Name, email, and password are required");
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const insertQuery =
    "INSERT INTO users (Name, Email, Password) VALUES (?, ?, ?)";

  db.query(insertQuery, [name, email, hashedPassword], (err, data) => {
    if (err) {
      if (err.errno == 1062) {
        return res.status(401).send(err.sqlMessage)
      }
      return res.status(500).json(err);
    }

    return res.status(201).json("success register");
  });
});
