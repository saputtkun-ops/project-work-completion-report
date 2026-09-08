/**
 * DOCX GENERATOR ENGINE FOR LAPORAN PEKERJAAN PROYEK (1 PAGE A4 - 4 POINTS BEFORE & AFTER)
 * Generates genuine Microsoft Word (.docx) files that fit 4 points of Before & After documentation into 1 single A4 Portrait page!
 */

async function exportReportToDocx(report) {
    if (!window.docx) {
        alert("Library docx.umd.js belum dimuat dengan benar.");
        return;
    }

    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        ImageRun, Header, Footer, PageNumber, WidthType, AlignmentType, BorderStyle
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

    // Title
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

    // Section Header
    docChildren.push(
        new Paragraph({
            space: { before: 40, after: 40 },
            children: [
                new TextRun({ text: "DOKUMENTASI BEFORE & AFTER (4 POINT PEKERJAAN)", bold: true, size: 17, color: COLOR_PRIMARY })
            ]
        })
    );

    // 4 Points Comparisons (Fit 4 Points on 1 Page)
    const comparisons = report.comparisons && report.comparisons.length >= 4 
        ? report.comparisons.slice(0, 4)
        : [
            report.comparisons?.[0] || { area: "Point 01: Area Utama", beforeUrl: "assets/img/concrete.jpg", beforeDesc: "Screed beton belum terpasang keramik.", afterUrl: "assets/img/brickwork.jpg", methodDesc: "Pemasangan keramik 40x40cm.", afterDesc: "Keramik terpasang rapi 100%." },
            report.comparisons?.[1] || { area: "Point 02: Area Drainase", beforeUrl: "assets/img/rebar.jpg", beforeDesc: "Pipa buangan belum ada floor drain.", afterUrl: "assets/img/earthwork.jpg", methodDesc: "Pemasangan saringan stainless.", afterDesc: "Floor drain terpasang rata & lancar." },
            report.comparisons?.[2] || { area: "Point 03: Area Dinding", beforeUrl: "assets/img/brickwork.jpg", beforeDesc: "Pasangan bata belum diplester.", afterUrl: "assets/img/concrete.jpg", methodDesc: "Plesteran & acian halus.", afterDesc: "Dinding rapi & halus." },
            report.comparisons?.[3] || { area: "Point 04: Saniter & Pipe", beforeUrl: "assets/img/earthwork.jpg", beforeDesc: "Pipa air bersih & kotor terbuka.", afterUrl: "assets/img/rebar.jpg", methodDesc: "Instalasi fixture saniter.", afterDesc: "Saniter berfungsi tanpa bocor." }
        ];

    const compRows = [];

    for (let i = 0; i < comparisons.length; i++) {
        const comp = comparisons[i];
        const numStr = String(i + 1).padStart(2, '0');

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
        new Paragraph({ text: "", space: { after: 60 } })
    );

    // Compact Kesimpulan
    const workNameText = report.workName || "Pemasangan Keramik & Finishing";
    const areaText = report.area || report.location || "Toilet Pria Lt. 2";

    docChildren.push(
        new Paragraph({
            space: { before: 20, after: 40 },
            children: [
                new TextRun({
                    text: `KESIMPULAN: Pekerjaan ${workNameText} pada area ${areaText} (4 point) telah selesai dilaksanakan 100% sesuai lingkup pekerjaan & spesifikasi teknis. Dokumentasi Before dan After terlampir di atas.`,
                    size: 13, bold: true
                })
            ]
        })
    );

    // Compact Signatures
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

    // Create 1 Page Document (Margin: 0.5 in / 720 twips)
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
    const fileName = `Laporan_Pekerjaan_1Lembar_${(report.noBap || 'BAP').replace(/\//g, '_')}.docx`;
    if (window.saveAs) {
        window.saveAs(blob, fileName);
    } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
