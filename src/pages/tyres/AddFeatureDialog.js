import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { handleGetRequest } from "../../services/GetTemplate";
import { handlePutRequest } from "../../services/PutTemplate";

const AddFeatureDialog = ({ onHideFeatureDialog, brand, handleSuccess }) => {
    const [fearues, setFeatures] = useState([]);
    const [selected, setSelected] = useState();

    const getData = async () => {
        const result = await handleGetRequest("/features");
        setFeatures(result?.data);
    };

    console.log(fearues);

    useEffect(() => {
        getData();
    }, []);

    const getDisabled = (id) => {
        const index = brand?.features?.map((feature) => feature?.feature?._id).indexOf(id);
        if (index === -1) {
            return false;
        }
        return true;
    };

    const handleFeature = async (e) => {
        const temp = brand?.features;
        temp.push({ feature: e });
        setSelected(temp);
    };

    const handleAdd = async () => {
        const data = {
            tyre_id: brand?.tyre_id,
            features: selected,
            default_price: brand?.price?.default_price,
            price_list: brand?.price?.price_list,
        };
        const result = await handlePutRequest(data, "/editTyre");
        console.log(result);
        if (result?.success) {
            handleSuccess();
        }
    };

    console.log(selected);

    return (
        <>
            <div className="p-fluid p-mt-2">
                <div className="p-fluid p-formgrid grid mb-5">
                    <div className="p-field col-12 md:col-12">
                        <div className="p-field" style={{ display: "flex", flexDirection: "column" }}>
                            <label htmlFor="icon" className={classNames("Label__Text")}>
                                Select feature
                            </label>
                            <select style={{ marginTop: "20px", height: "40px", border: "1px solid #cecece", borderRadius: "5px" }} onChange={(e) => handleFeature(e.target.value)}>
                                <option selected disabled>
                                    Select feature
                                </option>
                                {fearues?.map((feature, index) => {
                                    return (
                                        <option value={feature?._id} disabled={getDisabled(feature?._id)} key={index}>
                                            {feature?.title}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" onClick={() => onHideFeatureDialog()} />
                    <Button label="Add" className="Btn__Dark" onClick={handleAdd} />
                </div>
            </div>
        </>
    );
};

export default AddFeatureDialog;
