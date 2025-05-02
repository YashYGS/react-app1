import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Report from "./Report";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material";
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
const API_URL = "https://job-application-tracker-ttwh.onrender.com";


function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [statuses, setStatuses] = useState<{ id: number; status_name: string }[]>([]);
  const [newApplication, setNewApplication] = useState({
    company_id: "",
    job_title: "",
    status_id: "",
    notes: "",
  });
  const API_URL = "https://job-application-tracker-ttwh.onrender.com";


  useEffect(() => {
    fetch(`${API_URL}/applications`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setApplications(data))
      .catch((error) => setError(error.message));

    fetch(`${API_URL}/companies`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setCompanies(data))
      .catch((error) => console.error("Error fetching companies:", error));

    fetch(`${API_URL}/statuses`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setStatuses(data))
      .catch((error) => console.error("Error fetching statuses:", error));
  }, []);

  const getCompanyName = (company_id: number) => {
    const company = companies.find((c) => c.id === company_id);
    return company ? company.name : "Unknown Company";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
    setNewApplication({ ...newApplication, [name]: value });
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   setNewApplication({ ...newApplication, [e.target.name]: e.target.value });
  // };

  
  const handleSubmit = () => {
    const formattedApplication = {
      ...newApplication,
      company_id: Number(newApplication.company_id),
      status_id: Number(newApplication.status_id),
    };

    const url = editingApplication
      ? `${API_URL}/applications/${editingApplication.id}`
      : `${API_URL}/applications`;
    const method = editingApplication ? "PUT" : "POST";

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

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    setNewApplication({
      company_id: application.company_id.toString(),
      job_title: application.job_title,
      status_id: application.status_id.toString(),
      notes: application.notes,
    });
  };

  const handleDelete = (id: number) => {
    fetch(`${API_URL}/applications/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
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
        {/* Navigation Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Job Tracker
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/report">
              Report
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path="/report" element={<Report />} />
            <Route
              path="/"
              element={
                <Grid container spacing={4}>
                  {/* Applications List */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        Applications
                      </Typography>
                      {error && <Typography color="error">{error}</Typography>}
                      <List>
                        {applications.map((app) => (
                          <ListItem
                            key={app.id}
                            secondaryAction={
                              <>
                                <IconButton edge="end" onClick={() => handleEdit(app)}>
                                  <Edit />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDelete(app.id)}>
                                  <Delete />
                                </IconButton>
                              </>
                            }
                          >
                            <ListItemText
                              primary={`${app.job_title} at ${getCompanyName(app.company_id)}`}
                              secondary={`Applied on ${new Date(app.date_applied).toLocaleDateString()} - Status: ${app.status_id}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  {/* Add/Edit Application Form */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        {editingApplication ? "Edit" : "Add"} Application
                      </Typography>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                      >
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Company</InputLabel>
                          <Select
  name="company_id"
  value={newApplication.company_id}
  onChange={handleChange}
  required
>
  <MenuItem value="">
    <em>Select Company</em>
  </MenuItem>
  {companies.map((company) => (
    <MenuItem key={company.id} value={company.id}>
      {company.name}
    </MenuItem>
  ))}
</Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Job Title"
                          name="job_title"
                          value={newApplication.job_title}
                          onChange={handleChange}
                          margin="normal"
                          required
                        />
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Status</InputLabel>
                          <Select
                            name="status_id"
                            value={newApplication.status_id}
                            onChange={handleChange}
                            required
                          >
                            <MenuItem value="">
                              <em>Select Status</em>
                            </MenuItem>
                            {statuses.map((status) => (
                              <MenuItem key={status.id} value={status.id}>
                                {status.status_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Notes"
                          name="notes"
                          value={newApplication.notes}
                          onChange={handleChange}
                          margin="normal"
                          multiline
                          rows={4}
                        />
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                          {editingApplication ? "Update" : "Add"} Application
                        </Button>
                      </form>
                    </Paper>
                  </Grid>
                </Grid>
              }
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;