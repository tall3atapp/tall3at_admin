import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import "./OrderDashboard.css";

// Dummy data
const initialPlaces = [
    { id: "3", image: "dammam.jpg", name: "أبها", nameEn: "Dammam", active: 1, createdAt: "2025-04-11 09:54:09" },
    { id: "17", image: "jubail.jpg", name: "الجبيل", nameEn: "Jubail", active: 1, createdAt: "2025-04-11 09:54:09" },
    { id: "37", image: "al_khobar.jpg", name: "الخبر و الدمام", nameEn: "Al-Khobar", active: 1, createdAt: "2025-04-11 09:54:09" },
    { id: "55", image: "hail.jpg", name: "حائل", nameEn: "Hail", active: 1, createdAt: "2025-04-11 09:54:09" },
    { id: "56", image: "taif.jpeg", name: "الطائف", nameEn: "Taif", active: 1, createdAt: "2025-04-11 09:54:09" },
];

const OrderDashboard = () => {
    const [places, setPlaces] = useState(initialPlaces);

    // Reorder helper
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    // On drag end
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
    };

    return (
        <div className="order-dashboard">
            <h1 className="title">Manage Places Order</h1>
            <p className="subtitle">Drag and drop places to reorder them.</p>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="places">
                    {(provided) => (
                        <table
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="order-table"
                        >
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
                                    <Draggable key={place.id} draggableId={place.id} index={index}>
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
        </div>
    );
};

export default OrderDashboard;
