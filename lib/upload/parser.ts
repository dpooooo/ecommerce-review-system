import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedFile = {
  fileName: string;
  fileFormat: string;
  rowCount: number;
  columnCount: number;
  rawColumns: string[];
  rawData: Array<Record<string, unknown>>;
  error?: string;
};

export function parseBuffer(buffer: Buffer, fileName: string): ParsedFile {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  try {
    if (ext === "csv") {
      const result = Papa.parse<Record<string, unknown>>(buffer.toString("utf8"), {
        header: true,
        skipEmptyLines: true
      });
      const rawData = result.data;
      const rawColumns = result.meta.fields || Object.keys(rawData[0] || {});
      return { fileName, fileFormat: ext, rowCount: rawData.length, columnCount: rawColumns.length, rawColumns, rawData };
    }
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const rawColumns = Object.keys(rawData[0] || {});
    return { fileName, fileFormat: ext, rowCount: rawData.length, columnCount: rawColumns.length, rawColumns, rawData };
  } catch (error) {
    return {
      fileName,
      fileFormat: ext,
      rowCount: 0,
      columnCount: 0,
      rawColumns: [],
      rawData: [],
      error: error instanceof Error ? error.message : "文件解析失败"
    };
  }
}
