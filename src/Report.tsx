import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

type ReportData = {
  id: number;
  job_title: string;
  company_name: string;
  date_applied: string;
  status_name: string;
  notes: string; // Added notes property
};

type Company = {
  id: number;
  name: string;
};

type Status = {
  id: number;
  status_name: string;
};

const Report: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

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

  const handleFilter = () => {
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(companyId && { company_id: companyId }),
      ...(statusId && { status_id: statusId }),
    });

    fetch(`http://localhost:5000/applications/filter?${queryParams.toString()}`)
      .then((response) => response.json())
      .then((data) => setReportData(data))
      .catch((error) => console.error("Error fetching report data:", error));
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Grid container spacing={4}>
        {/* Filter Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Filter Applications
            </Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFilter();
              }}
            >
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Company</InputLabel>
                <Select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Companies</em>
                  </MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.status_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{ marginTop: 2 }}
              >
                Apply Filters
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Report Table */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              Report
            </Typography>
            {reportData.length > 0 ? (
              <TableContainer>
                <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Job Title</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Date Applied</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Notes</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {reportData.map((row) => (
                        <TableRow key={row.id}>
                        <TableCell>{row.job_title}</TableCell>
                        <TableCell>{row.company_name}</TableCell>
                        <TableCell>{new Date(row.date_applied).toLocaleDateString()}</TableCell>
                        <TableCell>{row.status_name}</TableCell>
                        <TableCell>{row.notes}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary" sx={{ marginTop: 2 }}>
                No data available. Apply filters to see results.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Report;