import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { FormInputNumber, FormInputText } from "../../../components/FormControls";

export const InventorySection = () => {
    const { watch, setValue } = useFormContext();
    const priceList = watch("pricing.priceList");

    // Available Stock is a derived rollup, not a separately-entered number: the
    // per-tier "Stock Quantity" (pricing.priceList[].stockQuantity) is the source
    // of truth that orders actually decrement. We sum the tiers and keep the form
    // value in sync so the submitted payload carries the correct total instead of
    // a hand-typed duplicate that drifts out of date after the first sale.
    const availableStock = useMemo(
        () =>
            (Array.isArray(priceList) ? priceList : []).reduce(
                (sum, tier) => sum + (Number(tier?.stockQuantity) || 0),
                0,
            ),
        [priceList],
    );

    useEffect(() => {
        // shouldDirty:false so this derived sync never triggers a false "unsaved
        // changes" prompt — the real edit is the tier field the user changed.
        setValue("inventory.availableStock", availableStock, { shouldDirty: false });
    }, [availableStock, setValue]);

    return (
        <div className="p-fluid p-formgrid grid">
            <div className="p-field col-12 md:col-6" style={{ marginBottom: "1rem" }}>
                <label
                    htmlFor="inventory.availableStock.display"
                    className="Label__Text"
                    style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
                >
                    Available Stock
                </label>
                <InputText
                    id="inventory.availableStock.display"
                    type="number"
                    value={availableStock}
                    disabled
                    readOnly
                    className="Input__Round"
                    style={{
                        width: "100%",
                        height: "38px",
                        borderRadius: "6px",
                        background: "#f1f3f5",
                    }}
                />
                <small
                    className="p-text-secondary"
                    style={{ display: "block", marginTop: "0.25rem" }}
                >
                    Auto-calculated from the total Stock Quantity of all pricing tiers (Section 3)
                </small>
            </div>

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
