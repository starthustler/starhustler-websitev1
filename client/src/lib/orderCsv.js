const protectSpreadsheetCell = value => {
  const text = String(value ?? "");
  return /^[=+@]/.test(text) || /^-\D/.test(text) ? `'${text}` : text;
};

const csvCell = value => `"${protectSpreadsheetCell(value).replaceAll('"', '""')}"`;

const formatDate = value => value
  ? new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(new Date(value))
  : "";

const phoneForSpreadsheet = value => {
  const phone = String(value ?? "").trim();
  return phone ? `\t${phone}` : "";
};

export function buildOrdersCsv(rows) {
  const headers = [
    "Order ID",
    "Nama",
    "Email",
    "Nomor HP",
    "Kelas",
    "Selling Price/Amount",
    "Payment Status",
    "Payment Method",
    "Created At",
    "Paid At",
  ];
  const lines = rows.map(row => [
    row.orderId,
    row.name,
    row.email,
    phoneForSpreadsheet(row.phone),
    row.className,
    row.amount,
    row.paymentStatus,
    row.paymentMethod,
    formatDate(row.createdAt),
    formatDate(row.paidAt),
  ].map(csvCell).join(","));
  return `\uFEFF${headers.map(csvCell).join(",")}\r\n${lines.join("\r\n")}`;
}
