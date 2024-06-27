import React, { useEffect, useState } from "react";
import { handleGetRequest } from "../services/GetTemplate";
import styles from "./page.scss";

function Paginator({ data, total, skip, handleskip }) {
    console.log(total);
    const [NoOfPages, setNo] = useState([]);
    const [selectedPage, setSelectedPage] = useState(1);
    useEffect(async () => {
        let num = Math.ceil(total / 10);
        const temp = [];
        for (let i = 0; i < num; i++) {
            temp.push(i + 1);
        }
        setNo(temp);
    }, [total]);

    const handleSelect = (no) => {
        if (no === 1) {
            handleskip(0);
        } else {
            const final = no * 10 - 10;
            handleskip(final);
        }

        setSelectedPage(no);
    };

    const handlesingalFowrawrd = () => {
        if (skip + 10 < total) {
            handleskip(skip + 10);
            setSelectedPage(selectedPage + 1);
        }
    };

    const handlesingleBack = () => {
        if (skip !== 0) {
            handleskip(skip - 10);
            setSelectedPage(selectedPage - 1);
        }
    };

    return (
        <div className="page__main">
            <p className="single_open" onClick={handlesingleBack}>
                {"<"}
            </p>
            {NoOfPages?.map((no, index) => {
                if (no === selectedPage) {
                    return <p className="selected">{no}</p>;
                } else {
                    return (
                        <p className="not-selected" onClick={() => handleSelect(no)}>
                            {no}
                        </p>
                    );
                }
            })}
            <p className="single_close" onClick={handlesingalFowrawrd}>
                {">"}
            </p>
            <p className="inner-text">
                Showing {skip + 1} to {skip + data?.length} of {total} records
            </p>
        </div>
    );
}

export default Paginator;
