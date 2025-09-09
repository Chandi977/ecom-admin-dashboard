import React, { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { handleGetRequest } from "../services/GetTemplate";

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        categories: 0,
        brands: 0,
        subcategories: 0,
        placedCount: 0,
        paymentDoneCount: 0,
        paymentVerifiedCount: 0,
        dispatchedCount: 0,
        deliveredCount: 0,
        totalOrders: 0,
        products: 0,
    });
    const [dataset, setDataSet] = useState([]);

    const getData = async () => {
        // const users = await handleGetRequest("/countUsers");
        // const orders = await handleGetRequest("/ordersCount");
        const categories = await handleGetRequest("/category/count");
        const brands = await handleGetRequest("/brand/count");
        const subCategories = await handleGetRequest("/subcategory/count");
        const countUser = await handleGetRequest("/countUsers");
        const countOrder = await handleGetRequest("/order/count");
        const sts = await handleGetRequest("/userStats");
        const products = await handleGetRequest("/product/count");
        setDataSet(sts?.data?.["2024"]);
        setStats({
            users: countUser?.data,
            totalOrders: countOrder?.data,
            categories: categories?.data,
            subcategories: subCategories?.data,
            brands: brands?.data,
            // login: login?.data,
            products: products?.data,
        });
        setBasicData({
            labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            datasets: [
                {
                    label: "Users",
                    data: sts?.data,
                    fill: false,
                    backgroundColor: ["rgba(54, 162, 235, 0.2)"],
                    borderColor: "#000",
                    tension: 0.4,
                },
            ],
        });
    };

    useEffect(() => {
        getData();
    }, []);

    console.log(dataset);
    const [basicData, setBasicData] = useState({
        labels: ["Jan", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [
            {
                label: "Users",
                data: dataset,
                fill: false,
                backgroundColor: ["rgba(54, 162, 235, 0.2)"],
                borderColor: "#000",
                tension: 0.4,
            },
        ],
    });

    console.log("Stats:", stats);

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Make the API call
                const response = await handleGetRequest("/order/count/status");

                // Assuming response.data contains the necessary information
                const stats = response.data;
                console.log("92", stats);

                const data = {
                    labels: ["Placed", "Payment Done", "Payment Verified", "Dispatched", "Delivered"],
                    datasets: [
                        {
                            data: [stats.placedCount, stats.paymentDoneCount, stats.paymentVerifiedCount, stats.dispatchedCount, stats.deliveredCount],
                            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                        },
                    ],
                };
                const options = {
                    cutout: "60%",
                };

                console.log("Data from API:", data);
                setChartData(data);
                setChartOptions(options);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // Call the fetchData function when the component mounts
    }, []);

    const getLightTheme = () => {
        let basicOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: "#212529",
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#495057",
                    },
                    grid: {
                        color: "#ebedef",
                    },
                },
            },
        };

        let multiAxisOptions = {
            stacked: false,
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: "#212529",
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#212529",
                    },
                    grid: {
                        color: "#212529",
                    },
                },
            },
        };

        return {
            basicOptions,
            multiAxisOptions,
        };
    };

    const { basicOptions, multiAxisOptions } = getLightTheme();
    return (
        <>
            <div className="dashboard-cards" style={{ display: "flex", gap: "24px", marginBottom: "32px", marginTop: "16px", flexWrap: "wrap" }}>
                {/* Total Orders Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: "220px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "1.15rem", color: "#222" }}>Total Orders</span>
                        <span
                            style={{ position: "relative", cursor: "pointer" }}
                            onMouseEnter={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "block";
                            }}
                            onMouseLeave={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "none";
                            }}
                        >
                            <i className="pi pi-info-circle" style={{ color: "#ff6b6b", fontSize: "1.3rem" }}></i>
                            <span className="tooltip" style={{ display: "none", position: "absolute", top: "28px", left: "-20px", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>
                                Total orders placed
                            </span>
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "18px" }}>
                        <div style={{ position: "relative", width: 64, height: 64, marginRight: "18px" }}>
                            <svg width="64" height="64">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f3f3" strokeWidth="8" />
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#ff6b6b" strokeWidth="8" strokeDasharray="175.84" strokeDashoffset="60" style={{ transition: "stroke-dashoffset 0.5s" }} />
                            </svg>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#222" }}>{stats?.totalOrders}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "2rem", color: "#222" }}>{stats?.totalOrders}</div>
                            <div style={{ color: "#b0b3bb", fontSize: "1rem" }}>Since launch</div>
                        </div>
                    </div>
                </div>
                {/* Repeat Purchase Rate Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: "220px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "1.15rem", color: "#222" }}>Repeat Purchase Rate</span>
                        <span
                            style={{ position: "relative", cursor: "pointer" }}
                            onMouseEnter={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "block";
                            }}
                            onMouseLeave={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "none";
                            }}
                        >
                            <i className="pi pi-info-circle" style={{ color: "#22c55e", fontSize: "1.3rem" }}></i>
                            <span className="tooltip" style={{ display: "none", position: "absolute", top: "28px", left: "-20px", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>
                                Repeat Purchase Rate (calculated every 6 months)
                            </span>
                        </span>
                    </div>
                    <div style={{ marginTop: "18px" }}>
                        <span style={{ background: "#22c55e", color: "#fff", fontWeight: 600, borderRadius: "16px", padding: "4px 14px", fontSize: "1rem", marginRight: "8px" }}>
                            12.6% <span style={{ fontSize: "0.9em" }}>↑</span>
                        </span>
                        <div style={{ fontWeight: 700, fontSize: "2rem", color: "#222", marginTop: "8px" }}>{stats?.revenue ? `$${stats.revenue}` : "8.7%"}</div>
                        <div style={{ color: "#b0b3bb", fontSize: "1rem" }}>In Last 6 Month</div>
                        <div style={{ width: "100%", height: "7px", background: "#eafbe7", borderRadius: "6px", marginTop: "14px" }}>
                            <div style={{ width: "32%", height: "100%", background: "#22c55e", borderRadius: "6px" }}></div>
                        </div>
                    </div>
                </div>
                {/* Total User Accounts Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: "220px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "1.15rem", color: "#222" }}>Total User Accounts</span>
                        <span
                            style={{ position: "relative", cursor: "pointer" }}
                            onMouseEnter={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "block";
                            }}
                            onMouseLeave={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "none";
                            }}
                        >
                            <i className="pi pi-info-circle" style={{ color: "#facc15", fontSize: "1.3rem" }}></i>
                            <span className="tooltip" style={{ display: "none", position: "absolute", top: "28px", left: "-20px", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>
                                New users registered
                            </span>
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "18px" }}>
                        <div style={{ position: "relative", width: 64, height: 64, marginRight: "18px" }}>
                            <svg width="64" height="64">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f3f3" strokeWidth="8" />
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#facc15" strokeWidth="8" strokeDasharray="175.84" strokeDashoffset="44" style={{ transition: "stroke-dashoffset 0.5s" }} />
                            </svg>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#222" }}>{stats?.users}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "2rem", color: "#222" }}>{stats?.users}</div>
                            <div style={{ color: "#b0b3bb", fontSize: "1rem" }}>Since launch</div>
                        </div>
                    </div>
                </div>
                {/* Delivery Time Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: "220px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "1.15rem", color: "#222" }}>Average Delivery Time</span>
                        <span
                            style={{ position: "relative", cursor: "pointer" }}
                            onMouseEnter={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "block";
                            }}
                            onMouseLeave={(e) => {
                                const tip = e.currentTarget.querySelector(".tooltip");
                                tip.style.display = "none";
                            }}
                        >
                            <i className="pi pi-info-circle" style={{ color: "#38bdf8", fontSize: "1.3rem" }}></i>
                            <span className="tooltip" style={{ display: "none", position: "absolute", top: "28px", left: "-20px", background: "#222", color: "#fff", padding: "6px 14px", borderRadius: "7px", fontSize: "0.95rem", zIndex: 10 }}>
                                Average Delivery Time
                            </span>
                        </span>
                    </div>
                    <div style={{ marginTop: "18px" }}>
                        {/* <span style={{ background: "#38bdf8", color: "#fff", fontWeight: 600, borderRadius: "16px", padding: "4px 14px", fontSize: "1rem", marginRight: "8px" }}>
                            5.7% <span style={{ fontSize: "0.9em" }}>↘</span>
                        </span> */}
                        <div style={{ fontWeight: 700, fontSize: "2rem", color: "#222", marginTop: "8px" }}>{stats?.satisfaction ? `${stats.satisfaction}%` : "3 Days"}</div>
                        {/* <div style={{ color: "#b0b3bb", fontSize: "1rem" }}>Since last month</div> */}
                        <div style={{ width: "100%", height: "7px", background: "#eaf6fb", borderRadius: "6px", marginTop: "14px" }}>
                            <div style={{ width: "94%", height: "100%", background: "#38bdf8", borderRadius: "6px" }}></div>
                        </div>
                    </div>
                </div>
                {/* Brands Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "220px", marginBottom: "18px" }}>
                    <i className="pi pi-circle" style={{ fontSize: "2.2rem", color: "#36A2EB", marginBottom: "10px" }} />
                    <span style={{ fontWeight: 600, fontSize: "1.08rem", color: "#222" }}>Total Available Brands</span>
                    <span style={{ fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" }}>{stats?.brands}</span>
                </div>
                {/* Categories Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "220px", marginBottom: "18px" }}>
                    <i className="pi pi-circle" style={{ fontSize: "2.2rem", color: "#FFCE56", marginBottom: "10px" }} />
                    <span style={{ fontWeight: 600, fontSize: "1.08rem", color: "#222" }}>Total Available Categories</span>
                    <span style={{ fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" }}>{stats?.categories}</span>
                </div>
                {/* Sub-categories Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "220px", marginBottom: "18px" }}>
                    <i className="pi pi-car" style={{ fontSize: "2.2rem", color: "#4BC0C0", marginBottom: "10px" }} />
                    <span style={{ fontWeight: 600, fontSize: "1.08rem", color: "#222" }}>Total Available Sub-categories</span>
                    <span style={{ fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" }}>{stats?.subcategories}</span>
                </div>
                {/* Products Card */}
                <div className="dashboard-card" style={{ flex: 1, background: "#fff", borderRadius: "14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "220px", marginBottom: "18px" }}>
                    <i className="pi pi-box" style={{ fontSize: "2.2rem", color: "#9966FF", marginBottom: "10px" }} />
                    <span style={{ fontWeight: 600, fontSize: "1.08rem", color: "#222" }}>Total Listed Products</span>
                    <span style={{ fontWeight: 700, fontSize: "1.7rem", color: "#222", marginTop: "8px" }}>{stats?.products}</span>
                </div>
            </div>

            <div className="container-fluid mt-5">
                <div className="row">
                    <div className="col-md-12">
                        <h3 style={{ textAlign: "center" }}>Monthly New Users</h3>
                        <Chart type="bar" data={basicData} options={basicOptions} />
                    </div>
                </div>
            </div>

            {/* <div className="graphs_section">
                <div className="left_" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h5>Order Status</h5>
                    <Chart type="pie" data={chartData} options={chartOptions} className="w-100rem" />
                </div>

                <div className="right">
                    <h5 style={{ textAlign: "center" }}>Monthly users registered</h5>
                    <Chart type="bar" data={basicData} options={basicOptions} />
                </div>
            </div> */}
        </>
    );
};

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname && prevProps.colorMode === nextProps.colorMode;
};

export default React.memo(Dashboard, comparisonFn);
