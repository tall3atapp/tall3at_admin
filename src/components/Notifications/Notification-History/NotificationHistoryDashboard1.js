import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSearch,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { API_CONFIG } from "../../../constants/config";

import "./NotificationHistoryDashboard.css";

const API_BASE = API_CONFIG.BASE_URL + "/api/admin";
const NOTIFICATION_HISTORY_API = `${API_BASE}/notifications-history`; 
// <- tum backend se confirm karke update karna

const NotificationHistoryDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch history from API
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${NOTIFICATION_HISTORY_API}?page=${page}&pageSize=20`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setHistory(data?.data || []);
        setTotalPages(data?.totalPages || 1);
      } catch (e) {
        setError("Failed to load notification history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  // Search filter
  const filteredHistory = history.filter((h) =>
    `${h.title} ${h.body} ${h.recipientName} ${h.recipientEmail}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="notif-history-wrap">
      {/* Header */}
      <div className="notif-history-header">
        <FontAwesomeIcon icon={faHistory} />
        <h1>Notification History</h1>
      </div>

      {/* Search */}
      <div className="notif-history-controls">
        <div className="search">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by title, recipient, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="notif-history-table">
        {loading ? (
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading...
          </div>
        ) : error ? (
          <div className="error">
            <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty">No notifications found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Email</th>
                <th>Title</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h) => (
                <tr key={h.id}>
                  <td>{h.recipientName || "—"}</td>
                  <td>{h.recipientEmail || "—"}</td>
                  <td>{h.title}</td>
                  <td className="body-preview">{h.body}</td>
                  <td>{h.status || "Sent"}</td>
                  <td>{new Date(h.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="notif-history-pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NotificationHistoryDashboard;

