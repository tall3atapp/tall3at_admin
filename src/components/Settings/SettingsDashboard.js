import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSync } from "@fortawesome/free-solid-svg-icons";
import "./SettingsDashboard.css";
import SuccessModal from "../SuccessModal";

const SettingsDashboard = () => {
    const [appVersion, setAppVersion] = useState("");
    const [isOnReview, setIsOnReview] = useState("NO");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [savedVersion, setSavedVersion] = useState(""); // ✅ footer ke liye
    const [successModal, setSuccessModal] = useState({
        isVisible: false,
        message: ""
    });

    const showSuccessMessage = (msg) => {
        setSuccessModal({ isVisible: true, message: msg });
    };

    const closeSuccessModal = () => {
        setSuccessModal({ isVisible: false, message: "" });
    };

    // 🚀 Fetch current configs from backend
    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/AppConfig");
            if (Array.isArray(res.data)) {
                const versionConfig = res.data.find((c) => c.key === "AppVersion");
                const reviewConfig = res.data.find((c) => c.key === "IsAppOnReview");

                if (versionConfig && versionConfig.value !== undefined) {
                    setAppVersion(versionConfig.value.toString());
                    setSavedVersion(versionConfig.value.toString()); // ✅ footer update

                }
                if (reviewConfig) {
                    setIsOnReview(reviewConfig.value);
                }
            }
        } catch (err) {
            console.error("Error fetching configs:", err);
            setMessage("Error fetching configs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    // 🚀 Update review + version
    const handleUpdate = async () => {
        try {
            setLoading(true);
            setMessage("");

            const payload = {
                appVersion,
                reviewStatus: isOnReview,
            };

            const res = await api.put("/api/AppConfig/update-review", payload);

            // setMessage(res.data.message || "Updated successfully ✅");

            // ✅ after update, update screen version
            if (res.data.version) {
                setSavedVersion(res.data.version.toString());
            }
                        showSuccessMessage("App settings updated successfully");

        } catch (err) {
            console.error("Error updating config:", err);
            setMessage("Error updating config");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-dashboard">
            {/* Header with version badge */}
            <div className="settings-header">
                <h2>Settings Dashboard</h2>
                {appVersion && <span className="version-badge">v{appVersion}</span>}
            </div>

            {loading && <p>Loading...</p>}

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
                <select
                    value={isOnReview}
                    onChange={(e) => setIsOnReview(e.target.value)}
                >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                </select>
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

            {/* Footer App Version */}
            {savedVersion && (
                <div className="settings-footer">
                    <p>Current App Version: <strong>{savedVersion}</strong></p>
                </div>
            )}


            {/* ✅ Success Modal */}
            <SuccessModal
                isVisible={successModal.isVisible}
                message={successModal.message}
                onClose={closeSuccessModal}
            />
        </div>
    );
};

export default SettingsDashboard;
