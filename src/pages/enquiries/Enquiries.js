import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabPanel, TabView } from "primereact/tabview";
import CustomersData from "../customer-query/customer";
import CustomPackaging from "../custom-packaging/customPackaging";
import ContactData from "../mainWebsiteContact/contact";

const tabIndexByPath = {
    "/data/customer": 0,
    "/custom-packaging": 1,
    "/data/contact": 2,
};

export default function Enquiries() {
    const location = useLocation();
    const initialTab = useMemo(() => tabIndexByPath[location.pathname] ?? 0, [location.pathname]);
    const [activeIndex, setActiveIndex] = useState(initialTab);
    const home = { icon: "pi pi-home", url: "/" };
    const breadItems = [{ label: "Enquiries" }];

    return (
        <div className="Page__Header" style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            <div>
                <h2>Enquiries</h2>
                <BreadCrumb model={breadItems} home={home} />
            </div>

            <div className="grid" style={{ width: "100%", marginTop: 12 }}>
                <div className="col-12">
                    <div className="card">
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel header="Customers Query">
                                <CustomersData embedded />
                            </TabPanel>
                            <TabPanel header="Custom Packaging">
                                <CustomPackaging embedded />
                            </TabPanel>
                            <TabPanel header="Main Website Contact">
                                <ContactData embedded />
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </div>
    );
}
