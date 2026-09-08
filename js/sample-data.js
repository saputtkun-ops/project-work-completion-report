/**
 * SAMPLE INITIAL DATA FOR LAPORAN PEKERJAAN PROYEK (4 POINTS SINGLE A4 PAGE)
 */

const INITIAL_PROJECTS = [
    { id: "PRJ-001", name: "Pembangunan Gedung A" },
    { id: "PRJ-002", name: "Renovasi Rumah Sakit Sehat" }
];

const INITIAL_REPORTS = [
    {
        id: "REP-2026-001",
        projectName: "Pembangunan Gedung A",
        noBap: "WCR/2026/09/001",
        workDate: "2026-09-08",
        location: "Gedung A - Lantai 2",
        supervisor: "Ir. Budi Santoso",
        contractor: "PT. Jaya Konstruksi",
        client: "PT. Nusantara Land",
        workNo: "WO-8842",
        
        workName: "Pemasangan Keramik & Finishing Toilet",
        workType: "Finishing / Arsitektur",
        area: "Toilet Pria Lt. 2",
        status: "Selesai",
        
        beforePhotos: [
            { id: "b1", url: "assets/img/concrete.jpg", area: "Area 01 - Lantai Utama", condition: "Permukaan lantai masih berupa screed beton kasar.", notes: "Cleaned" },
            { id: "b2", url: "assets/img/rebar.jpg", area: "Area 02 - Floor Drain", condition: "Pipa buangan air belum dipasang saringan.", notes: "Inspected" },
            { id: "b3", url: "assets/img/brickwork.jpg", area: "Area 03 - Dinding Bata", condition: "Dinding belum diplester dan di-acian.", notes: "Raw brick" },
            { id: "b4", url: "assets/img/earthwork.jpg", area: "Area 04 - Pondasi Wastafel", condition: "Area kedudukan saluran pipa belum rapi.", notes: "Prepared" }
        ],
        
        afterPhotos: [
            { id: "a1", url: "assets/img/brickwork.jpg", area: "Area 01 - Lantai Utama", method: "Pemasangan keramik 40x40cm mortar instan.", result: "Keramik rata, nat rapi, elevasi pas.", notes: "OK" },
            { id: "a2", url: "assets/img/earthwork.jpg", area: "Area 02 - Floor Drain", method: "Pemasangan saringan stainless steel.", result: "Air mengalir lancar tanpa genangan.", notes: "OK" },
            { id: "a3", url: "assets/img/concrete.jpg", area: "Area 03 - Dinding Bata", method: "Plesteran mortar instan & cat kalsimo.", result: "Dinding halus & putih bersih.", notes: "OK" },
            { id: "a4", url: "assets/img/rebar.jpg", area: "Area 04 - Pondasi Wastafel", method: "Instalasi bracket & unit wastafel.", result: "Wastafel kokoh & siap pakai.", notes: "OK" }
        ],
        
        comparisons: [
            {
                id: "c1",
                area: "Point 01: Area Lantai Utama",
                beforeUrl: "assets/img/concrete.jpg",
                beforeDesc: "Screed beton kasar belum terpasang keramik.",
                afterUrl: "assets/img/brickwork.jpg",
                methodDesc: "Pemasangan keramik 40x40cm presisi.",
                afterDesc: "Keramik terpasang rapi & mengkilap."
            },
            {
                id: "c2",
                area: "Point 02: Area Floor Drain",
                beforeUrl: "assets/img/rebar.jpg",
                beforeDesc: "Saluran buangan belum ada saringan stainless.",
                afterUrl: "assets/img/earthwork.jpg",
                methodDesc: "Pemasangan floor drain 2 inci.",
                afterDesc: "Floor drain rata presisi & air lancar."
            },
            {
                id: "c3",
                area: "Point 03: Dinding & Plesteran",
                beforeUrl: "assets/img/brickwork.jpg",
                beforeDesc: "Pasangan bata belum diplester.",
                afterUrl: "assets/img/concrete.jpg",
                methodDesc: "Plesteran instan & acian halus.",
                afterDesc: "Dinding rapi, rata, dan terawat."
            },
            {
                id: "c4",
                area: "Point 04: Meja Wastafel",
                beforeUrl: "assets/img/earthwork.jpg",
                beforeDesc: "Pipa air bersih & kotor belum tersambung.",
                afterUrl: "assets/img/rebar.jpg",
                methodDesc: "Pemasangan pipa & saniter.",
                afterDesc: "Saniter berfungsi normal tanpa bocor."
            }
        ]
    }
];
