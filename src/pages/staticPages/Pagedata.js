import React, { useEffect, useRef, useState } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Warranty from "./AllStaticPages/warranty/Warranty";
import { useParams } from "react-router-dom";
import { handleGetRequest } from "../../services/GetTemplate";
import moment from "moment";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { handlePutRequest } from "../../services/PutTemplate";
import { toast } from "react-toastify";

function Pagedata() {
    const breadItems = [{ label: "Home" }, { label: "Manage", url: "/manage" }];
    const home = { icon: "pi pi-home", url: "/" };
    const [text1, setText1] = useState(EditorState.createEmpty());
    const [page, setPage] = useState({
        title: "",
        id: "",
        user: "",
        createdAt: "",
        updatedAt: "",
        description: "",
    });
    const handledClicked = () => {
        return null;
    };
    const { id } = useParams();
    const getData = async () => {
        const result = await handleGetRequest(`/page/${id}`);
        setPage({
            title: result?.data?.title,
            id: result?.data?.id,
            user: result?.data?.user,
            createdAt: result?.data?.createdAt,
            updatedAt: result?.data?.updatedAt,
            description: result?.data?.description,
        });
        const contentBlock = htmlToDraft(result?.data?.description);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setText1(editorState);
        }
    };

    const handleState = (editorState) => {
        setText1(editorState);
    };

    const handlecontent = (contentState) => {
        let temp = draftToHtml(contentState);
        setPage({ ...page, description: temp });
    };

    useEffect(() => {
        getData();
    }, [id]);

    const handleEdit = async () => {
        const result = await handlePutRequest(page, "/editPage");
        if (result?.success) {
            toast.success("page edited");
            getData();
        }
    };
    return (
        <>
            <div className="customer_header__">
                <div className="left___">
                    <h2>{page?.title}</h2>
                    <BreadCrumb model={breadItems} home={home} />
                </div>
            </div>
            <div className="input_section">
                <div className="data_section">
                    <div className="left_section">
                        <div>
                            <p>ID</p>
                            <InputText placeholder="1" value={page?.id} onChange={(e) => setPage({ ...page, id: e.target.value })} />
                        </div>
                        <div>
                            <p>Created On</p>
                            <InputText placeholder="1" value={moment(page?.createdAt).format("DD/MM/YYYY hh:ss a")} disabled={true} />
                        </div>
                        <div>
                            <p>Create User</p>
                            <p>{page?.user}</p>
                        </div>
                    </div>
                    <div className="right_section">
                        <div>
                            <p>Title</p>
                            <InputText placeholder="1" value={page?.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
                        </div>
                        <div>
                            <p>Updated on</p>
                            <InputText placeholder="1" value={moment(page?.updatedAt).format("DD/MM/YYYY hh:ss a")} disabled={true} />
                        </div>
                    </div>
                </div>
                <div className="Down__Btn">
                    <Button label="Cancel" className="Btn__Transparent" />
                    <Button label="Confirm" className="Btn__Dark" onClick={handleEdit} />
                </div>
            </div>

            <div style={{ marginTop: "40px" }}>
                <Editor style={{ height: "450px", width: "100%" }} editorState={text1} onEditorStateChange={handleState} onContentStateChange={handlecontent} />
            </div>
        </>
    );
}

export default Pagedata;
