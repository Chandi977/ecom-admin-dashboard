import { Editor as RichTextEditor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const SAFE_TOOLBAR = {
    options: ["inline", "blockType", "fontSize", "list", "textAlign", "link", "emoji", "remove", "history"],
};

const SafeRichTextEditor = ({ toolbar, ...props }) => {
    return <RichTextEditor {...props} toolbar={toolbar || SAFE_TOOLBAR} />;
};

export default SafeRichTextEditor;
