import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import moment from "moment";
import { handleGetRequest } from "../../services/GetTemplate";

const WINDOW_OPTIONS = [
    { label: "Last 24 hours", value: 1 },
    { label: "Last 7 days", value: 7 },
    { label: "Last 30 days", value: 30 },
];

const fmtMs = (ms) => (ms == null ? "-" : `${Math.round(ms)} ms`);
const pct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;

function StatCard({ label, value, sub, color }) {
    return (
        <div className="col-12 md:col-3">
            <div className="card" style={{ borderLeft: `5px solid ${color || "#1976d2"}` }}>
                <div style={{ color: "#888", fontSize: "0.9rem" }}>{label}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{value}</div>
                {sub ? <div style={{ color: "#b0b3bb", fontSize: "0.85rem" }}>{sub}</div> : null}
            </div>
        </div>
    );
}

function Observability() {
    const [days, setDays] = useState(7);
    const [summary, setSummary] = useState(null);

    const load = useCallback(async () => {
        const from = moment().subtract(days, "days").toISOString();
        const res = await handleGetRequest("/activity/summary", { from });
        setSummary(res?.data || null);
    }, [days]);

    useEffect(() => {
        load();
    }, [load]);

    const overall = summary?.overall || {};
    const topEndpoints = summary?.topEndpoints || [];

    const timeChart = useMemo(() => {
        const rows = summary?.callsOverTime || [];
        return {
            data: {
                labels: rows.map((r) => r._id),
                datasets: [
                    { label: "Calls", data: rows.map((r) => r.calls), borderColor: "#1976d2", tension: 0.3, fill: false },
                    { label: "Errors", data: rows.map((r) => r.errorCount), borderColor: "#e53935", tension: 0.3, fill: false },
                ],
            },
            options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
        };
    }, [summary]);

    const endpointChart = useMemo(() => {
        const rows = topEndpoints.slice(0, 10);
        return {
            data: {
                labels: rows.map((r) => `${r._id.method} ${r._id.route}`),
                datasets: [{ label: "Calls", data: rows.map((r) => r.calls), backgroundColor: "#42a5f5" }],
            },
            options: { indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false } } },
        };
    }, [topEndpoints]);

    const statusChart = useMemo(() => {
        const rows = summary?.byStatusClass || [];
        const palette = { "2xx": "#66bb6a", "3xx": "#26c6da", "4xx": "#ffa726", "5xx": "#ef5350" };
        return {
            data: {
                labels: rows.map((r) => r._id),
                datasets: [{ data: rows.map((r) => r.calls), backgroundColor: rows.map((r) => palette[r._id] || "#9e9e9e") }],
            },
            options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
        };
    }, [summary]);

    const endpointError = (row) => <Tag severity={row.errorCount > 0 ? "danger" : "success"} value={`${row.errorCount} err`} />;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <Dropdown value={days} options={WINDOW_OPTIONS} onChange={(e) => setDays(e.value)} />
            </div>

            <div className="grid">
                <StatCard label="Total API Calls" value={overall.totalCalls ?? 0} color="#1976d2" />
                <StatCard label="Errors" value={overall.errorCount ?? 0} sub={`Error rate ${pct(overall.errorRate)}`} color="#e53935" />
                <StatCard label="Avg Latency" value={fmtMs(overall.avgDurationMs)} color="#43a047" />
                <StatCard label="Max Latency" value={fmtMs(overall.maxDurationMs)} color="#fb8c00" />
            </div>

            <div className="grid">
                <div className="col-12 md:col-8">
                    <div className="card">
                        <h5>Calls over time</h5>
                        <div style={{ height: 300 }}>
                            <Chart type="line" data={timeChart.data} options={timeChart.options} />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="card">
                        <h5>Status classes</h5>
                        <div style={{ height: 300 }}>
                            <Chart type="doughnut" data={statusChart.data} options={statusChart.options} />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card">
                        <h5>Top endpoints</h5>
                        <div style={{ height: 320 }}>
                            <Chart type="bar" data={endpointChart.data} options={endpointChart.options} />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card">
                        <h5>Endpoint detail</h5>
                        <DataTable value={topEndpoints} responsiveLayout="scroll" paginator rows={8}>
                            <Column header="Method" body={(r) => r._id.method} />
                            <Column header="Route" body={(r) => r._id.route} />
                            <Column header="Calls" field="calls" sortable />
                            <Column header="Avg" body={(r) => fmtMs(r.avgDurationMs)} />
                            <Column header="Errors" body={endpointError} />
                        </DataTable>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card">
                        <h5>Activity by role</h5>
                        <DataTable value={summary?.byRole || []} responsiveLayout="scroll" emptyMessage="No role activity.">
                            <Column header="Role" body={(r) => <Tag value={r._id || "unknown"} />} />
                            <Column header="Total calls" field="calls" sortable />
                            <Column header="Changes (writes)" field="writes" sortable />
                            <Column header="Errors" body={(r) => <Tag severity={r.errorCount > 0 ? "danger" : "success"} value={r.errorCount} />} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

const ROLE_FILTER_OPTIONS = [
    { label: "All roles", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Catalog Manager", value: "catalog-manager" },
    { label: "Customer", value: "user" },
];

function AuditTrail() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(20);
    // Default to writes-only so the trail answers "who changed what".
    const [filters, setFilters] = useState({ method: "", role: "", status: "", writes: true });

    const load = useCallback(async () => {
        const params = { skip, limit: rows };
        if (filters.writes) params.writes = "true";
        if (filters.method) params.method = filters.method;
        if (filters.role) params.role = filters.role;
        if (filters.status) params.status = filters.status;
        const res = await handleGetRequest("/activity/logs", params);
        setLogs(res?.data?.items || []);
        setTotal(res?.data?.total || 0);
    }, [skip, rows, filters]);

    useEffect(() => {
        load();
    }, [load]);

    const statusBody = (row) => (
        <Tag severity={row.statusCode >= 500 ? "danger" : row.statusCode >= 400 ? "warning" : "success"} value={row.statusCode} />
    );

    const userBody = (row) => (
        <div>
            <div style={{ fontWeight: 600 }}>{row.userName || (row.userId ? row.userId.substring(0, 8) : "—")}</div>
            {row.userRole ? <Tag value={row.userRole} style={{ fontSize: "0.7rem" }} /> : null}
        </div>
    );

    const methodTagBody = (row) => {
        const sev = row.method === "DELETE" ? "danger" : row.method === "POST" ? "success" : row.method === "PUT" || row.method === "PATCH" ? "warning" : "info";
        return <Tag severity={sev} value={row.method} style={{ fontSize: "0.7rem", fontFamily: "monospace" }} />;
    };

    const actionBody = (row) => {
        const verb = (row.action || "").split(" ")[0];
        const sev = verb === "Deleted" ? "danger" : verb === "Created" ? "success" : verb === "Updated" ? "warning" : "info";
        return row.action ? <Tag severity={sev} value={row.action} /> : <span>{row.method}</span>;
    };

    const detailBody = (row) => {
        if (row.detail) return <span style={{ fontSize: "0.9rem" }}>{row.detail}</span>;
        if (row.resourceId) return <span style={{ color: "#888", fontSize: "0.85rem" }}>ID: {row.resourceId.substring(0, 12)}…</span>;
        return <span style={{ color: "#999" }}>—</span>;
    };

    const routeBody = (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#666" }}>{row.method} {row.route || row.path}</span>
    );

    return (
        <div className="card">
            <div className="grid" style={{ marginBottom: 8, alignItems: "center" }}>
                <div className="col-6 md:col-3">
                    <Dropdown
                        value={filters.role}
                        onChange={(e) => { setSkip(0); setFilters((f) => ({ ...f, role: e.value })); }}
                        options={ROLE_FILTER_OPTIONS}
                        placeholder="Role"
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="col-6 md:col-3">
                    <Dropdown
                        value={filters.method}
                        onChange={(e) => { setSkip(0); setFilters((f) => ({ ...f, method: e.value })); }}
                        options={[{ label: "All methods", value: "" }, "GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (typeof m === "string" ? { label: m, value: m } : m))}
                        placeholder="Method"
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="col-6 md:col-3">
                    <Dropdown
                        value={filters.status}
                        onChange={(e) => { setSkip(0); setFilters((f) => ({ ...f, status: e.value })); }}
                        options={[{ label: "All statuses", value: "" }, { label: "200", value: "200" }, { label: "201", value: "201" }, { label: "401", value: "401" }, { label: "403", value: "403" }, { label: "500", value: "500" }]}
                        placeholder="Status"
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="col-6 md:col-3" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Checkbox inputId="writesOnly" checked={filters.writes} onChange={(e) => { setSkip(0); setFilters((f) => ({ ...f, writes: e.checked })); }} />
                    <label htmlFor="writesOnly">Changes only</label>
                </div>
            </div>
            <DataTable
                value={logs}
                lazy
                paginator
                first={skip}
                rows={rows}
                rowsPerPageOptions={[20, 50, 100]}
                totalRecords={total}
                onPage={(e) => { setSkip(e.first); setRows(e.rows); }}
                responsiveLayout="scroll"
                emptyMessage="No activity yet."
            >
                <Column header="When" body={(r) => moment(r.createdAt).format("DD/MM/YY HH:mm:ss")} style={{ whiteSpace: "nowrap" }} />
                <Column header="Who" body={userBody} />
                <Column header="Action" body={actionBody} />
                <Column header="Details" body={detailBody} />
                <Column header="Route" body={routeBody} />
                <Column header="Status" body={statusBody} style={{ width: 80 }} />
            </DataTable>
        </div>
    );
}

export default function Analytics() {
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Analytics" }];
    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Analytics</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <TabView>
                <TabPanel header="API Observability">
                    <Observability />
                </TabPanel>
                <TabPanel header="Audit Trail">
                    <AuditTrail />
                </TabPanel>
            </TabView>
        </>
    );
}
