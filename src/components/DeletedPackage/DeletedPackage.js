import React, { useEffect, useState } from "react";
import "./DeletedPackage.css";
import api from "../../services/api";

const DeletedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters state
  const [filters, setFilters] = useState({
    deletedByUserId: "",
    userRole: "",
    tripId: "",
    startDate: "",
    endDate: "",
  });

  const fetchDeletedPackages = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/deletedpackages", {
        params: { page, pageSize, ...filters },
      });

      console.log("API Response:", response.data);
      setPackages(response.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch deleted packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedPackages();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchDeletedPackages();
  };

  const handleResetFilters = () => {
    setFilters({
      deletedByUserId: "",
      userRole: "",
      tripId: "",
      startDate: "",
      endDate: "",
    });
    fetchDeletedPackages();
  };

  if (loading) return <p className="loading">Loading deleted packages...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="deleted-packages">
      <h2>Deleted Packages</h2>

      {/* Filter Section */}
      <div className="filter-container">
        {/* <input
          type="text"
          name="deletedByUserId"
          placeholder="Deleted By User ID"
          value={filters.deletedByUserId}
          onChange={handleInputChange}
        /> */}
        <select
          name="userRole"
          value={filters.userRole}
          onChange={handleInputChange}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="provider">Provider</option>
          {/* <option value="customer">Customer</option> */}
        </select>
        <input
          type="number"
          name="tripId"
          placeholder="Trip ID"
          value={filters.tripId}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
        />
        <button onClick={handleApplyFilters}>Apply</button>
        <button className="reset-btn" onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      {/* Table */}
      {packages.length === 0 ? (
        <p className="empty">No deleted packages found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Package ID</th>
              <th>Trip ID</th>
              <th>Trip Title</th>
              <th>Deleted By</th>
              <th>Package Data</th>
              <th>Deleted At</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.packageId}</td>
                <td>{pkg.tripId}</td>
                <td>{pkg.tripTitle}</td>
                <td>{pkg.deletedByUserName || "Unknown"}</td>
                <td>
                  <ul className="pkg-data">
                    <li><b>Cost:</b> {pkg.packageData?.cost}</li>
                    <li><b>Unit:</b> {pkg.packageData?.unit}</li>
                    <li><b>Hours:</b> {pkg.packageData?.numberOfHours}</li>
                    <li><b>Min:</b> {pkg.packageData?.minCount}</li>
                    <li><b>Max:</b> {pkg.packageData?.maxCount}</li>
                    <li><b>Status:</b> {pkg.packageData?.status}</li>
                  </ul>
                </td>
                <td>
                  {new Date(pkg.deletedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td>{pkg.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeletedPackages;
