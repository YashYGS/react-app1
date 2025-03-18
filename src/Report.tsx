import { useEffect, useState } from "react";

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

type Status = {
  id: number;
  status_name: string;
};

function Report() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    company_id: "",
    status_id: "",
  });

  // Fetch companies and statuses for dropdowns
  useEffect(() => {
    fetch("http://localhost:5000/companies")
      .then((response) => response.json())
      .then((data) => setCompanies(data))
      .catch((error) => console.error("Error fetching companies:", error));

    fetch("http://localhost:5000/statuses")
      .then((response) => response.json())
      .then((data) => setStatuses(data))
      .catch((error) => console.error("Error fetching statuses:", error));
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Fetch filtered applications
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams(filters).toString();
    fetch(`http://localhost:5000/applications/filter?${query}`)
      .then((response) => response.json())
      .then((data) => setApplications(data))
      .catch((error) => console.error("Error fetching filtered applications:", error));
  };

  return (
    <div>
      <h1>Job Applications Report</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </label>
        <label>
          Company:
          <select
            name="company_id"
            value={filters.company_id}
            onChange={handleChange}
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status:
          <select
            name="status_id"
            value={filters.status_id}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status_name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Generate Report</button>
      </form>

      <h2>Filtered Applications</h2>
      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            <strong>{app.job_title}</strong> - Applied at:{" "}
            <strong>{companies.find((c) => c.id === app.company_id)?.name}</strong> on{" "}
            {new Date(app.date_applied).toLocaleDateString()} - Status:{" "}
            {statuses.find((s) => s.id === app.status_id)?.status_name} - Notes: {app.notes}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Report;