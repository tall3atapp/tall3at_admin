import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHistory,
    faSearch,
    faEdit,
    faTrash,
    faTimes,
    faSave,
} from "@fortawesome/free-solid-svg-icons";
import "./NotificationHistoryDashboard.css";
import { API_CONFIG } from "../../../constants/config";

// Dummy data generator
const generateDummyData = (type, count = 25) => {
    const arr = [];
    for (let i = 1; i <= count; i++) {
        arr.push({
            id: `${type}-${i}`,
            recipientName: `${type} ${i}`,
            recipientEmail: `${type.toLowerCase()}${i}@example.com`,
            recipientPhone: `+92300123${100 + i}`,
            title: `Test Notification ${i}`,
            body: `This is a dummy message body for ${type} notification ${i}.`,
            status: i % 7 === 0 ? "Failed" : "Sent",
            createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        });
    }
    return arr;
};

const TabKey = {
    CUSTOMERS: "customers",
    PROVIDERS: "providers",
};

const NotificationHistoryDashboard = () => {
    const [activeTab, setActiveTab] = useState(TabKey.CUSTOMERS);
    const [customers, setCustomers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Edit state
    const [editing, setEditing] = useState(null); // notification id
    const [editTitle, setEditTitle] = useState("");
    const [editBody, setEditBody] = useState("");

    // Load dummy data
    useEffect(() => {
        const dummyCustomers = generateDummyData("Customer", 25);
        const dummyProviders = generateDummyData("Provider", 25);
        setCustomers(dummyCustomers);
        setProviders(dummyProviders);
    }, []);


    //api yahan hit hogi
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/notification-history`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });


                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.log(data)

                const customers = data.filter(n => n.role?.toLowerCase() === "customer");
                const providers = data.filter(n => n.role?.toLowerCase() === "provider");

                console.log(customers, providers)

                setCustomers(customers);
                setProviders(providers);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };

        fetchHistory();
    }, []);


    // Select list by tab
    const list = activeTab === TabKey.CUSTOMERS ? customers : providers;

    // Apply search
    const filtered = list.filter((h) =>
        `${h.title} ${h.body} ${h.fullName} ${h.email} ${h.userName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Paginate
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Delete handler
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            if (activeTab === TabKey.CUSTOMERS) {
                setCustomers((prev) => prev.filter((h) => h.id !== id));
            } else {
                setProviders((prev) => prev.filter((h) => h.id !== id));
            }
        }
    };

    //     const handleDelete = async (id) => {
    //   if (!window.confirm("Are you sure you want to delete this notification?")) return;

    //   try {
    //     const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/notifications/${id}`, {
    //       method: "DELETE",
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //       },
    //     });

    //     if (!res.ok) throw new Error("Failed to delete notification");

    //     // frontend state update
    //     if (activeTab === TabKey.CUSTOMERS) {
    //       setCustomers((prev) => prev.filter((h) => h.id !== id));
    //     } else {
    //       setProviders((prev) => prev.filter((h) => h.id !== id));
    //     }
    //   } catch (err) {
    //     console.error("Delete failed:", err);
    //   }
    // };


    // Start editing
    const handleEdit = (row) => {
        setEditing(row.id);
        setEditTitle(row.title);
        setEditBody(row.body);
    };

    // Save edit
    const handleSave = () => {
        const updateFn = (prev) =>
            prev.map((h) =>
                h.id === editing ? { ...h, title: editTitle, body: editBody } : h
            );

        if (activeTab === TabKey.CUSTOMERS) {
            setCustomers(updateFn);
        } else {
            setProviders(updateFn);
        }
        setEditing(null);
    };

    //update endpoint yahan pe lagegi 
    //     const handleSave = async () => {
    //   try {
    //     const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/notifications/${editing}`, {
    //       method: "PUT", // ya PATCH agar tum backend me PATCH bana rahe ho
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //       },
    //       body: JSON.stringify({
    //         title: editTitle,
    //         body: editBody,
    //       }),
    //     });

    //     if (!res.ok) throw new Error("Failed to update notification");

    //     // frontend state update
    //     const updateFn = (prev) =>
    //       prev.map((h) =>
    //         h.id === editing ? { ...h, title: editTitle, body: editBody } : h
    //       );
    //     if (activeTab === TabKey.CUSTOMERS) {
    //       setCustomers(updateFn);
    //     } else {
    //       setProviders(updateFn);
    //     }
    //     setEditing(null);
    //   } catch (err) {
    //     console.error("Update failed:", err);
    //   }
    // };


    return (
        <div className="notif-history-wrap">
            {/* Header */}
            <div className="notif-history-header">
                <FontAwesomeIcon icon={faHistory} />
                <h1>Notification History</h1>
            </div>

            {/* Tabs */}
            <div className="notif-history-tabs">
                <button
                    className={activeTab === TabKey.CUSTOMERS ? "active" : ""}
                    onClick={() => {
                        setActiveTab(TabKey.CUSTOMERS);
                        setPage(1);
                    }}
                >
                    Customers
                </button>
                <button
                    className={activeTab === TabKey.PROVIDERS ? "active" : ""}
                    onClick={() => {
                        setActiveTab(TabKey.PROVIDERS);
                        setPage(1);
                    }}
                >
                    Providers
                </button>
            </div>

            {/* Search */}
            <div className="notif-history-controls">
                <div className="search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab} by name, phone, title...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="notif-history-table">
                {filtered.length === 0 ? (
                    <div className="empty">No notifications found.</div>
                ) : (
                    <table>
                        {/* <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Title</th>
                                <th>Message</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead> */}
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th className="email">Email</th>
                                <th className="phone">Phone</th>
                                <th className="title">Title</th>
                                <th className="message">Message</th>
                                <th>Status</th>
                                <th className="date">Date</th>
                                {/* <th className="actions">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((h) => (
                                <tr key={h.id}>
                                    <td>{h.fullName}</td>
                                    <td className="email">{h.email}</td>
                                    <td className="phone">{h.userName}</td>

                                    {/* If editing this row */}
                                    {editing === h.id ? (
                                        <>
                                            <td>
                                                <input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <textarea
                                                    rows={2}
                                                    value={editBody}
                                                    onChange={(e) => setEditBody(e.target.value)}
                                                />
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="title" title={h.title}>{h.title}</td>
                                            <td className="body-preview" title={h.body}>{h.body}</td>
                                        </>
                                    )}

                                    <td className={h.status === "Failed" ? "status-failed" : "status-sent"}>
                                        {h.status}
                                    </td>
                                    <td className="date">{new Date(h.createdAt).toLocaleString()}</td>
                                    {/* <td className="actions">
                                        {editing === h.id ? (
                                            <>
                                                <button className="save-btn" onClick={handleSave}>
                                                    <FontAwesomeIcon icon={faSave} /> Save
                                                </button>
                                                <button className="cancel-btn" onClick={() => setEditing(null)}>
                                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="edit-btn" onClick={() => handleEdit(h)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(h.id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </>
                                        )}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="notif-history-pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                </button>
                <span>
                    Page {page} of {Math.ceil(filtered.length / pageSize)}
                </span>
                <button
                    disabled={page >= Math.ceil(filtered.length / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default NotificationHistoryDashboard;
