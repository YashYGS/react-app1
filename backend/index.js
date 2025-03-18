// Import necessary modules
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Change if using a different user
    password: "Gyashaswini@123", // Ensure correct password
    database: "job_tracker"
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

// Add a new job application
app.post("/applications", (req, res) => {
    const { company_id, job_title, status_id, notes } = req.body;

    if (!company_id || !job_title || !status_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    db.query(
        "INSERT INTO applications (company_id, job_title, status_id, notes) VALUES (?, ?, ?, ?)",
        [company_id, job_title, status_id, notes],
        (err, result) => {
            if (err) {
                console.error("Error adding application:", err);
                res.status(500).send("Error adding application");
            } else {
                res.status(201).json({ message: "Application added successfully!", id: result.insertId });
            }
        }
    );
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

  // Update an existing job application
app.put("/applications/:id", (req, res) => {
    const { id } = req.params;
    const { company_id, job_title, status_id, notes } = req.body;
  
    if (!company_id || !job_title || !status_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    db.query(
      "UPDATE applications SET company_id = ?, job_title = ?, status_id = ?, notes = ? WHERE id = ?",
      [company_id, job_title, status_id, notes, id],
      (err, result) => {
        if (err) {
          console.error("Error updating application:", err);
          res.status(500).send("Error updating application");
        } else if (result.affectedRows === 0) {
          res.status(404).send("Application not found");
        } else {
          res.status(200).json({ message: "Application updated successfully!" });
        }
      }
    );
  });
  

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

  
// Get all statuses
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
// Get filtered job applications
app.get("/applications/filter", (req, res) => {
    const { startDate, endDate, company_id, status_id } = req.query;
  
    let query = "SELECT * FROM applications WHERE 1=1";
    const params = [];
  
    if (startDate) {
      query += " AND date_applied >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND date_applied <= ?";
      params.push(endDate);
    }
    if (company_id) {
      query += " AND company_id = ?";
      params.push(company_id);
    }
    if (status_id) {
      query += " AND status_id = ?";
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
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
