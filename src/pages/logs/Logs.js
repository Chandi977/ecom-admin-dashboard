import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useHistory, useLocation } from "react-router-dom";
import moment from "moment";
import { handleGetRequest } from "../../services/GetTemplate";

const ADMIN_ACTIVITY_ROLES = "admin,catalog-manager";

const METHOD_OPTIONS = [
    { label: "All write methods", value: "" },
    { label: "POST", value: "POST" },
    { label: "PUT", value: "PUT" },
    { label: "PATCH", value: "PATCH" },
    { label: "DELETE", value: "DELETE" },
    { label: "GET", value: "GET" },
];

const ROLE_OPTIONS = [
    { label: "Admin staff", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Catalog Manager", value: "catalog-manager" },
];

const STATUS_OPTIONS = [
    { label: "All statuses", value: "" },
    { label: "Success", value: "success" },
    { label: "Errors", value: "error" },
    { label: "200", value: "200" },
    { label: "201", value: "201" },
    { label: "400", value: "400" },
    { label: "401", value: "401" },
    { label: "403", value: "403" },
    { label: "500", value: "500" },
];

const statusSeverity = (statusCode) => {
    if (statusCode >= 500) return "danger";
    if (statusCode >= 400) return "warning";
    return "success";
};

const methodSeverity = (method) => {
    if (method === "DELETE") return "danger";
    if (method === "POST") return "success";
    if (method === "PUT" || method === "PATCH") return "warning";
    return "info";
};

function Logs() {
    const breadItems = [{ label: "Home" }, { label: "Activity Logs" }];
    const home = { icon: "pi pi-home", url: "/" };
    const history = useHistory();
    const location = useLocation();

    const queryFilters = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            userId: params.get("userId") || "",
            userName: params.get("userName") || "",
            role: params.get("role") || "",
        };
    }, [location.search]);

    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rows, setRows] = useState(20);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        userId: queryFilters.userId,
        userName: queryFilters.userName,
        role: queryFilters.role,
        method: "",
        status: "",
        writes: true,
    });

    useEffect(() => {
        setSkip(0);
        setFilters((current) => ({
            ...current,
            userId: queryFilters.userId,
            userName: queryFilters.userName,
            role: queryFilters.role,
        }));
    }, [queryFilters]);

    const getData = useCallback(async () => {
        const params = {
            skip,
            limit: rows,
        };

        if (filters.userId) params.userId = filters.userId;
        if (filters.userName.trim()) params.userName = filters.userName.trim();
        if (filters.role) {
            params.role = filters.role;
        } else {
            params.roles = ADMIN_ACTIVITY_ROLES;
        }
        if (filters.method) params.method = filters.method;
        if (filters.status === "success") params.success = "true";
        if (filters.status === "error") params.success = "false";
        if (filters.status && !["success", "error"].includes(filters.status)) params.status = filters.status;
        if (filters.writes) params.writes = "true";

        setLoading(true);
        const result = await handleGetRequest("/activity/logs", params);
        setLogs(result?.data?.items || []);
        setTotal(result?.data?.total || 0);
        setLoading(false);
    }, [filters, rows, skip]);

    useEffect(() => {
        getData();
    }, [getData]);

    const updateFilter = (key, value) => {
        setSkip(0);
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const clearFocusedUser = () => {
        history.replace("/logs");
        setSkip(0);
        setFilters((current) => ({ ...current, userId: "", userName: "", role: "" }));
    };

    const onPageChange = useCallback((event) => {
        setSkip(event.first);
        setRows(event.rows);
    }, []);

    const userTemplate = (rowData) => {
        const label = rowData?.userName || (rowData?.userId ? rowData.userId.substring(0, 8) : "-");
        return (
            <div>
                <div style={{ fontWeight: 600 }}>{label}</div>
                {rowData?.userRole ? <Tag value={rowData.userRole} style={{ fontSize: "0.7rem" }} /> : null}
            </div>
        );
    };

    const whenTemplate = (rowData) => (
        <div style={{ whiteSpace: "nowrap" }}>
            <div>{moment(rowData?.createdAt).format("DD-MM-YYYY")}</div>
            <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>{moment(rowData?.createdAt).format("hh:mm:ss A")}</div>
        </div>
    );

    const methodTemplate = (rowData) => (
        <Tag severity={methodSeverity(rowData?.method)} value={rowData?.method || "-"} style={{ fontFamily: "monospace", fontSize: "0.72rem" }} />
    );

    const actionTemplate = (rowData) => <span style={{ fontWeight: 600 }}>{rowData?.action || rowData?.method || "-"}</span>;

    const detailsTemplate = (rowData) => {
        if (rowData?.detail) return <span>{rowData.detail}</span>;
        if (rowData?.resourceId) return <span style={{ color: "#6b7280" }}>ID: {String(rowData.resourceId).substring(0, 32)}</span>;
        return <span style={{ color: "#9ca3af" }}>-</span>;
    };

    const routeTemplate = (rowData) => (
        <span style={{ color: "#4b5563", fontFamily: "monospace", fontSize: "0.82rem" }}>{rowData?.route || rowData?.path || "-"}</span>
    );

    const statusTemplate = (rowData) => <Tag severity={statusSeverity(rowData?.statusCode)} value={rowData?.statusCode || "-"} />;

    return (
        <>
            <div className="Page__Header">
                <div>
                    <h2>Activity Logs</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
                {(filters.userId || queryFilters.userName) && (
                    <div className="Top__Btn">
                        <Button label="Show All Staff Logs" icon="pi pi-filter-slash" onClick={clearFocusedUser} className="Btn__DarkAdd" style={{ width: "220px" }} />
                    </div>
                )}
            </div>

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="grid" style={{ alignItems: "center", marginBottom: 10 }}>
                            <div className="col-12 md:col-3">
                                <span className="p-input-icon-left" style={{ width: "100%" }}>
                                    <i className="pi pi-user" />
                                    <InputText
                                        value={filters.userName}
                                        onChange={(e) => updateFilter("userName", e.target.value)}
                                        placeholder="Search staff name"
                                        style={{ width: "100%" }}
                                    />
                                </span>
                            </div>
                            <div className="col-12 md:col-2">
                                <Dropdown
                                    value={filters.role}
                                    options={ROLE_OPTIONS}
                                    onChange={(e) => updateFilter("role", e.value)}
                                    placeholder="Role"
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <Dropdown
                                    value={filters.method}
                                    options={METHOD_OPTIONS}
                                    onChange={(e) => updateFilter("method", e.value)}
                                    placeholder="Method"
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="col-12 md:col-2">
                                <Dropdown
                                    value={filters.status}
                                    options={STATUS_OPTIONS}
                                    onChange={(e) => updateFilter("status", e.value)}
                                    placeholder="Status"
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="col-12 md:col-3" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Checkbox inputId="writesOnlyLogs" checked={filters.writes} onChange={(e) => updateFilter("writes", e.checked)} />
                                <label htmlFor="writesOnlyLogs">Changes only</label>
                            </div>
                        </div>

                        <DataTable
                            className="datatable-responsive"
                            lazy
                            loading={loading}
                            paginator
                            first={skip}
                            rows={rows}
                            rowsPerPageOptions={[20, 50, 100]}
                            totalRecords={total}
                            onPage={onPageChange}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No activity logs found."
                            responsiveLayout="scroll"
                            value={logs}
                        >
                            <Column header="When" body={whenTemplate} style={{ minWidth: "150px" }} />
                            <Column header="Who" body={userTemplate} style={{ minWidth: "180px" }} />
                            <Column header="Method" body={methodTemplate} style={{ width: "100px" }} />
                            <Column header="Action" body={actionTemplate} style={{ minWidth: "170px" }} />
                            <Column header="Details" body={detailsTemplate} style={{ minWidth: "260px" }} />
                            <Column header="Route" body={routeTemplate} style={{ minWidth: "220px" }} />
                            <Column header="Status" body={statusTemplate} style={{ width: "90px" }} />
                            <Column header="Time" body={(rowData) => `${Math.round(rowData?.durationMs || 0)} ms`} style={{ width: "90px" }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Logs;
