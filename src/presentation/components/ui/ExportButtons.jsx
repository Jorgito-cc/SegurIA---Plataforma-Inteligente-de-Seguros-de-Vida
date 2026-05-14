import { FiFileText, FiGrid, FiDownload } from "react-icons/fi";
import { exportToPdf, exportToExcel, exportToHtml } from "../../utils/exportUtils";

export default function ExportButtons({ title, columns, rows, fileName, dataObject }) {
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => exportToHtml(title, columns, rows)}
        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition"
      >
        <FiGrid /> HTML
      </button>
      <button 
        onClick={() => exportToPdf(title, fileName || title, columns, rows)}
        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition"
      >
        <FiFileText /> PDF
      </button>
      <button 
        onClick={() => exportToExcel(fileName || title, title, dataObject || rows)}
        className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition"
      >
        <FiDownload /> Excel
      </button>
    </div>
  );
}
