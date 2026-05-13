import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateTicketPDF = (invoice: any, cart: any[], settings: any, currency: string) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150] // POS thermal printer size
    })

    const margin = 5
    let cursorY = 10

    // Header: Company Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(settings.legalName || 'BARFLOW POS', 40, cursorY, { align: 'center' })
    cursorY += 5
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    if (settings.nif) {
        doc.text(`NIF: ${settings.nif}`, 40, cursorY, { align: 'center' })
        cursorY += 4
    }
    if (settings.address) {
        doc.text(settings.address, 40, cursorY, { align: 'center', maxWidth: 70 })
        cursorY += 4
    }
    if (settings.phone) {
        doc.text(`Tel: ${settings.phone}`, 40, cursorY, { align: 'center' })
        cursorY += 4
    }

    cursorY += 2
    doc.setLineWidth(0.1)
    doc.line(margin, cursorY, 80 - margin, cursorY)
    cursorY += 5

    // Invoice Info
    doc.setFont('helvetica', 'bold')
    doc.text(`TICKET: ${invoice.invoiceNumber}`, margin, cursorY)
    cursorY += 4
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, cursorY)
    cursorY += 6

    // Items Table
    autoTable(doc, {
        startY: cursorY,
        head: [['Cant.', 'Prod.', 'Precio', 'Total']],
        body: cart.map(item => [
            item.quantity.toString(),
            item.name,
            `${Number(item.price).toFixed(2)}`,
            `${(item.price * item.quantity).toFixed(2)}`
        ]),
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 12, halign: 'right' },
            3: { cellWidth: 12, halign: 'right' }
        },
        margin: { left: margin, right: margin }
    })

    cursorY = (doc as any).lastAutoTable.finalY + 5

    // Totals
    doc.line(margin, cursorY, 80 - margin, cursorY)
    cursorY += 5
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    const vatAmount = cartTotal * (settings.vatRate / 100)
    const subtotal = cartTotal - vatAmount

    doc.text('Base Imponible:', 45, cursorY, { align: 'right' })
    doc.text(`${currency}${subtotal.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 4

    doc.text(`IVA (${settings.vatRate}%):`, 45, cursorY, { align: 'right' })
    doc.text(`${currency}${vatAmount.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 45, cursorY, { align: 'right' })
    doc.text(`${currency}${cartTotal.toFixed(2)}`, 75, cursorY, { align: 'right' })

    cursorY += 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('¡Gracias por su visita!', 40, cursorY, { align: 'center' })

    // Save/Download
    doc.save(`Ticket_${invoice.invoiceNumber}.pdf`)
}
