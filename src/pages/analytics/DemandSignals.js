import React, { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { handleGetRequest } from "../../services/GetTemplate";

const WINDOW_OPTIONS = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
];

export default function DemandSignals() {
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Demand Signals" }];
    const [days, setDays] = useState(30);
    const [data, setData] = useState({ topSearches: [], zeroResultSearches: [], topViewedProducts: [], trendingCategories: [] });

    const load = useCallback(async () => {
        const res = await handleGetRequest("/demand/signals", { days });
        if (res?.data) setData(res.data);
    }, [days]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Demand Signals</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                <div className="Top__Btn">
                    <Dropdown value={days} options={WINDOW_OPTIONS} onChange={(e) => setDays(e.value)} style={{ minWidth: "160px" }} />
                </div>
            </div>

            <p style={{ color: "#888", marginTop: "12px", marginBottom: "16px" }}>
                What customers are looking for. Use zero-result searches and most-viewed products to decide what to stock or feature.
            </p>

            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card" style={{ height: "100%" }}>
                        <h5>Unmet demand — zero-result searches</h5>
                        <DataTable value={data.zeroResultSearches} responsiveLayout="scroll" paginator rows={10} emptyMessage="No zero-result searches.">
                            <Column header="Search term" field="_id" />
                            <Column header="Times searched" body={(r) => <Tag severity="danger" value={r.searches} />} sortable sortField="searches" />
                        </DataTable>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card" style={{ height: "100%" }}>
                        <h5>Top searches</h5>
                        <DataTable value={data.topSearches} responsiveLayout="scroll" paginator rows={10} emptyMessage="No searches yet.">
                            <Column header="Search term" field="_id" />
                            <Column header="Searches" field="searches" sortable />
                            <Column header="Avg results" body={(r) => Math.round(r.avgResults || 0)} />
                        </DataTable>
                    </div>
                </div>
                <div className="col-12 md:col-7">
                    <div className="card" style={{ height: "100%" }}>
                        <h5>Most viewed products</h5>
                        <DataTable value={data.topViewedProducts} responsiveLayout="scroll" paginator rows={10} emptyMessage="No product views yet.">
                            <Column header="Product" body={(r) => r.productName || r._id} />
                            <Column header="Category" field="category" />
                            <Column header="Views" field="views" sortable />
                        </DataTable>
                    </div>
                </div>
                <div className="col-12 md:col-5">
                    <div className="card" style={{ height: "100%" }}>
                        <h5>Trending categories</h5>
                        <DataTable value={data.trendingCategories} responsiveLayout="scroll" paginator rows={10} emptyMessage="No category views yet.">
                            <Column header="Category" field="_id" />
                            <Column header="Views" field="views" sortable />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}
