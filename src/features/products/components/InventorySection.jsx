import React from "react";
import { FormInputNumber, FormInputText } from "../../../components/FormControls";

export const InventorySection = () => {
    return (
        <div className="p-fluid p-formgrid grid">
            <FormInputNumber
                name="inventory.availableStock"
                label="Available Stock"
                placeholder="e.g. 500"
                min={0}
                required
            />
            
            <FormInputNumber
                name="inventory.reservedStock"
                label="Reserved Stock"
                placeholder="e.g. 0"
                min={0}
                description="Stock committed to active orders but not yet shipped"
            />

            <FormInputNumber
                name="inventory.minimumStock"
                label="Minimum Stock (Reorder Point)"
                placeholder="e.g. 50"
                min={0}
                description="Trigger low stock alerts when available stock drops below this number"
            />

            <FormInputText
                name="inventory.warehouse"
                label="Warehouse Location"
                placeholder="e.g. Aisle 4, Shelf B"
            />
        </div>
    );
};
