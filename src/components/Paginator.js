import React, { useEffect, useState } from "react";

function Paginator({ data, total, skip, handleskip }) {
    const [NoOfPages, setNo] = useState([]);
    const [selectedPage, setSelectedPage] = useState(1);
    useEffect(() => {
        const num = Math.ceil(total / 10);
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

    if (!total || total <= (data?.length || 0)) {
        return null;
    }

    return (
        <div className="page__main">
            <p className="single_open" onClick={handlesingleBack}>
                {"<"}
            </p>
            {NoOfPages?.map((no, index) => {
                if (no === selectedPage) {
                    return (
                        <p key={`page-${no}`} className="selected">
                            {no}
                        </p>
                    );
                } else {
                    return (
                        <p key={`page-${no}`} className="not-selected" onClick={() => handleSelect(no)}>
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
