/**
 * DOCX GENERATOR ENGINE FOR LAPORAN PEKERJAAN PROYEK (MULTI-PAGE AUTO-PAGINATION)
 * Automatically splits many points into pages (4 points per A4 page) inside 1 SINGLE Microsoft Word (.docx) file!
 */

async function exportReportToDocx(report) {
    if (!window.docx) {
        alert("Library docx.umd.js belum dimuat dengan benar.");
        return;
    }

    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        ImageRun, Header, Footer, PageNumber, WidthType, AlignmentType, BorderStyle, PageBreak
    } = window.docx;

    // Helper: Convert DataURL / Image URL to Uint8Array for docx ImageRun
    async function urlToUint8Array(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        } catch (e) {
            console.error("Error converting image to Uint8Array", url, e);
            return null;
        }
    }

    // Palette
    const COLOR_PRIMARY = "1E3A8A";
    const COLOR_NAVY = "0F172A";
    const COLOR_GRAY_BG = "F8FAFC";
    const COLOR_BORDER = "CBD5E1";

    const cellBorder = {
        top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER }
    };

    const noBorder = {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE }
    };

    // Header & Footer
    const docHeader = new Header({
        children: [
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 60, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: (report.contractor || "PT. JAYA KONSTRUKSI").toUpperCase(), bold: true, size: 15, color: COLOR_NAVY })
                                        ]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 40, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.RIGHT,
                                        children: [
                                            new TextRun({ text: report.projectName || "Proyek Konstruksi", bold: true, size: 14, color: "64748B" })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });

    const docFooter = new Footer({
        children: [
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 60, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [new Paragraph({ children: [new TextRun({ text: "Project Work Completion Report", size: 14, color: "94A3B8" })] })]
                            }),
                            new TableCell({
                                width: { size: 40, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.RIGHT,
                                        children: [
                                            new TextRun({ text: "Halaman ", size: 14, color: "94A3B8" }),
                                            new TextRun({ children: [PageNumber.CURRENT], size: 14, color: "94A3B8" }),
                                            new TextRun({ text: " dari ", size: 14, color: "94A3B8" }),
                                            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: "94A3B8" })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });

    const docChildren = [];

    // Title Block
    docChildren.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            space: { before: 40, after: 20 },
            children: [
                new TextRun({ text: "LAPORAN PEKERJAAN SELESAI (WORK COMPLETION REPORT)", bold: true, size: 22, color: COLOR_PRIMARY })
            ]
        })
    );

    // Metadata Table (Compact)
    const infoRows = [
        ["Nama Proyek", report.projectName || "-", "No. Laporan", report.noBap || "-"],
        ["Lokasi / Area", report.location || "-", "Tanggal", report.workDate || "-"],
        ["Nama Pekerjaan", report.workName || "-", "Pelaksana", report.supervisor || "-"]
    ];

    const tableRows = infoRows.map(row => {
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 18, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_GRAY_BG },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 15, color: COLOR_NAVY })] })]
                }),
                new TableCell({
                    width: { size: 32, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 15 })] })]
                }),
                new TableCell({
                    width: { size: 18, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_GRAY_BG },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[2], bold: true, size: 15, color: COLOR_NAVY })] })]
                }),
                new TableCell({
                    width: { size: 32, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[3], size: 15 })] })]
                })
            ]
        });
    });

    docChildren.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
        }),
        new Paragraph({ text: "", space: { after: 60 } })
    );

    // Chunk comparisons into groups of 4 points per page
    const comparisons = (report.comparisons && report.comparisons.length > 0) ? report.comparisons : [
        { area: "Point 01: Area Utama", beforeUrl: "assets/img/concrete.jpg", beforeDesc: "Screed beton belum terpasang keramik.", afterUrl: "assets/img/brickwork.jpg", methodDesc: "Pemasangan keramik 40x40cm.", afterDesc: "Keramik terpasang rapi 100%." }
    ];

    const POINTS_PER_PAGE = 4;
    const totalPages = Math.ceil(comparisons.length / POINTS_PER_PAGE);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pagePoints = comparisons.slice(pageIdx * POINTS_PER_PAGE, (pageIdx + 1) * POINTS_PER_PAGE);

        if (pageIdx > 0) {
            // Page Break for additional pages
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
            
            // Subhead for Page 2, 3...
            docChildren.push(
                new Paragraph({
                    space: { before: 40, after: 40 },
                    children: [
                        new TextRun({ text: `DOKUMENTASI BEFORE & AFTER (Halaman ${pageIdx + 1} dari ${totalPages})`, bold: true, size: 17, color: COLOR_PRIMARY })
                    ]
                })
            );
        } else {
            docChildren.push(
                new Paragraph({
                    space: { before: 40, after: 40 },
                    children: [
                        new TextRun({ text: `DOKUMENTASI BEFORE & AFTER (Total: ${comparisons.length} Point)`, bold: true, size: 17, color: COLOR_PRIMARY })
                    ]
                })
            );
        }

        const compRows = [];

        for (let i = 0; i < pagePoints.length; i++) {
            const comp = pagePoints[i];
            const globalIndex = (pageIdx * POINTS_PER_PAGE) + i + 1;
            const numStr = String(globalIndex).padStart(2, '0');

            const bImgBuf = comp.beforeUrl ? await urlToUint8Array(comp.beforeUrl) : null;
            const aImgBuf = comp.afterUrl ? await urlToUint8Array(comp.afterUrl) : null;

            compRows.push(
                new TableRow({
                    children: [
                        // BEFORE CELL
                        new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: cellBorder,
                            children: [
                                new Paragraph({
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new TextRun({ text: `[${numStr}] BEFORE: ${comp.area}`, bold: true, size: 14, color: "B45309" })
                                    ]
                                }),
                                bImgBuf ? new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new ImageRun({
                                            data: bImgBuf,
                                            transformation: { width: 145, height: 95 }
                                        })
                                    ]
                                }) : new Paragraph({ text: "[Foto Before]", size: 12 }),
                                new Paragraph({
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new TextRun({ text: "Kondisi Awal: ", bold: true, size: 13 }),
                                        new TextRun({ text: comp.beforeDesc || "-", size: 13 })
                                    ]
                                })
                            ]
                        }),

                        // AFTER CELL
                        new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: cellBorder,
                            children: [
                                new Paragraph({
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new TextRun({ text: `[${numStr}] AFTER: ${comp.area}`, bold: true, size: 14, color: "047857" })
                                    ]
                                }),
                                aImgBuf ? new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new ImageRun({
                                            data: aImgBuf,
                                            transformation: { width: 145, height: 95 }
                                        })
                                    ]
                                }) : new Paragraph({ text: "[Foto After]", size: 12 }),
                                new Paragraph({
                                    space: { before: 20, after: 20 },
                                    children: [
                                        new TextRun({ text: "Hasil & Penyelesaian: ", bold: true, size: 13 }),
                                        new TextRun({ text: `${comp.methodDesc || ''} ${comp.afterDesc || ''}`, size: 13 })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );
        }

        docChildren.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: compRows
            }),
            new Paragraph({ text: "", space: { after: 40 } })
        );
    }

    // Append Kesimpulan & Signatures on Last Page
    const workNameText = report.workName || "Pemasangan Keramik & Finishing";
    const areaText = report.area || report.location || "Toilet Pria Lt. 2";

    docChildren.push(
        new Paragraph({
            space: { before: 20, after: 40 },
            children: [
                new TextRun({
                    text: `KESIMPULAN: Pekerjaan ${workNameText} pada area ${areaText} (Total: ${comparisons.length} point) telah selesai dilaksanakan 100% sesuai lingkup pekerjaan & spesifikasi teknis. Seluruh dokumentasi Before dan After terlampir di atas.`,
                    size: 13, bold: true
                })
            ]
        })
    );

    // Signatures
    const sigRowTitle = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dibuat Oleh:", bold: true, size: 14 })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Diperiksa Oleh:", bold: true, size: 14 })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Disetujui Oleh:", bold: true, size: 14 })] })] })
        ]
    });

    const sigRowSpace = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n", size: 12 })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n", size: 12 })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n", size: 12 })] })
        ]
    });

    const sigRowNames = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.supervisor || 'Ir. Budi Santoso'})`, bold: true, size: 13 }), new TextRun({ text: "\nPelaksana", size: 12, color: "64748B" })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.contractor || 'PT. Jaya Konstruksi'})`, bold: true, size: 13 }), new TextRun({ text: "\nSite Manager", size: 12, color: "64748B" })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.client || 'PT. Nusantara Land'})`, bold: true, size: 13 }), new TextRun({ text: "\nKonsultan MK / Owner", size: 12, color: "64748B" })] })] })
        ]
    });

    docChildren.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [sigRowTitle, sigRowSpace, sigRowNames]
        })
    );

    // Create Document (Single .docx file with automatic page breaks)
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            width: 11906,  // A4 Width
                            height: 16838   // A4 Height
                        },
                        margin: {
                            top: 720,      // 0.5 inch margin
                            bottom: 720,
                            left: 720,
                            right: 720
                        }
                    }
                },
                headers: { default: docHeader },
                footers: { default: docFooter },
                children: docChildren
            }
        ]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Laporan_Pekerjaan_Full_${(report.noBap || 'BAP').replace(/\//g, '_')}.docx`;
    if (window.saveAs) {
        window.saveAs(blob, fileName);
    } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
