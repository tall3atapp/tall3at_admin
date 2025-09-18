import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faList, faIdCard } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import "./PhoneSimulator.css";

const PhoneSimulator = () => {
    const [screen, setScreen] = useState("login"); // login | dashboard | bookings | bookingDetails
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ userName: "", password: "" });
    const [user, setUser] = useState(null);

    // 🔹 LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("UserName", credentials.userName);
            formData.append("Password", credentials.password || "0000"); // 👈 default OTP

            const res = await api.post("/user-login", formData);

            if (res.data?.token) {
                localStorage.setItem("userToken", res.data.token);
                localStorage.setItem("userId", res.data.user?.id);

                setUser(res.data.user);
                setScreen("dashboard");
            } else {
                alert("فشل تسجيل الدخول");
            }
        } catch (err) {
            console.error(err);
            alert("خطأ في تسجيل الدخول");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 FETCH BOOKINGS
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/app/bookings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            });
            setBookings(res.data || []);
            setScreen("bookings");
        } catch (err) {
            console.error(err);
            alert("فشل تحميل الحجوزات");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userId");
        setUser(null);
        setScreen("login");
    };

    return (
        <div className="phone-simulator">
            <div className="phone-frame">
                <div className="phone-header">📱 Tall3at App</div>
                <div className="phone-content">
                    {/* 🔹 LOGIN SCREEN */}
                    {screen === "login" && (
                        <form className="login-form" onSubmit={handleLogin}>
                            <h3>تسجيل الدخول</h3>
                            <input
                                type="text"
                                placeholder="اسم المستخدم / الهاتف"
                                value={credentials.userName}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, userName: e.target.value })
                                }
                            />
                            <input
                                type="password"
                                placeholder="كلمة المرور / OTP (افتراضي: 0000)"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, password: e.target.value })
                                }
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? "..." : "دخول"}
                            </button>
                        </form>
                    )}

                    {/* 🔹 DASHBOARD SCREEN */}
                    {screen === "dashboard" && (
                        <div className="dashboard">
                            <h3>مرحباً {user?.fullName}</h3>
                            <button onClick={fetchBookings}>
                                <FontAwesomeIcon icon={faList} /> مشاهدة الحجوزات
                            </button>
                            <button onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} /> خروج
                            </button>
                        </div>
                    )}

                    {/* 🔹 BOOKINGS LIST */}
                    {screen === "bookings" && (
                        <div className="bookings-list">
                            <h3>الحجوزات</h3>
                            {bookings.length === 0 ? (
                                <p>لا توجد حجوزات</p>
                            ) : (
                                bookings.map((b) => (
                                    <div
                                        key={b.id}
                                        className="booking-item"
                                        onClick={() => {
                                            setSelectedBooking(b);
                                            setScreen("bookingDetails");
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faIdCard} /> حجز #{b.id} -{" "}
                                        {b.tripTitle || b.trip?.title}
                                    </div>
                                ))
                            )}
                            <button onClick={() => setScreen("dashboard")}>رجوع</button>
                        </div>
                    )}

                    {/* 🔹 BOOKING DETAILS */}
                    {screen === "bookingDetails" && selectedBooking && (
                        <div className="booking-details-phone">
                            <h3>تفاصيل الحجز</h3>
                            <p>
                                <strong>رقم الحجز:</strong> #{selectedBooking.id}
                            </p>
                            <p>
                                <strong>الرحلة:</strong>{" "}
                                {selectedBooking.tripTitle || selectedBooking.trip?.title}
                            </p>
                            <p>
                                <strong>عدد الأشخاص:</strong> {selectedBooking.persons}
                            </p>
                            <p>
                                <strong>التكلفة:</strong> {selectedBooking.totalCost} ريال
                            </p>
                            <p>
                                <strong>الحالة:</strong> {selectedBooking.status}
                            </p>
                            <button onClick={() => setScreen("bookings")}>رجوع</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhoneSimulator;
