import React from "react";
import { Checkbox } from "primereact/checkbox";
import { isFieldVisible } from "../utils/fieldVisibility";

// Presentational checkbox grid shared by the product (spec rows) and category
// (common fields) editors. `groups` is an array of
// { title, description?, items: [{ key, label }] }; `value` is the current
// visibility map; `onToggle(key, checked)` reports a change.
export const FieldVisibilityGrid = ({ groups, value, onToggle }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {groups.map((group) => (
            <div
                key={group.title}
                style={{
                    background: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                }}
            >
                <h5 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 0.25rem" }}>{group.title}</h5>
                {group.description && (
                    <p style={{ margin: "0 0 0.75rem", fontSize: "11px", color: "#6c757d" }}>{group.description}</p>
                )}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "0.5rem 1.5rem",
                    }}
                >
                    {group.items.map((item) => {
                        const checked = isFieldVisible(value, item.key);
                        return (
                            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Checkbox
                                    inputId={`fv-${item.key}`}
                                    checked={checked}
                                    onChange={(e) => onToggle(item.key, e.checked)}
                                />
                                <label
                                    htmlFor={`fv-${item.key}`}
                                    style={{ fontSize: "13px", cursor: "pointer", color: checked ? "#212529" : "#adb5bd" }}
                                >
                                    {item.label}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);

export default FieldVisibilityGrid;
