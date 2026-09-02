using LocalServices.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LocalServices.Api.Services
{
    public class InvoiceService
    {
        public InvoiceService()
        {
            // Set community license for open source / internal use
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public byte[] GenerateInvoicePdf(Booking booking)
        {
            var invoiceNumber = $"INV-{booking.CreatedAt.Year}-{booking.Id:D6}";
            var issueDate = booking.UpdatedAt.ToString("dd MMMM yyyy");
            var servicePrice = booking.Listing?.Price ?? 0m;
            var platformFee = Math.Round(servicePrice * 0.05m, 2); // 5% platform fee
            var gst = Math.Round((servicePrice + platformFee) * 0.18m, 2); // 18% GST
            var grandTotal = servicePrice + platformFee + gst;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(35);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial").FontColor("#1e293b"));

                    // 1. HEADER SECTION
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("LocalServices").FontSize(22).Bold().FontColor("#7c3aed");
                            col.Item().Text("Marketplace Services Pvt. Ltd.").FontSize(10).FontColor("#64748b");
                            col.Item().Text("Sector 62, Noida, Uttar Pradesh 201309").FontSize(9).FontColor("#94a3b8");
                            col.Item().Text("GSTIN: 07AAAAA0000A1Z5 | contact@localservices.in").FontSize(9).FontColor("#94a3b8");
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text("TAX INVOICE").FontSize(22).ExtraBold().FontColor("#0f172a");
                            col.Item().Text($"Invoice #: {invoiceNumber}").FontSize(10).Bold();
                            col.Item().Text($"Date: {issueDate}").FontSize(9).FontColor("#64748b");
                            col.Item().Text($"Booking ID: #{booking.Id}").FontSize(9).FontColor("#64748b");
                        });
                    });

                    // 2. CONTENT / BILLING DETAILS
                    page.Content().PaddingVertical(25).Column(col =>
                    {
                        // Customer & Provider Information Boxes
                        col.Item().Row(row =>
                        {
                            // Billed To (Customer)
                            row.RelativeItem().Background("#f8fafc").Padding(12).Column(c =>
                            {
                                c.Item().Text("BILLED TO (CUSTOMER)").FontSize(8).Bold().FontColor("#7c3aed");
                                c.Item().Text(booking.Customer?.FullName ?? "Customer").FontSize(11).Bold();
                                c.Item().Text($"Email: {booking.Customer?.Email ?? "N/A"}").FontSize(9);
                                if (!string.IsNullOrEmpty(booking.Customer?.Phone))
                                    c.Item().Text($"Phone: +91 {booking.Customer.Phone}").FontSize(9);
                                c.Item().Text($"Service Location: {booking.Listing?.Location ?? "N/A"}").FontSize(9);
                            });

                            row.ConstantItem(20);

                            // Service Provider
                            row.RelativeItem().Background("#f8fafc").Padding(12).Column(c =>
                            {
                                c.Item().Text("SERVICE PROVIDER").FontSize(8).Bold().FontColor("#7c3aed");
                                c.Item().Text(booking.Listing?.Provider?.FullName ?? "Service Provider").FontSize(11).Bold();
                                c.Item().Text($"Email: {booking.Listing?.Provider?.Email ?? "N/A"}").FontSize(9);
                                if (!string.IsNullOrEmpty(booking.Listing?.Provider?.Phone))
                                    c.Item().Text($"Phone: +91 {booking.Listing.Provider.Phone}").FontSize(9);
                                c.Item().Text($"Category: {booking.Listing?.Category?.Name ?? "General"}").FontSize(9);
                            });
                        });

                        col.Item().PaddingTop(25);

                        // Line Items Table
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn(4);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            // Table Header
                            table.Header(header =>
                            {
                                header.Cell().Background("#7c3aed").Padding(8).Text("#").FontColor(Colors.White).Bold();
                                header.Cell().Background("#7c3aed").Padding(8).Text("Service Description").FontColor(Colors.White).Bold();
                                header.Cell().Background("#7c3aed").Padding(8).AlignRight().Text("Category").FontColor(Colors.White).Bold();
                                header.Cell().Background("#7c3aed").Padding(8).AlignRight().Text("Amount (INR)").FontColor(Colors.White).Bold();
                            });

                            // Table Body
                            table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(8).Text("1");
                            table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(8).Column(c =>
                            {
                                c.Item().Text(booking.Listing?.Title ?? "Service Booking").Bold();
                                c.Item().Text($"Completed on: {booking.UpdatedAt:dd/MM/yyyy}").FontSize(8).FontColor("#64748b");
                            });
                            table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(8).AlignRight().Text(booking.Listing?.Category?.Name ?? "Service");
                            table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(8).AlignRight().Text($"₹{servicePrice:N2}");
                        });

                        col.Item().PaddingTop(15);

                        // Summary Breakdown Row
                        col.Item().Row(row =>
                        {
                            // Payment Status Seal Box
                            row.RelativeItem(2).Column(c =>
                            {
                                c.Item().PaddingTop(10);
                                c.Item().Border(2).BorderColor("#10b981").Background("#ecfdf5").Padding(8).Column(seal =>
                                {
                                    seal.Item().Text("PAYMENT COMPLETED").FontSize(11).Bold().FontColor("#047857");
                                    seal.Item().Text($"Status: Service Marked as Completed").FontSize(8).FontColor("#065f46");
                                    seal.Item().Text($"Processed via LocalServices Gateway").FontSize(8).FontColor("#065f46");
                                });
                            });

                            row.ConstantItem(30);

                            // Calculations Column
                            row.RelativeItem(2).Column(c =>
                            {
                                c.Item().Row(r =>
                                {
                                    r.RelativeItem().Text("Service Subtotal:").FontColor("#64748b");
                                    r.RelativeItem().AlignRight().Text($"₹{servicePrice:N2}");
                                });

                                c.Item().PaddingTop(4);

                                c.Item().Row(r =>
                                {
                                    r.RelativeItem().Text("Platform Convenience (5%):").FontColor("#64748b");
                                    r.RelativeItem().AlignRight().Text($"₹{platformFee:N2}");
                                });

                                c.Item().PaddingTop(4);

                                c.Item().Row(r =>
                                {
                                    r.RelativeItem().Text("GST (18%):").FontColor("#64748b");
                                    r.RelativeItem().AlignRight().Text($"₹{gst:N2}");
                                });

                                c.Item().PaddingVertical(6).LineHorizontal(1).LineColor("#e2e8f0");

                                c.Item().Row(r =>
                                {
                                    r.RelativeItem().Text("Grand Total:").FontSize(12).Bold().FontColor("#7c3aed");
                                    r.RelativeItem().AlignRight().Text($"₹{grandTotal:N2}").FontSize(12).Bold().FontColor("#7c3aed");
                                });
                            });
                        });
                    });

                    // 3. FOOTER
                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor("#e2e8f0");
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            row.RelativeItem().Text("Thank you for choosing LocalServices Marketplace. This is a computer-generated invoice.")
                               .FontSize(8).FontColor("#94a3b8");
                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                        });
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}