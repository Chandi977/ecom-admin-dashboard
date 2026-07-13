// Read an uploaded spreadsheet into delimited text the paste importer can parse.
//
// Real Excel workbooks (.xlsx/.xlsm) are flattened to TSV (tab delimited) via
// ExcelJS so that cells containing commas — e.g. a price like "$1,750" — stay
// intact. Plain text uploads (.csv/.tsv/.txt) are returned verbatim. Legacy
// binary .xls is not readable in the browser here, so we nudge the user to
// re-save it. ExcelJS is imported lazily so it only loads when a file is picked.

// Turn one ExcelJS cell value (which may be a string, number, Date, formula
// result, hyperlink or rich-text object) into a plain string.
const cellText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return String(value);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (Array.isArray(value.richText)) return value.richText.map((r) => r.text).join("");
    if (value.result !== undefined) return String(value.result); // formula / shared formula
    if (value.text !== undefined) return String(value.text); // hyperlink
    if (value.formula !== undefined) return ""; // formula with no cached result
    return String(value);
};

const isExcelName = (name) => /\.(xlsx|xlsm)$/i.test(name);
const isLegacyXls = (name) => /\.xls$/i.test(name);

export const readTabularFileAsText = async (file) => {
    const name = file?.name || "";

    if (!isExcelName(name)) {
        if (isLegacyXls(name)) {
            throw new Error("Legacy .xls files can't be read here — open it in Excel and Save As .xlsx (or .csv).");
        }
        return file.text();
    }

    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    const ws = workbook.worksheets[0];
    if (!ws) throw new Error("The workbook has no sheets.");

    const colCount = ws.columnCount;
    const lines = [];
    ws.eachRow({ includeEmpty: false }, (row) => {
        const cells = [];
        for (let c = 1; c <= colCount; c++) {
            cells.push(cellText(row.getCell(c).value).replace(/[\t\r\n]+/g, " ").trim());
        }
        if (cells.some((c) => c !== "")) lines.push(cells.join("\t"));
    });

    return lines.join("\n");
};

export default readTabularFileAsText;
