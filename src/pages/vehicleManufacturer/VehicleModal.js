import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";

function VehicleModal() {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedRow, setselectedRow] = useState([]);
    const menu = useRef(null);
    const [role, setRole] = useState();

    const breadItems = [{ label: "Home" }, { label: "Vehicle Brand" }];
    const home = { icon: "pi pi-home", url: "https://www.primefaces.org/primereact/showcase" };
    const handledClicked = () => {
        return null;
    };
    const values = [
        {
            label: "New",
            values: "New",
        },
        {
            label: "Old",
            values: "Old",
        },
    ];
    const formik = useFormik({
        initialValues: {
            name: "",
            createdOn: "",
            createdBy: "",
            state: "",
            manufacturer: "",
        },

        onSubmit: async (data) => {
            console.log(data);
        },
    });
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };
    const tyresss = [
        { id: "1", title: "S500", manufacturer: "Mercedes" },

        { id: "1", title: "S500", manufacturer: "Mercedes" },
        { id: "1", title: "S500", manufacturer: "Mercedes" },
    ];
    const items = [
        {
            label: "Options",
            items: [
                {
                    label: "Update",
                    icon: "pi pi-refresh",
                },
                {
                    label: "Delete",
                    icon: "pi pi-times",
                },
                {
                    label: "View Details",
                    icon: "pi pi-eye",
                    url: "/vehiclemodal",
                },
            ],
        },
    ];
    const buttonTemplate = (rowData) => {
        return <Button label="Active" onClick={handledClicked} className="status_button" style={{ width: "240px" }} />;
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Menu model={items} popup ref={menu} id="popup_menu" />
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={(event) => menu.current.toggle(event)} aria-controls="popup_menu" aria-haspopup />
                {/* <Button icon="pi pi-ellipsis-v" className="p-button-rounded mr-2 Elipse_Icon" onClick={() => handledEditClicked(rowData)} /> */}
            </div>
        );
    };

    useEffect(() => {
        const role = localStorage.getItem("role");
        setRole(role);
    }, []);
    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>Mercedes- S500</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>

                <div className="Top__Btn">
                    <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                    <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
                </div>
            </div>
            <div className="customer_details_section">
                <div className="left_section">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe4urDLOvXZ4vt6tMghlzqrsf-pyHsj8yGhrb-dgTvX2SiUfBonWjOKr0j716CLao-5DI&usqp=CAU" />
                    <div className="id_section">
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <p>ID:</p>
                            <p>&nbsp;6681</p>
                        </div>
                        <div>
                            <Button label="Active" className="green_btn"></Button>
                        </div>
                    </div>
                </div>
                <div className="right_section">
                    <form onSubmit={formik.handleSubmit} className="p-fluid p-mt-2">
                        <div className="form__">
                            <div className="form_left">
                                <div>
                                    <label htmlFor="name" className={classNames({ "p-error": isFormFieldValid("name") }, "Label__Text")}>
                                        Title
                                    </label>
                                    <InputText id="name" name="name" value={formik.values.name} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("name") }, "Input__Round")} />

                                    {getFormErrorMessage("name")}
                                </div>

                                <div>
                                    <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                        Created On
                                    </label>
                                    <InputText id="createdOn" name="createdOn" value={formik.values.createdOn} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                    {getFormErrorMessage("createdOn")}
                                </div>
                                <div>
                                    <label htmlFor="createdBy" className={classNames({ "p-error": isFormFieldValid("createdBy") }, "Label__Text")}>
                                        Created By
                                    </label>
                                    <InputText id="createdBy" name="createdBy" value={formik.values.createdBy} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdBy") }, "Input__Round")} />

                                    {getFormErrorMessage("createdBy")}
                                </div>
                            </div>
                            <div className="form_right">
                                <div>
                                    <label htmlFor="manufacturer" className={classNames({ "p-error": isFormFieldValid("manufacturer") }, "Label__Text")}>
                                        Manufacturer
                                    </label>
                                    <InputText id="manufacturer" name="manufacturer" value={formik.values.manufacturer} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("manufacturer") }, "Input__Round")} />

                                    {getFormErrorMessage("manufacturer")}
                                </div>
                                <div>
                                    <label htmlFor="createdOn" className={classNames({ "p-error": isFormFieldValid("createdOn") }, "Label__Text")}>
                                        Updated On
                                    </label>
                                    <InputText id="createdOn" name="createdOn" value={formik.values.createdOn} onChange={formik.handleChange} className={classNames({ "p-invalid": isFormFieldValid("createdOn") }, "Input__Round")} />

                                    {getFormErrorMessage("createdOn")}
                                </div>
                                <div>
                                    <label htmlFor="state" className={classNames({ "p-error": isFormFieldValid("state") }, "Label__Text")}>
                                        Change State
                                    </label>
                                    <Dropdown id="state" placeholder="Select State" optionLabel="state" name="state" optionValue="state" options={values} className="Dropdown__Round" />

                                    {getFormErrorMessage("state")}
                                </div>
                            </div>
                        </div>

                        <div className="Down__Btn">
                            <Button label="Cancel" className="Btn__Transparent" />
                            <Button label="Create" className="Btn__Dark" />
                        </div>
                    </form>
                </div>
            </div>
            <div className="features_div">
                <div className="Page__Header">
                    <div>
                        <h4>Vehicle Variants</h4>
                    </div>
                    <div className="Top__Btn">
                        <Button label="Add" icon="pi pi-plus" iconPos="right" onClick={handledClicked} className="Btn__DarkAdd" style={{ width: "240px" }} />
                        <Button icon="pi pi-trash" iconPos="right" onClick={handledClicked} className="Btn__DarkDelete" style={{ width: "240px" }} />
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <DataTable
                            filterDisplay="row"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Records"
                            emptyMessage="No List found."
                            responsiveLayout="scroll"
                            value={tyresss}
                            selection={selectedRow}
                            onSelectionChange={(e) => setselectedRow(e.value)}
                        >
                            <Column selectionMode="multiple" style={{ width: "3em" }} />
                            <Column filter field="id" header="ID" />
                            <Column filter field="title" header="Title" />
                            <Column filter field="manufacturer" header="Manufacturer" />
                            <Column filter header="State" body={buttonTemplate} />
                            <Column filter header="Actions" body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VehicleModal;
