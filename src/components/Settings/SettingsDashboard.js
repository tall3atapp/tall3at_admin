import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSync } from "@fortawesome/free-solid-svg-icons";
import "./SettingsDashboard.css";
import SuccessModal from "../SuccessModal";
import { API_CONFIG as API } from "../../constants/config";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Dummy data
// const initialPlaces = [
//     { id: "3", image: "dammam.jpg", name: "أبها", nameEn: "Dammam", active: 1, createdAt: "2025-04-11 09:54:09" },
//     { id: "17", image: "jubail.jpg", name: "الجبيل", nameEn: "Jubail", active: 1, createdAt: "2025-04-11 09:54:09" },
//     { id: "37", image: "al_khobar.jpg", name: "الخبر و الدمام", nameEn: "Al-Khobar", active: 1, createdAt: "2025-04-11 09:54:09" },
//     { id: "55", image: "hail.jpg", name: "حائل", nameEn: "Hail", active: 1, createdAt: "2025-04-11 09:54:09" },
//     { id: "56", image: "taif.jpeg", name: "الطائف", nameEn: "Taif", active: 1, createdAt: "2025-04-11 09:54:09" },
// ];

const SettingsDashboard = () => {
    const [appVersion, setAppVersion] = useState("");
    const [isOnReview, setIsOnReview] = useState("NO");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [savedVersion, setSavedVersion] = useState("");
    const [successModal, setSuccessModal] = useState({ isVisible: false, message: "" });

    const [places, setPlaces] = useState([]);

    // ✅ Success Modal Controls
    const showSuccessMessage = (msg) => setSuccessModal({ isVisible: true, message: msg });
    const closeSuccessModal = () => setSuccessModal({ isVisible: false, message: "" });

    // 🚀 Fetch current configs
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/AppConfig");
            if (Array.isArray(res.data)) {
                const versionConfig = res.data.find((c) => c.key === "AppVersion");
                const reviewConfig = res.data.find((c) => c.key === "IsAppOnReview");

                if (versionConfig?.value) {
                    setAppVersion(versionConfig.value.toString());
                    setSavedVersion(versionConfig.value.toString());
                }
                if (reviewConfig) setIsOnReview(reviewConfig.value);
            }
        } catch (err) {
            console.error("Error fetching configs:", err);
            setMessage("Error fetching configs");
        } finally {
            setLoading(false);
        }
    };
    const fetchCities = async () => {
        try {
            const res = await fetch(`${API.BASE_URL}/api/admin/settings/reordered`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();

            // Sort by tripOrder (smallest first, 1 = top)
            const sorted = [...data].sort((a, b) => a.tripOrder - b.tripOrder);
            setPlaces(sorted);
        } catch (err) {
            console.error("Error fetching cities:", err);
            setMessage("Error fetching cities");
        }
    };

    useEffect(() => {
        fetchConfigs();
        fetchCities();
    }, []);

    // 🚀 Update review + version
    const handleUpdate = async () => {
        try {
            setLoading(true);
            setMessage("");

            const payload = { appVersion, reviewStatus: isOnReview };
            const res = await api.put("/api/AppConfig/update-review", payload);

            if (res.data.version) setSavedVersion(res.data.version.toString());
            showSuccessMessage("App settings updated successfully");
        } catch (err) {
            console.error("Error updating config:", err);
            setMessage("Error updating config");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Drag & Drop Reorder Helper
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reordered = reorder(places, result.source.index, result.destination.index);
        setPlaces(reordered);

        // 🔹 API call yahan hogi (commented)
        /*
        fetch(`${API_CONFIG.BASE_URL}/api/admin/places/reorder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            places: reordered.map((p, index) => ({
              id: p.id,
              position: index + 1,
            })),
          }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Reorder saved:", data))
          .catch((err) => console.error("Failed to reorder:", err));
        */

        fetch(`${API.BASE_URL}/api/admin/settings/reorder`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(
                reordered.map((p, index) => ({
                    id: p.id,
                    position: index + 1,
                }))
            ),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Reorder saved:", data);
                showSuccessMessage("Cities reordered successfully ✅");
            })
            .catch((err) => {
                console.error("Failed to reorder:", err);
                setMessage("Error saving reorder");
            });

    };

    return (
        <div className="dashboard-container">
            {/* ⚙️ Settings Section */}
            <section className="settings-dashboard">
                <div className="settings-header">
                    <h2>Settings Dashboard</h2>
                    {appVersion && <span className="version-badge">v{appVersion}</span>}
                </div>

                {loading && <p className="loading-text">Loading...</p>}

                <div className="settings-grid">
                    <div className="settings-card">
                        <h3>App Version</h3>
                        <input
                            type="text"
                            value={appVersion ?? ""}
                            onChange={(e) => setAppVersion(e.target.value)}
                            placeholder="Enter app version"
                        />
                    </div>

                    <div className="settings-card">
                        <h3>Review Mode</h3>
                        <select value={isOnReview} onChange={(e) => setIsOnReview(e.target.value)}>
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                        </select>
                    </div>
                </div>

                <div className="settings-actions">
                    <button className="btn-refresh" onClick={fetchConfigs} disabled={loading}>
                        <FontAwesomeIcon icon={faSync} /> Refresh
                    </button>
                    <button className="btn-save" onClick={handleUpdate} disabled={loading}>
                        <FontAwesomeIcon icon={faSave} /> Save
                    </button>
                </div>

                {message && <p className="settings-message">{message}</p>}

                {savedVersion && (
                    <div className="settings-footer">
                        <p>Current App Version: <strong>{savedVersion}</strong></p>
                    </div>
                )}

                <SuccessModal
                    isVisible={successModal.isVisible}
                    message={successModal.message}
                    onClose={closeSuccessModal}
                />
            </section>

            {/* 🗂 Order Places Section */}
            <section className="order-dashboard">
                <h2 className="title">Manage Places Order</h2>
                <p className="subtitle">Drag and drop places to reorder them.</p>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="places">
                        {(provided) => (
                            <table {...provided.droppableProps} ref={provided.innerRef} className="order-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name (AR)</th>
                                        <th>Name (EN)</th>
                                        <th>Active</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {places.map((place, index) => (
                                        <Draggable key={place.id} draggableId={place.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={snapshot.isDragging ? "dragging" : ""}
                                                >
                                                    <td>
                                                        <img
                                                            src={`/images/${place.image}`}
                                                            alt={place.nameEn}
                                                            className="place-img"
                                                        />
                                                    </td>
                                                    <td>{place.name}</td>
                                                    <td>{place.nameEn}</td>
                                                    <td>{place.active ? "Yes" : "No"}</td>
                                                    <td>{place.createdAt}</td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </section>
        </div>
    );
};

export default SettingsDashboard;
