import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, isValid } from 'date-fns';

export async function generateInvoicePDF(order: any, settings: any) {
  // @ts-ignore - jspdf-autotable extends jsPDF types
  const doc = new jsPDF() as any;

  const brandName = settings?.brandName || "Janopriyo Shop";
  const brandLogo = settings?.logo;
  const brandEmail = settings?.contact?.email || "";
  const brandPhone = settings?.contact?.phone || "";
  const brandAddress = settings?.contact?.address || "";

  // Set Colors
  const primaryColor = [0, 209, 178]; // #00D1B2 (Teal)
  const secondaryColor = [100, 100, 100];
  const accentColor = [240, 240, 240];

  // Header / Brand
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(brandName.toUpperCase(), 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(brandAddress, 14, 25);
  doc.text(`Email: ${brandEmail} | Phone: ${brandPhone}`, 14, 29);

  // Invoice Title
  doc.setFontSize(30);
  doc.setTextColor(230, 230, 230);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 140, 30);
  
  // Horizontal Line
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.line(14, 35, 196, 35);

  // Bill To & Order Info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 14, 45);
  
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress?.fullName || "Customer", 14, 50);
  doc.text(order.shippingAddress?.street || "", 14, 54);
  doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.zipCode || ""}`, 14, 58);
  doc.text(`Phone: ${order.shippingAddress?.phone || ""}`, 14, 62);

  // Order Details (Right Side)
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE #:", 140, 45);
  doc.setFont("helvetica", "normal");
  doc.text(String(order._id).slice(-8).toUpperCase(), 170, 45);

  doc.setFont("helvetica", "bold");
  doc.text("DATE:", 140, 50);
  doc.setFont("helvetica", "normal");
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const formattedDate = createdAt && isValid(createdAt) ? format(createdAt, "dd MMM yyyy") : "N/A";
  doc.text(formattedDate, 170, 50);

  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT:", 140, 55);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentMethod || "N/A", 170, 55);

  doc.setFont("helvetica", "bold");
  doc.text("STATUS:", 140, 60);
  doc.setFont("helvetica", "normal");
  doc.text(order.status || "Pending", 170, 60);

  // Items Table
  const items = Array.isArray(order.items) ? order.items : [];
  const tableRows = items.map((item: any, index: number) => [
    index + 1,
    item.name,
    item.quantity,
    `৳${Math.round(item.price)}`,
    `৳${Math.round(item.price * item.quantity)}`,
  ]);

  doc.autoTable({
    startY: 75,
    head: [["#", "Product", "Qty", "Unit Price", "Subtotal"]],
    body: tableRows,
    theme: "striped",
    headStyles: { 
      fillColor: primaryColor, 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold"
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 100 },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  const subtotalRaw = items.reduce((acc: number, item: any) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + (price * quantity);
  }, 0);
  
  const subtotal = Number.isFinite(subtotalRaw) ? subtotalRaw : 0;
  
  const shippingCharge = order.shippingCharge !== undefined 
    ? (Number(order.shippingCharge) || 0)
    : Math.max(0, (Number(order.totalAmount) || 0) - subtotal);

  doc.text("Subtotal:", 140, finalY);
  doc.text(`৳${Math.round(subtotal)}`, 190, finalY, { align: "right" });

  doc.text("Shipping Charge:", 140, finalY + 6);
  doc.text(`৳${Math.round(shippingCharge)}`, 190, finalY + 6, { align: "right" });

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.line(140, finalY + 9, 196, finalY + 9);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Total Amount:", 140, finalY + 16);
  doc.text(`৳${Math.round(order.totalAmount)}`, 190, finalY + 16, { align: "right" });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "italic");
  doc.text(`Thank you for shopping with ${brandName}!`, 105, pageHeight - 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer generated invoice and does not require a physical signature.", 105, pageHeight - 15, { align: "center" });

  // Save PDF
  doc.save(`invoice-${String(order._id).slice(-8).toUpperCase()}.pdf`);
}
