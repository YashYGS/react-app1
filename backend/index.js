// Import necessary modules
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./db.js";
import Company from "./models/Company.js";
import Application from "./models/Application.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
const cors = require("cors");

app.use(
  cors({
    origin: "https://react-app1-v4ab.onrender.com", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Sync Sequelize models
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced with Sequelize!");
});

// MySQL Database Connection
const db = mysql.createConnection({
  host: "34.9.87.219",
  user: "root", 
  password: "Gyashaswini@123",
  database: "job_tracker",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("✅ Connected to MySQL Database!");
});

// Test Route
app.get("/", (req, res) => {
  res.send("Hello! Your Job Tracker API is running...");
});

// Get all job applications
app.get("/applications", (req, res) => {
  db.query("SELECT * FROM applications", (err, results) => {
    if (err) {
      console.error("Error fetching applications:", err);
      res.status(500).send("Error fetching applications");
    } else {
      res.json(results);
    }
  });
});

// transaction with adding new job applicaiton 
app.post("/applications", async (req, res) => {
  const { company_id, job_title, status_id, notes } = req.body;

  if (!company_id || !job_title || !status_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transaction = await sequelize.transaction();
  try {
    const application = await Application.create(
      { company_id, job_title, status_id, notes },
      { transaction }
    );
    await transaction.commit();
    console.log("Application added successfully:", application);
    res.status(201).json({ message: "Application added successfully!", id: application.id });
  } catch (err) {
    await transaction.rollback();
    console.error("Error adding application:", err);
    res.status(500).send("Error adding application");
  }
});

// Add a new job application
// app.post("/applications", async (req, res) => {
//   const { company_id, job_title, status_id, notes } = req.body;

//   if (!company_id || !job_title || !status_id) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const application = await Application.create({
//       company_id,
//       job_title,
//       status_id,
//       notes,
//     });
//     res.status(201).json({ message: "Application added successfully!", id: application.id });
//   } catch (err) {
//     console.error("Error adding application:", err);
//     res.status(500).send("Error adding application");
//   }
// });

// transaction with updating job application
app.put("/applications/:id", async (req, res) => {
  const { id } = req.params;
  const { company_id, job_title, status_id, notes } = req.body;

  if (!company_id || !job_title || !status_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transaction = await sequelize.transaction();
  try {
    const application = await Application.findByPk(id, { transaction });
    if (!application) {
      await transaction.rollback();
      return res.status(404).send("Application not found");
    }

    await application.update({ company_id, job_title, status_id, notes }, { transaction });
    await transaction.commit();
    res.status(200).json({ message: "Application updated successfully!" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error updating application:", err);
    res.status(500).send("Error updating application");
  }
});

// Update an existing job application
// app.put("/applications/:id", async (req, res) => {
//   const { id } = req.params;
//   const { company_id, job_title, status_id, notes } = req.body;

//   if (!company_id || !job_title || !status_id) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const application = await Application.findByPk(id);
//     if (!application) {
//       return res.status(404).send("Application not found");
//     }

//     await application.update({ company_id, job_title, status_id, notes });
//     res.status(200).json({ message: "Application updated successfully!" });
//   } catch (err) {
//     console.error("Error updating application:", err);
//     res.status(500).send("Error updating application");
//   }
// });

// Delete an existing job application
app.delete("/applications/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM applications WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting application:", err);
      res.status(500).send("Error deleting application");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Application not found");
    } else {
      res.status(200).json({ message: "Application deleted successfully!" });
    }
  });
});

// Get all companies
app.get("/companies", (req, res) => {
  db.query("SELECT * FROM companies", (err, results) => {
    if (err) {
      console.error("Error fetching companies:", err);
      res.status(500).send("Error fetching companies");
    } else {
      res.json(results);
    }
  });
});

// Get all statuses
app.get("/statuses", (req, res) => {
  db.query("SELECT * FROM statuses", (err, results) => {
    if (err) {
      console.error("Error fetching statuses:", err);
      res.status(500).send("Error fetching statuses");
    } else {
      res.json(results);
    }
  });
});

// Get filtered job applications
app.get("/applications/filter", (req, res) => {
    const { startDate, endDate, company_id, status_id } = req.query;
  
    let query = `
      SELECT 
        applications.id,
        applications.job_title,
        applications.date_applied,
        applications.notes,
        companies.name AS company_name,
        statuses.status_name
      FROM applications
      LEFT JOIN companies ON applications.company_id = companies.id
      LEFT JOIN statuses ON applications.status_id = statuses.id
      WHERE 1=1
    `;
    const params = [];
  
    if (startDate) {
      query += " AND applications.date_applied >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND applications.date_applied <= ?";
      params.push(endDate);
    }
    if (company_id) {
      query += " AND applications.company_id = ?";
      params.push(company_id);
    }
    if (status_id) {
      query += " AND applications.status_id = ?";
      params.push(status_id);
    }
  
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching filtered applications:", err);
        res.status(500).send("Error fetching filtered applications");
      } else {
        res.json(results);
      }
    });
  });

// Dynamic PORT handling for flexibility
const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});