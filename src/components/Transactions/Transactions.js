import React, { useState, useEffect } from "react";
import "./Transactions.css";
import api from "../../services/api";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Filters
    const [filters, setFilters] = useState({
        customerName: "",
        providerName: "",
        tripTitle: "",
        bookingDate: "",
    });

    const fetchTransactions = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await api.get("/api/admin/bookings/transactions", {
                params: { page, pageSize, ...filters },
            });

            setTransactions(response.data.data || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // const date = new Date(booking.bookingDate);

    // const formatted = date.toLocaleDateString("en-GB", {
    //     day: "2-digit",
    //     month: "2-digit",
    //     year: "numeric"
    // });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchTransactions(1); // reset to page 1 when filtering
    };

    if (loading) {
        return <div className="transactions-container">Loading transactions...</div>;
    }

    return (
        <div className="transactions-container">
            <h2>Transactions</h2>

            {/* 🔹 Filters */}
            <div className="filters">
                <input
                    type="text"
                    name="customerName"
                    placeholder="Customer Name"
                    value={filters.customerName}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="providerName"
                    placeholder="Provider Name"
                    value={filters.providerName}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="tripTitle"
                    placeholder="Trip Title"
                    value={filters.tripTitle}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="bookingDate"
                    value={filters.bookingDate}
                    onChange={handleFilterChange}
                />
                <button onClick={applyFilters}>Search</button>
            </div>

            {/* 🔹 Transactions Table */}
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Trip Name</th>
                        <th>Customer</th>
                        <th>Provider</th>
                        <th>Customer Paid</th>
                        <th>Provider Commission</th>
                        <th>App Commission</th>
                        <th>Gateway Charges</th>  {/*🔹 Future use*/}
                        <th>Tall3at NetProfit</th>
                        <th>Status</th>
                        <th>Booking Date</th>
                    </tr>
                </thead>
                {/* <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.id}</td>
                                <td>{tx.tripName}</td>
                                <td>
                                    {tx.customerName || "N/A"}
                                    <br />
                                    <span className="text-muted">{tx.customerPhone || ""}</span>
                                </td>
                                <td>
                                    {tx.providerName}
                                    <br />
                                    <span className="text-muted">{tx.providerPhone}</span>
                                </td>
                                <td>{tx.totalCost}</td>
                                <td>{tx.status}</td>
                                <td>{new Date(tx.bookingDate).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                No transactions found
                            </td>
                        </tr>
                    )}
                </tbody> */}
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.id}</td>
                                <td>{tx.tripName}</td>

                                <td>
                                    {tx.customerName || "N/A"}
                                    <br />
                                    <span className="text-muted">{tx.customerPhone || ""}</span>
                                </td>

                                <td>
                                    {tx.providerName}
                                    <br />
                                    <span className="text-muted">{tx.providerPhone}</span>
                                </td>

                                {/* 💰 Amounts */}
                                <td>{tx.totalCost}</td>
                                <td>{tx.providerCommission}</td>
                                <td>{tx.appCommission}</td>
                                 <td>{tx.gatewayCharges}</td>  {/* 🔹 Future placeholder */}

                                 <td>{tx.tall3atNetProfit}</td>  {/* 🔹 Future placeholder */}
                                <td>{tx.status}</td>
                                <td>{
                                    new Date(tx.bookingDate).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })

                                }</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                                No transactions found
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => fetchTransactions(i + 1, pagination.pageSize)}
                            className={pagination.currentPage === i + 1 ? "active" : ""}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Transactions;
