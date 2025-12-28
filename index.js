import express from "express";
import cors from 'cors';
import mysql from "mysql2";
const app = express();

app.use(cors());
app.use(express.json());
app.listen(5000, () => {
  console.log("Server is Running");
});

const db=mysql.createPool({
  port:3306,
  host:"localhost",
  user:"root",
  password:"",
  database:"todolist"
});
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});