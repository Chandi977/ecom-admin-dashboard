import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

export const exportJsonToExcel = ({ data, fileName, sheetName = "Sheet1" }) => {
    const safeData = Array.isArray(data) ? data : [];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName || "Sheet1");
    const headers = Array.from(
        new Set(
            safeData.flatMap((row) => (row && typeof row === "object" ? Object.keys(row) : []))
        )
    );

    if (headers.length > 0) {
        worksheet.addRow(headers);
    }

    safeData.forEach((row) => {
        const safeRow = headers.map((key) => {
            const value = row?.[key];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            return value;
        });
        worksheet.addRow(safeRow);
    });

    workbook.xlsx
        .writeBuffer()
        .then((excelBuffer) => {
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
            });
            saveAs(blob, `${fileName || "data"}.xlsx`);
        })
        .catch((error) => {
            // Keep export click handlers resilient if worksheet serialization fails.
            console.error("Failed to export Excel file:", error);
        });
};
