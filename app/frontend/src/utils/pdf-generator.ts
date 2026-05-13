import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

export const generateTicketPDF = async (invoice: any, cart: any[], settings: any, currency: string) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 180] // Slightly taller to fit QR
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
    doc.text(`Fecha: ${new Date(invoice.createdAt || Date.now()).toLocaleString()}`, margin, cursorY)
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
    const vatRate = settings.vatRate || 10
    const vatAmount = cartTotal * (vatRate / 100)
    const subtotal = cartTotal - vatAmount

    doc.text('Base Imponible:', 45, cursorY, { align: 'right' })
    doc.text(`${currency}${subtotal.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 4

    doc.text(`IVA (${vatRate}%):`, 45, cursorY, { align: 'right' })
    doc.text(`${currency}${vatAmount.toFixed(2)}`, 75, cursorY, { align: 'right' })
    cursorY += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 45, cursorY, { align: 'right' })
    doc.text(`${currency}${cartTotal.toFixed(2)}`, 75, cursorY, { align: 'right' })

    cursorY += 10

    // LAW COMPLIANCE: VERI*FACTU INFO & QR
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA VERIFICABLE EN LA SEDE ELECTRÓNICA DE LA AEAT', 40, cursorY, { align: 'center' })
    cursorY += 3
    doc.text('SISTEMA VERI*FACTU', 40, cursorY, { align: 'center' })
    cursorY += 4

    doc.setFont('helvetica', 'normal')
    doc.text(`Huella: ${invoice.hash ? invoice.hash.substring(0, 16).toUpperCase() : 'N/A'}`, 40, cursorY, { align: 'center' })
    cursorY += 2

    // AEAT Verification URL Construction
    const nif = settings.nif || '00000000X'
    const date = new Date(invoice.createdAt || Date.now()).toISOString().split('T')[0]
    const amount = cartTotal.toFixed(2)
    const aeatUrl = `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/VerificarFactura?nif=${nif}&numserie=${invoice.series}-${invoice.invoiceNumber}&fecha=${date}&importe=${amount}`

    try {
        const qrDataUrl = await QRCode.toDataURL(aeatUrl, { margin: 1, width: 100 })
        doc.addImage(qrDataUrl, 'PNG', 27.5, cursorY, 25, 25)
        cursorY += 28
    } catch (err) {
        console.error('Error generating QR:', err)
        doc.rect(30, cursorY, 20, 20)
        doc.text('Error QR', 40, cursorY + 10, { align: 'center' })
        cursorY += 25
    }

    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('¡Gracias por su visita!', 40, cursorY, { align: 'center' })

    // Save/Download
    doc.save(`Ticket_${invoice.invoiceNumber}.pdf`)
}

export const generateClosingPDF = (closing: any, settings: any, type: 'simple' | 'detailed' = 'simple') => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, type === 'simple' ? 150 : 250]
    })

    const margin = 5
    let cursorY = 10

    // Header
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('CIERRE DE CAJA (Z)', 40, cursorY, { align: 'center' })
    cursorY += 5
    doc.setFontSize(8)
    doc.text(`Z-Nº: ${closing.closingNumber}`, 40, cursorY, { align: 'center' })
    cursorY += 7

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Establecimiento: ${settings.legalName || 'BarFlow POS'}`, margin, cursorY)
    cursorY += 4
    doc.text(`Fecha: ${new Date(closing.timestamp).toLocaleString()}`, margin, cursorY)
    cursorY += 4
    doc.text(`Responsable: ${closing.user?.name || 'N/A'}`, margin, cursorY)
    cursorY += 6

    doc.line(margin, cursorY, 75, cursorY)
    cursorY += 6

    // Totals Section
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN DE CAJA', margin, cursorY)
    cursorY += 5
    doc.setFont('helvetica', 'normal')

    const rows = [
        ['Efectivo (Esperado):', `EUR ${closing.expectedCash.toFixed(2)}`],
        ['Efectivo (Real):', `EUR ${closing.actualCash.toFixed(2)}`],
        ['Tarjeta:', `EUR ${closing.expectedCard.toFixed(2)}`],
        ['', ''],
        ['TOTAL RECAUDADO:', `EUR ${closing.totalAmount.toFixed(2)}`]
    ]

    rows.forEach(row => {
        doc.text(row[0], margin, cursorY)
        doc.text(row[1], 75, cursorY, { align: 'right' })
        cursorY += 4
    })

    const discrepancy = closing.actualCash - closing.expectedCash
    if (discrepancy !== 0) {
        cursorY += 2
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(discrepancy < 0 ? 200 : 0, 0, 0)
        doc.text('DESCUADRE:', margin, cursorY)
        doc.text(`EUR ${discrepancy.toFixed(2)}`, 75, cursorY, { align: 'right' })
        doc.setTextColor(0, 0, 0)
        cursorY += 4
    }

    cursorY += 5
    doc.line(margin, cursorY, 75, cursorY)
    cursorY += 6

    // Detailed Section (Products)
    if (type === 'detailed' && closing.itemizedSales) {
        const items = JSON.parse(closing.itemizedSales)
        if (items.length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.text('DESGLOSE DE PRODUCTOS', margin, cursorY)
            cursorY += 5

            autoTable(doc, {
                startY: cursorY,
                head: [['Prod.', 'Ud.', 'Total']],
                body: items.map((i: any) => [i.name, i.quantity, `${i.total.toFixed(2)}`]),
                theme: 'plain',
                styles: { fontSize: 6, cellPadding: 1 },
                margin: { left: margin, right: margin }
            })
            cursorY = (doc as any).lastAutoTable.finalY + 10
        }
    }

    // Legal Info
    doc.setFontSize(6)
    doc.setFont('helvetica', 'italic')
    doc.text('Registro de cierre inalterable - Veri*Factu Compliant', 40, cursorY, { align: 'center' })

    doc.save(`Cierre_Z_${closing.closingNumber}.pdf`)
}
