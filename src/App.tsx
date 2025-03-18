import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Report from "./Report";

// Define types
type Application = {
  id: number;
  company_id: number;
  job_title: string;
  date_applied: string;
  status_id: number;
  notes: string;
};

type Company = {
  id: number;
  name: string;
};

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [statuses, setStatuses] = useState<{ id: number; status_name: string }[]>([]);

  useEffect(() => {
    console.log("Fetching applications...");
    fetch("http://localhost:5000/applications")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched applications:", data);
        setApplications(data);
      })
      .catch((error) => {
        console.error("Error fetching applications:", error);
        setError(error.message);
      });

    console.log("Fetching companies...");
    fetch("http://localhost:5000/companies")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched companies:", data);
        setCompanies(data);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });

      console.log("Fetching statuses...");
      fetch("http://localhost:5000/statuses")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched statuses:", data);
          setStatuses(data);
        })
        .catch((error) => console.error("Error fetching statuses:", error));
  }, []);

  // Function to get company name from company_id
  const getCompanyName = (company_id: number) => {
    const company = companies.find((c) => c.id === company_id);
    return company ? company.name : "Unknown Company";
  };

  const [newApplication, setNewApplication] = useState({
    company_id: "",
    job_title: "",
    status_id: "",
    notes: "",
  });

  // Function to handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewApplication({ ...newApplication, [e.target.name]: e.target.value });
  };

  // Function to submit new application
  const handleSubmit = () => {
    console.log("Submit button clicked");
    const formattedApplication = {
      ...newApplication,
      company_id: Number(newApplication.company_id), // Convert to number
      status_id: Number(newApplication.status_id), // Convert to number
    };
  
    const url = editingApplication
      ? `http://localhost:5000/applications/${editingApplication.id}`
      : "http://localhost:5000/applications";
    const method = editingApplication ? "PUT" : "POST";
  
    console.log("Submitting application:", formattedApplication, "Method:", method);
  
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedApplication),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        if (editingApplication) {
          setApplications(
            applications.map((app) =>
              app.id === editingApplication.id
                ? { ...formattedApplication, id: app.id, date_applied: app.date_applied }
                : app
            )
          );
          setEditingApplication(null);
        } else {
          setApplications([
            ...applications,
            { ...formattedApplication, id: data.id, date_applied: new Date().toISOString() },
          ]);
        }
        setNewApplication({
          company_id: "",
          job_title: "",
          status_id: "",
          notes: "",
        });
      })
      .catch((error) => console.error("Error submitting application:", error));
  };

  // Function to handle edit button click
  const handleEdit = (application: Application) => {
    console.log("Edit button clicked for application:", application);
    setEditingApplication(application);
    setNewApplication({
      company_id: application.company_id.toString(),
      job_title: application.job_title,
      status_id: application.status_id.toString(),
      notes: application.notes,
    });
  };
  // Function to handle delete button click
  const handleDelete = (id: number) => {
    console.log("Delete button clicked for application ID:", id);
    fetch(`http://localhost:5000/applications/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Application deleted successfully");
          setApplications(applications.filter((app) => app.id !== id));
        } else {
          console.error("Failed to delete application");
        }
      })
      .catch((error) => console.error("Error deleting application:", error));
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/report">Report</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/report" element={<Report />} />
          <Route path="/" element={
            <div>
              <h1>Job Applications</h1>
              {error && <p style={{ color: "red" }}>Error: {error}</p>}
              <ul>
                {applications.map((app) => (
                  <li key={app.id}>
                    <strong>{app.job_title}</strong> - Applied at:{" "}
                    <strong>{getCompanyName(app.company_id)}</strong> on{" "}
                    {new Date(app.date_applied).toLocaleDateString()} - Status ID:{" "}
                    {app.status_id} - Notes: {app.notes}
                    <button onClick={() => handleEdit(app)}>Edit</button>
                    <button onClick={() => handleDelete(app.id)}>Delete</button>
                  </li>
                ))}
              </ul>

              <h2>{editingApplication ? "Edit" : "Add"} a Job Application</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <select name="company_id" value={newApplication.company_id} onChange={handleChange} required>
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input type="text" name="job_title" placeholder="Job Title" value={newApplication.job_title} onChange={handleChange} required />
                <input type="number" name="status_id" placeholder="Status ID" value={newApplication.status_id} onChange={handleChange} required />
                <input type="text" name="notes" placeholder="Notes" value={newApplication.notes} onChange={handleChange} />
                <button type="submit">{editingApplication ? "Update" : "Add"} Application</button>
              </form>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;