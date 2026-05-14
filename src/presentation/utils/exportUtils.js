import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToExcel(fileName, sheetName, rows) {
  const data = Array.isArray(rows) ? rows : [];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToPdf(title, fileName, columns, rows) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(title, 14, 15);

  autoTable(doc, {
    startY: 22,
    head: [columns],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 8, right: 8 },
  });

  doc.save(`${fileName}.pdf`);
}

export function exportToHtml(title, columns, rows) {
  const newWindow = window.open('', '_blank');
  newWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #2563eb; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${title}</h2>
          <p>Generado automáticamente</p>
        </div>
        <table>
          <thead>
            <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `);
  newWindow.document.close();
}
