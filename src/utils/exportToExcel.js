import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export const exportJsonToExcel = ({ data, fileName, sheetName = "Sheet1" }) => {
    const safeData = Array.isArray(data) ? data : [];
    const worksheet = XLSX.utils.json_to_sheet(safeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `${fileName || "data"}.xlsx`);
};
