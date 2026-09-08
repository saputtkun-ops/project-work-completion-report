/**
 * DOCX GENERATOR ENGINE FOR LAPORAN PEKERJAAN PROYEK
 * Generates genuine Microsoft Word (.docx) files compatible with MS Word 2016-365.
 */

async function exportReportToDocx(report) {
    if (!window.docx) {
        alert("Library docx.umd.js belum dimuat dengan benar.");
        return;
    }

    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        ImageRun, Header, Footer, PageNumber, NumberFormat, WidthType,
        AlignmentType, BorderStyle, HeadingLevel
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

    // Colors
    const COLOR_NAVY = "0F172A";
    const COLOR_PRIMARY = "1E3A8A";
    const COLOR_GRAY_BG = "F8FAFC";
    const COLOR_BORDER = "CBD5E1";
    const COLOR_TEXT = "1E293B";

    // Standard Border definition
    const cellBorder = {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
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
                                            new TextRun({ text: (report.contractor || "PT. JAYA KONSTRUKSI").toUpperCase(), bold: true, size: 18, color: COLOR_NAVY })
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
                                            new TextRun({ text: report.projectName || "Proyek Konstruksi", bold: true, size: 16, color: "64748B" })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            new Paragraph({ text: "", space: { after: 100 } })
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
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: "Project Work Completion Report", size: 16, color: "94A3B8" })
                                        ]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                borders: noBorder,
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.RIGHT,
                                        children: [
                                            new TextRun({ text: "Halaman ", size: 16, color: "94A3B8" }),
                                            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "94A3B8" }),
                                            new TextRun({ text: " dari ", size: 16, color: "94A3B8" }),
                                            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "94A3B8" })
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

    // Content children
    const docChildren = [];

    // Title Section
    docChildren.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            space: { before: 200, after: 60 },
            children: [
                new TextRun({ text: "LAPORAN PEKERJAAN SELESAI", bold: true, size: 36, color: COLOR_PRIMARY })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            space: { after: 300 },
            children: [
                new TextRun({ text: "WORK COMPLETION REPORT", bold: true, size: 20, color: "64748B" })
            ]
        })
    );

    // Info Table
    const infoRows = [
        ["Nama Proyek", report.projectName || "-", "Nomor Laporan", report.noBap || "-"],
        ["Lokasi Proyek", report.location || "-", "Tanggal Laporan", report.workDate || "-"],
        ["Nama Pekerjaan", report.workName || report.workItems?.[0]?.description || "-", "Jenis Pekerjaan", report.workType || "Konstruksi / Sipil"],
        ["Area Pekerjaan", report.area || "-", "Pelaksana / Supervisor", report.supervisor || "-"],
        ["Kontraktor", report.contractor || "-", "Owner / Client", report.client || "Owner Proyek"]
    ];

    const tableRows = infoRows.map(row => {
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_GRAY_BG },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 18, color: COLOR_NAVY })] })]
                }),
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 18 })] })]
                }),
                new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_GRAY_BG },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[2], bold: true, size: 18, color: COLOR_NAVY })] })]
                }),
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: row[3], size: 18 })] })]
                })
            ]
        });
    });

    docChildren.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
        }),
        new Paragraph({ text: "", space: { after: 300 } })
    );

    // SECTION 1: DOKUMENTASI BEFORE
    docChildren.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            space: { before: 200, after: 120 },
            children: [
                new TextRun({ text: "1. DOKUMENTASI BEFORE (KONDISI AWAL)", bold: true, size: 22, color: COLOR_PRIMARY })
            ]
        })
    );

    if (report.beforePhotos && report.beforePhotos.length > 0) {
        for (let i = 0; i < report.beforePhotos.length; i++) {
            const photo = report.beforePhotos[i];
            const numStr = String(i + 1).padStart(2, '0');
            const imgBuffer = await urlToUint8Array(photo.url);

            const cells = [];
            if (imgBuffer) {
                cells.push(
                    new TableCell({
                        width: { size: 45, type: WidthType.PERCENTAGE },
                        borders: cellBorder,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: imgBuffer,
                                        transformation: { width: 220, height: 165 }
                                    })
                                ]
                            })
                        ]
                    })
                );
            }

            cells.push(
                new TableCell({
                    width: { size: imgBuffer ? 55 : 100, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [
                        new Paragraph({ children: [new TextRun({ text: `Before ${numStr}`, bold: true, size: 20, color: COLOR_PRIMARY })] }),
                        new Paragraph({ children: [new TextRun({ text: "Lokasi / Area: ", bold: true, size: 18 }), new TextRun({ text: photo.area || report.area || "-", size: 18 })] }),
                        new Paragraph({ space: { before: 60 }, children: [new TextRun({ text: "Kondisi Sebelum Pekerjaan: ", bold: true, size: 18 }), new TextRun({ text: photo.condition || "Kondisi awal sebelum dilakukan perbaikan/pemasangan.", size: 18 })] }),
                        photo.notes ? new Paragraph({ space: { before: 60 }, children: [new TextRun({ text: "Catatan: ", bold: true, size: 18 }), new TextRun({ text: photo.notes, size: 18 })] }) : new Paragraph({ text: "" })
                    ]
                })
            );

            docChildren.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [new TableRow({ children: cells })]
                }),
                new Paragraph({ text: "", space: { after: 150 } })
            );
        }
    } else {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: "Tidak ada dokumentasi BEFORE.", italic: true, size: 18 })] }));
    }

    // SECTION 2: DOKUMENTASI AFTER
    docChildren.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            space: { before: 250, after: 120 },
            children: [
                new TextRun({ text: "2. DOKUMENTASI AFTER (HASIL PEKERJAAN)", bold: true, size: 22, color: COLOR_PRIMARY })
            ]
        })
    );

    if (report.afterPhotos && report.afterPhotos.length > 0) {
        for (let i = 0; i < report.afterPhotos.length; i++) {
            const photo = report.afterPhotos[i];
            const numStr = String(i + 1).padStart(2, '0');
            const imgBuffer = await urlToUint8Array(photo.url);

            const cells = [];
            if (imgBuffer) {
                cells.push(
                    new TableCell({
                        width: { size: 45, type: WidthType.PERCENTAGE },
                        borders: cellBorder,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: imgBuffer,
                                        transformation: { width: 220, height: 165 }
                                    })
                                ]
                            })
                        ]
                    })
                );
            }

            cells.push(
                new TableCell({
                    width: { size: imgBuffer ? 55 : 100, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [
                        new Paragraph({ children: [new TextRun({ text: `After ${numStr}`, bold: true, size: 20, color: "059669" })] }),
                        new Paragraph({ children: [new TextRun({ text: "Lokasi / Area: ", bold: true, size: 18 }), new TextRun({ text: photo.area || report.area || "-", size: 18 })] }),
                        new Paragraph({ space: { before: 60 }, children: [new TextRun({ text: "Cara Penyelesaian / Pekerjaan: ", bold: true, size: 18 }), new TextRun({ text: photo.method || "Pekerjaan dilaksanakan sesuai spesifikasi teknis standar.", size: 18 })] }),
                        new Paragraph({ space: { before: 60 }, children: [new TextRun({ text: "Hasil Pekerjaan: ", bold: true, size: 18 }), new TextRun({ text: photo.result || "Pekerjaan selesai 100% dan terverifikasi rapi.", size: 18 })] }),
                        photo.notes ? new Paragraph({ space: { before: 60 }, children: [new TextRun({ text: "Catatan: ", bold: true, size: 18 }), new TextRun({ text: photo.notes, size: 18 })] }) : new Paragraph({ text: "" })
                    ]
                })
            );

            docChildren.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [new TableRow({ children: cells })]
                }),
                new Paragraph({ text: "", space: { after: 150 } })
            );
        }
    } else {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: "Tidak ada dokumentasi AFTER.", italic: true, size: 18 })] }));
    }

    // SECTION 3: BEFORE VS AFTER COMPARISON
    docChildren.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            space: { before: 250, after: 120 },
            children: [
                new TextRun({ text: "3. BEFORE & AFTER COMPARISON (PERBANDINGAN PROGRES)", bold: true, size: 22, color: COLOR_PRIMARY })
            ]
        })
    );

    const comparisons = report.comparisons || [];
    if (comparisons.length > 0) {
        for (let i = 0; i < comparisons.length; i++) {
            const comp = comparisons[i];
            const numStr = String(i + 1).padStart(2, '0');

            const beforeImgBuffer = comp.beforeUrl ? await urlToUint8Array(comp.beforeUrl) : null;
            const afterImgBuffer = comp.afterUrl ? await urlToUint8Array(comp.afterUrl) : null;

            const tableRowImages = new TableRow({
                children: [
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: cellBorder,
                        shading: { fill: COLOR_GRAY_BG },
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `BEFORE (${comp.area || 'Area'})`, bold: true, size: 18, color: COLOR_PRIMARY })] }),
                            beforeImgBuffer ? new Paragraph({
                                alignment: AlignmentType.CENTER,
                                space: { before: 60 },
                                children: [new ImageRun({ data: beforeImgBuffer, transformation: { width: 220, height: 160 } })]
                            }) : new Paragraph({ text: "[Foto Before]", italic: true })
                        ]
                    }),
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: cellBorder,
                        shading: { fill: COLOR_GRAY_BG },
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `AFTER (${comp.area || 'Area'})`, bold: true, size: 18, color: "059669" })] }),
                            afterImgBuffer ? new Paragraph({
                                alignment: AlignmentType.CENTER,
                                space: { before: 60 },
                                children: [new ImageRun({ data: afterImgBuffer, transformation: { width: 220, height: 160 } })]
                            }) : new Paragraph({ text: "[Foto After]", italic: true })
                        ]
                    })
                ]
            });

            const tableRowText = new TableRow({
                children: [
                    new TableCell({
                        borders: cellBorder,
                        children: [
                            new Paragraph({ children: [new TextRun({ text: "Kondisi Awal: ", bold: true, size: 16 }), new TextRun({ text: comp.beforeDesc || "-", size: 16 })] })
                        ]
                    }),
                    new TableCell({
                        borders: cellBorder,
                        children: [
                            new Paragraph({ children: [new TextRun({ text: "Cara Penyelesaian: ", bold: true, size: 16 }), new TextRun({ text: comp.methodDesc || "-", size: 16 })] }),
                            new Paragraph({ space: { before: 40 }, children: [new TextRun({ text: "Hasil Pekerjaan: ", bold: true, size: 16 }), new TextRun({ text: comp.afterDesc || "-", size: 16 })] })
                        ]
                    })
                ]
            });

            docChildren.push(
                new Paragraph({ children: [new TextRun({ text: `Comparison ${numStr}: ${comp.area || 'Area Pekerjaan'}`, bold: true, size: 18, color: COLOR_NAVY })] }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [tableRowImages, tableRowText]
                }),
                new Paragraph({ text: "", space: { after: 180 } })
            );
        }
    } else {
        docChildren.push(new Paragraph({ children: [new TextRun({ text: "Tidak ada pasangan Before & After Comparison.", italic: true, size: 18 })] }));
    }

    // SECTION 4: KESIMPULAN
    const workNameText = report.workName || report.workItems?.[0]?.description || "Pekerjaan Lapangan";
    const areaText = report.area || report.location || "Area Proyek";
    
    docChildren.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            space: { before: 250, after: 120 },
            children: [
                new TextRun({ text: "4. KESIMPULAN & VERIFIKASI", bold: true, size: 22, color: COLOR_PRIMARY })
            ]
        }),
        new Paragraph({
            space: { after: 200 },
            children: [
                new TextRun({
                    text: `Pekerjaan ${workNameText} pada area ${areaText} telah selesai dilaksanakan 100% sesuai dengan lingkup pekerjaan dan spesifikasi teknis yang ditentukan. Dokumentasi Before dan After terlampir sebagai bukti serah terima pekerjaan.`,
                    size: 18
                })
            ]
        })
    );

    // Signatures Table
    const sigRowTitle = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dibuat Oleh:", bold: true, size: 18 })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Diperiksa Oleh:", bold: true, size: 18 })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Disetujui Oleh:", bold: true, size: 18 })] })] })
        ]
    });

    const sigRowSpace = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n\n", size: 18 })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n\n", size: 18 })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ text: "\n\n\n", size: 18 })] })
        ]
    });

    const sigRowNames = new TableRow({
        children: [
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.supervisor || 'Pelaksana Lapangan'})`, bold: true, size: 18 }), new TextRun({ text: "\nSupervisor / Site Engineer", size: 16, color: "64748B" })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.contractor || 'Site Manager'})`, bold: true, size: 18 }), new TextRun({ text: "\nProject Manager", size: 16, color: "64748B" })] })] }),
            new TableCell({ borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(${report.client || 'Owner / MK'})`, bold: true, size: 18 }), new TextRun({ text: "\nKonsultan MK / Owner", size: 16, color: "64748B" })] })] })
        ]
    });

    docChildren.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [sigRowTitle, sigRowSpace, sigRowNames]
        })
    );

    // Construct Document
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            width: 11906, // A4 Width in twips
                            height: 16838  // A4 Height in twips
                        },
                        margin: {
                            top: 1440,    // 1 inch
                            bottom: 1440,
                            left: 1440,
                            right: 1440
                        }
                    }
                },
                headers: { default: docHeader },
                footers: { default: docFooter },
                children: docChildren
            }
        ]
    });

    // Pack & Download Blob
    const blob = await Packer.toBlob(doc);
    const fileName = `Laporan_Pekerjaan_${(report.noBap || 'BAP').replace(/\//g, '_')}.docx`;
    if (window.saveAs) {
        window.saveAs(blob, fileName);
    } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
