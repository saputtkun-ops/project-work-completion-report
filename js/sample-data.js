/**
 * SAMPLE INITIAL DATA FOR LAPORAN PEKERJAAN PROYEK
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
        location: "Gedung A - Lantai 2 - Toilet Pria",
        supervisor: "Ir. Budi Santoso",
        contractor: "PT. Jaya Konstruksi",
        client: "PT. Nusantara Land",
        workNo: "WO-8842",
        
        workName: "Pemasangan Keramik Lantai",
        workType: "Finishing / Arsitektur",
        area: "Bathroom Lt. 2",
        status: "Selesai",
        
        beforePhotos: [
            {
                id: "b1",
                url: "assets/img/concrete.jpg",
                area: "Bathroom Lt. 2",
                condition: "Permukaan lantai masih berupa screed beton dan belum dilakukan pemasangan finishing keramik.",
                notes: "Area telah dibersihkan dari puing material."
            },
            {
                id: "b2",
                url: "assets/img/rebar.jpg",
                area: "Area Floor Drain",
                condition: "Pipa drainase belum terpasang leveling waterproof.",
                notes: "Inspeksi jaringan pipa OK."
            }
        ],
        
        afterPhotos: [
            {
                id: "a1",
                url: "assets/img/brickwork.jpg",
                area: "Bathroom Lt. 2",
                method: "Dilakukan pemasangan keramik lantai menggunakan adhesive mortar instan sesuai spesifikasi material dan dilakukan pengecekan level.",
                result: "Pekerjaan keramik lantai telah selesai 100%, permukaan rata dan elevasi kemiringan menuju floor drain tepat.",
                notes: "Nat keramik terisi rapi."
            },
            {
                id: "a2",
                url: "assets/img/earthwork.jpg",
                area: "Area Floor Drain",
                method: "Pemasangan saringan floor drain stainless steel terintegrasi dengan keramik.",
                result: "Air mengalir lancar tanpa genangan.",
                notes: "Pengecekan air selesai."
            }
        ],
        
        comparisons: [
            {
                id: "c1",
                area: "Bathroom Lt. 2",
                beforeUrl: "assets/img/concrete.jpg",
                beforeDesc: "Permukaan lantai masih berupa screed kasar dan lantai belum terpasang keramik.",
                afterUrl: "assets/img/brickwork.jpg",
                methodDesc: "Dilakukan pemasangan keramik 40x40 cm dengan perekat instan dan nat warna matching.",
                afterDesc: "Keramik terpasang rapi, simetris, dan kemiringan air mengalir sempurna ke saringan."
            },
            {
                id: "c2",
                area: "Area Floor Drain",
                beforeUrl: "assets/img/rebar.jpg",
                beforeDesc: "Pipa buangan lantai belum terpasang saringan floor drain.",
                afterUrl: "assets/img/earthwork.jpg",
                methodDesc: "Pemasangan saringan stainless steel 2 inci dan di-seal tahan air.",
                afterDesc: "Floor drain terpasang presisi selevel permukaan keramik."
            }
        ]
    }
];
