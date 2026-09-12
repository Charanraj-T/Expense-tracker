export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports transaction records to a CSV file and triggers automatic download.
 */
export const exportTransactionsToCsv = (
  transactions = [],
  filename = "transactions.csv",
) => {
  if (!transactions || transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ["Date", "Type", "Category", "Amount", "Note"];
  const rows = transactions.map((t) => [
    t.date ? new Date(t.date).toISOString().split("T")[0] : "",
    t.type || "",
    `"${(t.category || "").replace(/"/g, '""')}"`,
    t.amount || 0,
    `"${(t.note || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
