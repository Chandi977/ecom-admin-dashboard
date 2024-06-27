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
        setDataSet(sts?.data?.['2024']);
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
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
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
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
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
                console.log("92", stats)

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
                console.error('Error fetching data:', error);
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
            <div className="grid_view">
                <div className="card1">
                    <i className="pi pi-user home_icon" />
                    <p>users</p>
                    <p>{stats?.users}</p>
                </div>
                {/* <div className="card2">
                    <i className="pi pi-history home_icon" />
                    <p>login history</p>
                    <p>{stats?.login}</p>
                </div> */}
                <div className="card2">
                    <i className="pi pi-circle home_icon" />
                    <p>Brands</p>
                    <p>{stats?.brands}</p>
                </div>
                {/* <div className="card3">
                    <i className="pi pi-circle home_icon" />
                    <p>Categories</p>
                    <p>{stats?.categories}</p>
                </div>
                <div className="card4">
                    <i className="pi pi-car home_icon" />
                    <p>Sub-categories</p>
                    <p>{stats?.subcategories}</p>
                </div> */}
                <div className="card5">
                    <i className="pi pi-box home_icon" />
                    <p>Products</p>
                    <p>{stats?.products}</p>
                </div>
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Total Orders</p>
                    <p>{stats?.totalOrders}</p>
                </div>
            </div>

            {/* <div className="grid_view">
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Placed</p>
                    <p>{stats?.placedCount}</p>
                </div>
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Payment Done</p>
                    <p>{stats?.paymentDoneCount}</p>
                </div>
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Payment Verified</p>
                    <p>{stats?.paymentVerifiedCount}</p>
                </div>
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Dispatched</p>
                    <p>{stats?.dispatchedCount}</p>
                </div>
                <div className="card6">
                    <i className="pi pi-shopping-cart home_icon" />
                    <p>Delivered</p>
                    <p>{stats?.deliveredCount}</p>
                </div>
            </div> */}

            <div className="graphs_section">
                <div className="left_" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h5>Order Status</h5>
                    <Chart type="pie" data={chartData} options={chartOptions} className="w-20rem" />
                </div>

                <div className="right" >
                    <h5 style={{textAlign:"center"}}>Monthly users registered</h5>
                    <Chart type="bar" data={basicData} options={basicOptions} />
                </div>
            </div>
        </>
    );
};

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname && prevProps.colorMode === nextProps.colorMode;
};

export default React.memo(Dashboard, comparisonFn);
