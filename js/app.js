/**
 * LAPORAN PEKERJAAN PROYEK - WORK COMPLETION REPORT CORE ENGINE
 * Features: Auto-Save Engine (LocalStorage & Draft Persistence across Browser Sessions), Multi-Page A4 Export, & Docx Engine.
 */

class ProjectReportApp {
    constructor() {
        this.reports = [];
        this.activeTab = 'dashboard';
        this.editingReportId = null;
        
        // Active Form Arrays
        this.currentBeforePhotos = [];
        this.currentAfterPhotos = [];
        this.currentComparisons = [];
        
        this.autoSaveTimer = null;
        
        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.setupDropzones();
        this.setupRealtimeFormAutoSave();
        this.renderDashboard();
        this.renderFilteredTable();
        
        // Check for saved active draft on startup, otherwise load initial form
        if (!this.restoreActiveFormDraft()) {
            this.resetForm();
        }
    }

    /* ==========================================================================
       LOCALSTORAGE AUTO-SAVE & SESSION PERSISTENCE ENGINE
       ========================================================================== */

    loadState() {
        const savedReports = localStorage.getItem('laporan_proyek_reports');
        if (savedReports) {
            try {
                this.reports = JSON.parse(savedReports);
            } catch (e) {
                console.error("Failed to load saved reports", e);
                this.reports = [...INITIAL_REPORTS];
            }
        } else {
            this.reports = [...INITIAL_REPORTS];
            this.saveState();
        }
    }

    saveState() {
        localStorage.setItem('laporan_proyek_reports', JSON.stringify(this.reports));
        this.triggerAutoSaveIndicator();
    }

    triggerAutoSaveIndicator() {
        const badge = document.getElementById('autoSaveIndicator');
        if (badge) {
            badge.style.transform = 'scale(1.05)';
            badge.style.opacity = '1';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 300);
        }
    }

    setupRealtimeFormAutoSave() {
        const form = document.getElementById('reportForm');
        if (!form) return;

        // Auto-save active form inputs on typing / changing
        const inputHandler = () => {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveActiveFormDraft();
            }, 500);
        };

        form.querySelectorAll('input, select, textarea').forEach(elem => {
            elem.addEventListener('input', inputHandler);
            elem.addEventListener('change', inputHandler);
        });
    }

    saveActiveFormDraft() {
        const draft = this.getFormData('Draft');
        localStorage.setItem('laporan_proyek_active_draft', JSON.stringify(draft));
        this.triggerAutoSaveIndicator();
    }

    restoreActiveFormDraft() {
        const savedDraft = localStorage.getItem('laporan_proyek_active_draft');
        if (!savedDraft) return false;

        try {
            const draft = JSON.parse(savedDraft);
            if (!draft || !draft.noBap) return false;

            document.getElementById('reportId').value = draft.id || '';
            document.getElementById('formProjectName').value = draft.projectName || '';
            document.getElementById('formNoBap').value = draft.noBap || '';
            document.getElementById('formWorkDate').value = draft.workDate || '';
            document.getElementById('formLocation').value = draft.location || '';
            document.getElementById('formSupervisor').value = draft.supervisor || '';
            document.getElementById('formContractor').value = draft.contractor || '';
            document.getElementById('formClient').value = draft.client || '';
            document.getElementById('formWorkNo').value = draft.workNo || '';

            document.getElementById('formWorkName').value = draft.workName || '';
            document.getElementById('formWorkType').value = draft.workType || '';
            document.getElementById('formArea').value = draft.area || '';

            this.currentBeforePhotos = draft.beforePhotos || [];
            this.currentAfterPhotos = draft.afterPhotos || [];
            this.currentComparisons = draft.comparisons || [];

            this.renderBeforePhotos();
            this.renderAfterPhotos();
            this.renderComparisons();
            return true;
        } catch (e) {
            console.error("Failed to restore form draft", e);
            return false;
        }
    }

    clearActiveFormDraft() {
        localStorage.removeItem('laporan_proyek_active_draft');
    }

    /* ==========================================================================
       NAVIGATION & TABS
       ========================================================================== */

    bindEvents() {
        // Toggle Sidebar on Mobile & Tablet
        const toggleBtn = document.getElementById('toggleSidebarBtn');
        const sidebar = document.getElementById('sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Tab buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
                if (sidebar) sidebar.classList.remove('open');
            });
        });

        // Top Header create button
        const btnHeader = document.getElementById('btnHeaderCreate');
        if (btnHeader) {
            btnHeader.addEventListener('click', () => {
                this.resetForm();
                this.switchTab('create-report');
            });
        }
    }

    switchTab(tabId) {
        this.activeTab = tabId;

        // Nav active state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // Tab pane visibility
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
        }

        // Title update
        const titleMap = {
            'dashboard': 'Dashboard Laporan Proyek',
            'create-report': 'Buat / Edit Laporan Pekerjaan Selesai',
            'reports-all': 'Daftar Semua Laporan Pekerjaan',
            'reports-draft': 'Daftar Laporan Status Draft',
            'reports-completed': 'Daftar Laporan Status Selesai',
            'settings': 'Pengaturan System'
        };
        document.getElementById('pageTitle').innerText = titleMap[tabId] || 'Laporan Pekerjaan Proyek';

        if (tabId === 'dashboard') {
            this.renderDashboard();
        } else if (tabId.startsWith('reports-')) {
            this.renderFilteredTable();
        }
    }

    /* ==========================================================================
       DROPZONES & MULTI-PHOTO UPLOAD (BEFORE & AFTER)
       ========================================================================== */

    setupDropzones() {
        ['beforeDropzone', 'afterDropzone'].forEach(id => {
            const dz = document.getElementById(id);
            if (!dz) return;

            dz.addEventListener('dragover', (e) => {
                e.preventDefault();
                dz.classList.add('dragover');
            });

            dz.addEventListener('dragleave', () => {
                dz.classList.remove('dragover');
            });

            dz.addEventListener('drop', (e) => {
                e.preventDefault();
                dz.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (id === 'beforeDropzone') {
                    this.processBeforeFiles(files);
                } else {
                    this.processAfterFiles(files);
                }
            });
        });
    }

    triggerAddBeforePhoto() {
        document.getElementById('beforeFileInput').click();
    }

    triggerAddAfterPhoto() {
        document.getElementById('afterFileInput').click();
    }

    handleBeforeFiles(e) {
        this.processBeforeFiles(e.target.files);
    }

    handleAfterFiles(e) {
        this.processAfterFiles(e.target.files);
    }

    processBeforeFiles(files) {
        if (!files || files.length === 0) return;
        const defaultArea = document.getElementById('formArea').value || 'Area Utama';

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.currentBeforePhotos.push({
                    id: `b_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
                    url: ev.target.result,
                    area: defaultArea,
                    condition: "Permukaan awal sebelum dilakukan pekerjaan finishing.",
                    notes: ""
                });
                this.renderBeforePhotos();
                this.saveActiveFormDraft();
            };
            reader.readAsDataURL(file);
        });
    }

    processAfterFiles(files) {
        if (!files || files.length === 0) return;
        const defaultArea = document.getElementById('formArea').value || 'Area Utama';

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.currentAfterPhotos.push({
                    id: `a_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
                    url: ev.target.result,
                    area: defaultArea,
                    method: "Pekerjaan dilaksanakan sesuai spesifikasi material & standar teknis.",
                    result: "Pekerjaan selesai 100% dan terverifikasi rapi.",
                    notes: ""
                });
                this.renderAfterPhotos();
                this.saveActiveFormDraft();
            };
            reader.readAsDataURL(file);
        });
    }

    /* RENDER BEFORE PHOTOS CARDS */
    renderBeforePhotos() {
        const container = document.getElementById('beforePhotosContainer');
        if (!container) return;

        if (this.currentBeforePhotos.length === 0) {
            container.innerHTML = `<p class="text-muted p-3">Belum ada foto BEFORE yang diunggah.</p>`;
            return;
        }

        let html = '';
        this.currentBeforePhotos.forEach((photo, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            html += `
                <div class="photo-card" id="bcard_${idx}">
                    <div class="photo-card-header">
                        <span class="photo-badge badge-before">Before ${numStr}</span>
                        <div class="photo-card-actions">
                            <button type="button" onclick="app.moveBeforePhoto(${idx}, -1)" ${idx===0?'disabled':''} title="Pindah Ke Atas"><i class="fa-solid fa-arrow-up"></i></button>
                            <button type="button" onclick="app.moveBeforePhoto(${idx}, 1)" ${idx===this.currentBeforePhotos.length-1?'disabled':''} title="Pindah Ke Bawah"><i class="fa-solid fa-arrow-down"></i></button>
                            <button type="button" onclick="app.removeBeforePhoto(${idx})" title="Hapus Foto"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="photo-card-body">
                        <div class="photo-preview-box">
                            <img src="${photo.url}" alt="Before ${numStr}">
                        </div>
                        <div class="form-group mb-2">
                            <label>Lokasi / Area:</label>
                            <input type="text" class="form-control form-control-sm" value="${photo.area}" onchange="app.updateBeforePhoto(${idx}, 'area', this.value)">
                        </div>
                        <div class="form-group mb-2">
                            <label>Kondisi Sebelum Pekerjaan:</label>
                            <textarea class="form-control form-control-sm" rows="2" onchange="app.updateBeforePhoto(${idx}, 'condition', this.value)">${photo.condition}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Catatan (Opsional):</label>
                            <input type="text" class="form-control form-control-sm" value="${photo.notes || ''}" placeholder="Catatan tambahan" onchange="app.updateBeforePhoto(${idx}, 'notes', this.value)">
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    updateBeforePhoto(idx, key, val) {
        if (this.currentBeforePhotos[idx]) {
            this.currentBeforePhotos[idx][key] = val;
            this.saveActiveFormDraft();
        }
    }

    moveBeforePhoto(idx, dir) {
        const target = idx + dir;
        if (target >= 0 && target < this.currentBeforePhotos.length) {
            const temp = this.currentBeforePhotos[idx];
            this.currentBeforePhotos[idx] = this.currentBeforePhotos[target];
            this.currentBeforePhotos[target] = temp;
            this.renderBeforePhotos();
            this.saveActiveFormDraft();
        }
    }

    removeBeforePhoto(idx) {
        this.currentBeforePhotos.splice(idx, 1);
        this.renderBeforePhotos();
        this.saveActiveFormDraft();
    }

    /* RENDER AFTER PHOTOS CARDS */
    renderAfterPhotos() {
        const container = document.getElementById('afterPhotosContainer');
        if (!container) return;

        if (this.currentAfterPhotos.length === 0) {
            container.innerHTML = `<p class="text-muted p-3">Belum ada foto AFTER yang diunggah.</p>`;
            return;
        }

        let html = '';
        this.currentAfterPhotos.forEach((photo, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            html += `
                <div class="photo-card" id="acard_${idx}">
                    <div class="photo-card-header">
                        <span class="photo-badge badge-after">After ${numStr}</span>
                        <div class="photo-card-actions">
                            <button type="button" onclick="app.moveAfterPhoto(${idx}, -1)" ${idx===0?'disabled':''} title="Pindah Ke Atas"><i class="fa-solid fa-arrow-up"></i></button>
                            <button type="button" onclick="app.moveAfterPhoto(${idx}, 1)" ${idx===this.currentAfterPhotos.length-1?'disabled':''} title="Pindah Ke Bawah"><i class="fa-solid fa-arrow-down"></i></button>
                            <button type="button" onclick="app.removeAfterPhoto(${idx})" title="Hapus Foto"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="photo-card-body">
                        <div class="photo-preview-box">
                            <img src="${photo.url}" alt="After ${numStr}">
                        </div>
                        <div class="form-group mb-2">
                            <label>Lokasi / Area:</label>
                            <input type="text" class="form-control form-control-sm" value="${photo.area}" onchange="app.updateAfterPhoto(${idx}, 'area', this.value)">
                        </div>
                        <div class="form-group mb-2">
                            <label>Cara Penyelesaian / Pekerjaan:</label>
                            <textarea class="form-control form-control-sm" rows="2" onchange="app.updateAfterPhoto(${idx}, 'method', this.value)">${photo.method}</textarea>
                        </div>
                        <div class="form-group mb-2">
                            <label>Hasil Pekerjaan:</label>
                            <input type="text" class="form-control form-control-sm" value="${photo.result}" onchange="app.updateAfterPhoto(${idx}, 'result', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Catatan (Opsional):</label>
                            <input type="text" class="form-control form-control-sm" value="${photo.notes || ''}" placeholder="Catatan tambahan" onchange="app.updateAfterPhoto(${idx}, 'notes', this.value)">
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    updateAfterPhoto(idx, key, val) {
        if (this.currentAfterPhotos[idx]) {
            this.currentAfterPhotos[idx][key] = val;
            this.saveActiveFormDraft();
        }
    }

    moveAfterPhoto(idx, dir) {
        const target = idx + dir;
        if (target >= 0 && target < this.currentAfterPhotos.length) {
            const temp = this.currentAfterPhotos[idx];
            this.currentAfterPhotos[idx] = this.currentAfterPhotos[target];
            this.currentAfterPhotos[target] = temp;
            this.renderAfterPhotos();
            this.saveActiveFormDraft();
        }
    }

    removeAfterPhoto(idx) {
        this.currentAfterPhotos.splice(idx, 1);
        this.renderAfterPhotos();
        this.saveActiveFormDraft();
    }

    /* ==========================================================================
       BEFORE VS AFTER PAIR COMPARISONS
       ========================================================================== */

    addComparisonPair() {
        const idx = this.currentComparisons.length;
        const bPhoto = this.currentBeforePhotos[idx] || this.currentBeforePhotos[0];
        const aPhoto = this.currentAfterPhotos[idx] || this.currentAfterPhotos[0];

        this.currentComparisons.push({
            id: `c_${Date.now()}_${idx}`,
            area: document.getElementById('formArea').value || `Point ${String(idx+1).padStart(2, '0')}: Area Spesifik`,
            beforeUrl: bPhoto ? bPhoto.url : 'assets/img/concrete.jpg',
            beforeDesc: bPhoto ? bPhoto.condition : 'Kondisi lantai masih berupa screed kasar.',
            afterUrl: aPhoto ? aPhoto.url : 'assets/img/brickwork.jpg',
            methodDesc: aPhoto ? aPhoto.method : 'Dilakukan pemasangan finishing sesuai spesifikasi.',
            afterDesc: aPhoto ? aPhoto.result : 'Pekerjaan selesai 100% dan rapi.'
        });

        this.renderComparisons();
        this.saveActiveFormDraft();
    }

    renderComparisons() {
        const container = document.getElementById('comparisonContainer');
        if (!container) return;

        if (this.currentComparisons.length === 0) {
            container.innerHTML = `<p class="text-muted p-3">Belum ada pasangan Before & After. Klik <strong>Pasangkan Before & After</strong> di atas untuk menambah.</p>`;
            return;
        }

        let html = '';
        this.currentComparisons.forEach((comp, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            html += `
                <div class="comparison-card">
                    <div class="comparison-header">
                        <h4><i class="fa-solid fa-code-compare"></i> Comparison ${numStr}</h4>
                        <button type="button" class="btn btn-sm btn-danger-outline" onclick="app.removeComparison(${idx})">
                            <i class="fa-solid fa-trash"></i> Hapus Pasangan
                        </button>
                    </div>
                    <div class="form-group mb-3">
                        <label>Lokasi / Area Comparison:</label>
                        <input type="text" class="form-control form-control-sm" value="${comp.area}" onchange="app.updateComp(${idx}, 'area', this.value)">
                    </div>
                    <div class="comparison-grid">
                        <div class="comp-col">
                            <h5 class="text-amber"><i class="fa-solid fa-clock-rotate-left"></i> BEFORE</h5>
                            <div class="photo-preview-box">
                                ${comp.beforeUrl ? `<img src="${comp.beforeUrl}">` : `<div class="p-3 text-center text-muted">Pilih foto Before</div>`}
                            </div>
                            <div class="form-group">
                                <label>Deskripsi Kondisi Awal:</label>
                                <textarea class="form-control form-control-sm" rows="2" onchange="app.updateComp(${idx}, 'beforeDesc', this.value)">${comp.beforeDesc}</textarea>
                            </div>
                        </div>
                        <div class="comp-col">
                            <h5 class="text-emerald"><i class="fa-solid fa-circle-check"></i> AFTER</h5>
                            <div class="photo-preview-box">
                                ${comp.afterUrl ? `<img src="${comp.afterUrl}">` : `<div class="p-3 text-center text-muted">Pilih foto After</div>`}
                            </div>
                            <div class="form-group mb-2">
                                <label>Pekerjaan yang Dilakukan:</label>
                                <textarea class="form-control form-control-sm" rows="2" onchange="app.updateComp(${idx}, 'methodDesc', this.value)">${comp.methodDesc}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Hasil Pekerjaan:</label>
                                <input type="text" class="form-control form-control-sm" value="${comp.afterDesc}" onchange="app.updateComp(${idx}, 'afterDesc', this.value)">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    updateComp(idx, key, val) {
        if (this.currentComparisons[idx]) {
            this.currentComparisons[idx][key] = val;
            this.saveActiveFormDraft();
        }
    }

    removeComparison(idx) {
        this.currentComparisons.splice(idx, 1);
        this.renderComparisons();
        this.saveActiveFormDraft();
    }

    /* ==========================================================================
       FORM SAVE & RESET
       ========================================================================== */

    resetForm() {
        this.editingReportId = null;
        document.getElementById('reportForm').reset();
        document.getElementById('reportId').value = '';
        document.getElementById('formTitle').innerText = 'Formulir Laporan Pekerjaan Selesai';

        const todayStr = new Date().toISOString().substring(0, 10);
        const randomNum = String(Math.floor(Math.random() * 900) + 100);
        
        document.getElementById('formProjectName').value = 'Pembangunan Gedung A';
        document.getElementById('formNoBap').value = `WCR/2026/09/${randomNum}`;
        document.getElementById('formWorkDate').value = todayStr;
        document.getElementById('formLocation').value = 'Gedung A - Lantai 2';
        document.getElementById('formSupervisor').value = 'Ir. Budi Santoso';
        document.getElementById('formContractor').value = 'PT. Jaya Konstruksi';
        document.getElementById('formClient').value = 'PT. Nusantara Land';
        document.getElementById('formWorkNo').value = `WO-${randomNum}`;

        document.getElementById('formWorkName').value = 'Pemasangan Keramik & Finishing Toilet';
        document.getElementById('formWorkType').value = 'Finishing / Arsitektur';
        document.getElementById('formArea').value = 'Toilet Pria Lt. 2';

        // Initial 4 points demo data
        this.currentBeforePhotos = [
            { id: 'b1', url: 'assets/img/concrete.jpg', area: 'Area 01 - Lantai Utama', condition: 'Permukaan lantai masih berupa screed beton kasar.', notes: '' },
            { id: 'b2', url: 'assets/img/rebar.jpg', area: 'Area 02 - Floor Drain', condition: 'Pipa buangan air belum dipasang saringan.', notes: '' },
            { id: 'b3', url: 'assets/img/brickwork.jpg', area: 'Area 03 - Dinding Bata', condition: 'Dinding belum diplester dan di-acian.', notes: '' },
            { id: 'b4', url: 'assets/img/earthwork.jpg', area: 'Area 04 - Pondasi Wastafel', condition: 'Area kedudukan saluran pipa belum rapi.', notes: '' }
        ];
        this.currentAfterPhotos = [
            { id: 'a1', url: 'assets/img/brickwork.jpg', area: 'Area 01 - Lantai Utama', method: 'Pemasangan keramik 40x40cm mortar instan.', result: 'Keramik rata, nat rapi, elevasi pas.', notes: '' },
            { id: 'a2', url: 'assets/img/earthwork.jpg', area: 'Area 02 - Floor Drain', method: 'Pemasangan saringan stainless steel.', result: 'Air mengalir lancar tanpa genangan.', notes: '' },
            { id: 'a3', url: 'assets/img/concrete.jpg', area: 'Area 03 - Dinding Bata', method: 'Plesteran mortar instan & acian halus.', result: 'Dinding halus & putih bersih.', notes: '' },
            { id: 'a4', url: 'assets/img/rebar.jpg', area: 'Area 04 - Pondasi Wastafel', method: 'Instalasi bracket & unit wastafel.', result: 'Wastafel kokoh & siap pakai.', notes: '' }
        ];
        this.currentComparisons = [
            { id: 'c1', area: 'Point 01: Area Lantai Utama', beforeUrl: 'assets/img/concrete.jpg', beforeDesc: 'Screed beton kasar belum terpasang keramik.', afterUrl: 'assets/img/brickwork.jpg', methodDesc: 'Pemasangan keramik 40x40cm presisi.', afterDesc: 'Keramik terpasang rapi 100%.' },
            { id: 'c2', area: 'Point 02: Area Floor Drain', beforeUrl: 'assets/img/rebar.jpg', beforeDesc: 'Saluran buangan belum ada saringan stainless.', afterUrl: 'assets/img/earthwork.jpg', methodDesc: 'Pemasangan floor drain 2 inci.', afterDesc: 'Floor drain terpasang rata & air lancar.' },
            { id: 'c3', area: 'Point 03: Dinding & Plesteran', beforeUrl: 'assets/img/brickwork.jpg', beforeDesc: 'Pasangan bata belum diplester.', afterUrl: 'assets/img/concrete.jpg', methodDesc: 'Plesteran instan & acian halus.', afterDesc: 'Dinding rapi, rata, dan terawat.' },
            { id: 'c4', area: 'Point 04: Meja Wastafel', beforeUrl: 'assets/img/earthwork.jpg', beforeDesc: 'Pipa air bersih & kotor belum tersambung.', afterUrl: 'assets/img/rebar.jpg', methodDesc: 'Pemasangan pipa & saniter.', afterDesc: 'Saniter berfungsi normal tanpa bocor.' }
        ];

        this.renderBeforePhotos();
        this.renderAfterPhotos();
        this.renderComparisons();
        this.clearActiveFormDraft();
    }

    getFormData(statusStr = 'Selesai') {
        const id = document.getElementById('reportId').value || `REP-${Date.now()}`;
        return {
            id,
            projectName: document.getElementById('formProjectName').value,
            noBap: document.getElementById('formNoBap').value,
            workDate: document.getElementById('formWorkDate').value,
            location: document.getElementById('formLocation').value,
            supervisor: document.getElementById('formSupervisor').value,
            contractor: document.getElementById('formContractor').value,
            client: document.getElementById('formClient').value,
            workNo: document.getElementById('formWorkNo').value,
            
            workName: document.getElementById('formWorkName').value,
            workType: document.getElementById('formWorkType').value,
            area: document.getElementById('formArea').value,
            status: statusStr,
            
            beforePhotos: [...this.currentBeforePhotos],
            afterPhotos: [...this.currentAfterPhotos],
            comparisons: [...this.currentComparisons]
        };
    }

    handleFormSubmit(e) {
        e.preventDefault();
        this.saveReport('Selesai');
    }

    saveReport(statusStr = 'Selesai') {
        const report = this.getFormData(statusStr);
        const idx = this.reports.findIndex(r => r.id === report.id);
        
        if (idx >= 0) {
            this.reports[idx] = report;
        } else {
            this.reports.unshift(report);
        }

        this.saveState();
        this.clearActiveFormDraft();
        alert(`Laporan [${report.noBap}] berhasil disimpan secara permanen sebagai [${statusStr}]!`);
        this.switchTab(statusStr === 'Draft' ? 'reports-draft' : 'reports-completed');
    }

    /* ==========================================================================
       DASHBOARD & REPORTS TABLE
       ========================================================================== */

    renderDashboard() {
        const total = this.reports.length;
        const drafts = this.reports.filter(r => r.status === 'Draft').length;
        const completed = this.reports.filter(r => r.status === 'Selesai').length;

        document.getElementById('statTotalReports').innerText = total;
        document.getElementById('statDraftReports').innerText = drafts;
        document.getElementById('statCompletedReports').innerText = completed;

        // Render Recent 5 Table
        const tbody = document.querySelector('#dashboardRecentTable tbody');
        if (!tbody) return;

        const recent = this.reports.slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-3">Belum ada laporan tersimpan.</td></tr>`;
            return;
        }

        let html = '';
        recent.forEach(r => {
            const badgeClass = r.status === 'Selesai' ? 'badge-success' : 'badge-warning';
            html += `
                <tr>
                    <td><strong>${r.noBap}</strong></td>
                    <td>${r.workDate}</td>
                    <td>${r.workName}</td>
                    <td>${r.area}</td>
                    <td>${r.supervisor}</td>
                    <td><span class="badge ${badgeClass}">${r.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="app.previewReportModal('${r.id}')" title="Preview"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn btn-sm btn-docx" onclick="app.downloadDocxForId('${r.id}')" title="Download Word"><i class="fa-solid fa-file-word"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    renderFilteredTable() {
        const tab = this.activeTab;
        const query = (document.getElementById('listSearchInput')?.value || '').toLowerCase();
        
        let filtered = [...this.reports];
        if (tab === 'reports-draft') {
            filtered = filtered.filter(r => r.status === 'Draft');
        } else if (tab === 'reports-completed') {
            filtered = filtered.filter(r => r.status === 'Selesai');
        }

        if (query) {
            filtered = filtered.filter(r => 
                r.noBap.toLowerCase().includes(query) ||
                r.workName.toLowerCase().includes(query) ||
                r.area.toLowerCase().includes(query) ||
                r.supervisor.toLowerCase().includes(query)
            );
        }

        const tbody = document.getElementById('mainReportsTbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-4">Tidak ada laporan tersimpan.</td></tr>`;
            return;
        }

        let html = '';
        filtered.forEach(r => {
            const badgeClass = r.status === 'Selesai' ? 'badge-success' : 'badge-warning';
            html += `
                <tr>
                    <td><strong>${r.noBap}</strong></td>
                    <td>${r.workDate}</td>
                    <td>${r.workName}</td>
                    <td>${r.area}</td>
                    <td>${r.supervisor}</td>
                    <td><span class="badge ${badgeClass}">${r.status}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-info" onclick="app.previewReportModal('${r.id}')" title="Preview"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn btn-sm btn-docx" onclick="app.downloadDocxForId('${r.id}')" title="Download Word"><i class="fa-solid fa-file-word"></i></button>
                        <button class="btn btn-sm btn-secondary" onclick="app.editReport('${r.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-danger-outline" onclick="app.deleteReport('${r.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    editReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (!report) return;

        this.editingReportId = report.id;
        document.getElementById('reportId').value = report.id;
        document.getElementById('formTitle').innerText = `Edit Laporan: ${report.noBap}`;

        document.getElementById('formProjectName').value = report.projectName;
        document.getElementById('formNoBap').value = report.noBap;
        document.getElementById('formWorkDate').value = report.workDate;
        document.getElementById('formLocation').value = report.location;
        document.getElementById('formSupervisor').value = report.supervisor;
        document.getElementById('formContractor').value = report.contractor;
        document.getElementById('formClient').value = report.client;
        document.getElementById('formWorkNo').value = report.workNo || '';

        document.getElementById('formWorkName').value = report.workName;
        document.getElementById('formWorkType').value = report.workType;
        document.getElementById('formArea').value = report.area;

        this.currentBeforePhotos = report.beforePhotos || [];
        this.currentAfterPhotos = report.afterPhotos || [];
        this.currentComparisons = report.comparisons || [];

        this.renderBeforePhotos();
        this.renderAfterPhotos();
        this.renderComparisons();
        this.saveActiveFormDraft();

        this.switchTab('create-report');
    }

    deleteReport(id) {
        if (confirm('Apakah Anda yakin ingin menghapus laporan tersimpan ini?')) {
            this.reports = this.reports.filter(r => r.id !== id);
            this.saveState();
            this.renderFilteredTable();
            this.renderDashboard();
        }
    }

    /* ==========================================================================
       PREVIEW REPORT MODAL (A4 PORTRAIT) & WORD DOWNLOAD
       ========================================================================== */

    previewCurrentForm() {
        const report = this.getFormData();
        this.renderA4PreviewSheet(report);
    }

    previewReportModal(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            this.renderA4PreviewSheet(report);
        }
    }

    renderA4PreviewSheet(report) {
        const modalBody = document.getElementById('previewModalBody');
        if (!modalBody) return;

        const comparisons = (report.comparisons && report.comparisons.length > 0) ? report.comparisons : [
            { area: "Point 01: Area Utama", beforeUrl: "assets/img/concrete.jpg", beforeDesc: "Screed beton belum terpasang keramik.", afterUrl: "assets/img/brickwork.jpg", methodDesc: "Pemasangan keramik 40x40cm.", afterDesc: "Keramik terpasang rapi 100%." }
        ];

        const POINTS_PER_PAGE = 4;
        const totalPages = Math.ceil(comparisons.length / POINTS_PER_PAGE);

        let fullDocumentHtml = '';

        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
            const pagePoints = comparisons.slice(pageIdx * POINTS_PER_PAGE, (pageIdx + 1) * POINTS_PER_PAGE);

            let pointsHtml = '';
            pagePoints.forEach((c, i) => {
                const globalIndex = (pageIdx * POINTS_PER_PAGE) + i + 1;
                const numStr = String(globalIndex).padStart(2, '0');
                pointsHtml += `
                    <div class="a4-point-row mb-2" style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px; background-color: #fafafa;">
                        <div style="display: flex; gap: 10px; align-items: flex-start;">
                            <!-- BEFORE COL -->
                            <div style="flex: 1; display: flex; gap: 8px; align-items: center; border-right: 1px solid #cbd5e1; padding-right: 8px;">
                                <img src="${c.beforeUrl || 'assets/img/concrete.jpg'}" style="width: 95px; height: 70px; object-fit: cover; border-radius: 3px; border: 1px solid #cbd5e1;">
                                <div style="font-size: 10px; line-height: 1.3;">
                                    <strong class="text-amber">[${numStr}] BEFORE: ${c.area}</strong><br>
                                    <strong>Kondisi Awal:</strong> ${c.beforeDesc}
                                </div>
                            </div>

                            <!-- AFTER COL -->
                            <div style="flex: 1; display: flex; gap: 8px; align-items: center;">
                                <img src="${c.afterUrl || 'assets/img/brickwork.jpg'}" style="width: 95px; height: 70px; object-fit: cover; border-radius: 3px; border: 1px solid #cbd5e1;">
                                <div style="font-size: 10px; line-height: 1.3;">
                                    <strong class="text-emerald">[${numStr}] AFTER: ${c.area}</strong><br>
                                    <strong>Hasil:</strong> ${c.methodDesc || ''} ${c.afterDesc || ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            const isLastPage = (pageIdx === totalPages - 1);
            const footerSection = isLastPage ? `
                <p style="font-size:10px; line-height:1.4; margin-top:10px; margin-bottom:12px;">
                    <strong>KESIMPULAN:</strong> Pekerjaan <strong>${report.workName}</strong> pada area <strong>${report.area}</strong> (Total: ${comparisons.length} point) telah selesai dilaksanakan 100% sesuai lingkup pekerjaan & spesifikasi teknis.
                </p>

                <table style="width:100%; text-align:center; font-size:10px; margin-top:14px;">
                    <tr>
                        <td>Dibuat Oleh,<br><br><br><strong>(${report.supervisor})</strong><br><small>Pelaksana</small></td>
                        <td>Diperiksa Oleh,<br><br><br><strong>(${report.contractor})</strong><br><small>Site Manager</small></td>
                        <td>Disetujui Oleh,<br><br><br><strong>(${report.client})</strong><br><small>Konsultan MK / Owner</small></td>
                    </tr>
                </table>
            ` : `
                <div style="text-align:right; font-size:9px; color:#94a3b8; margin-top:10px;">Bersambung ke Halaman ${pageIdx + 2}...</div>
            `;

            fullDocumentHtml += `
                <div class="a4-sheet mb-4" style="margin-bottom: 30px; page-break-after: always;">
                    <div class="a4-header" style="border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px;">
                        <div>
                            <h3 style="font-size:12px; font-weight:800;">${(report.contractor || 'PT. JAYA KONSTRUKSI').toUpperCase()}</h3>
                            <p style="font-size:10px; color:#64748b;">General Contractor & Construction Services</p>
                        </div>
                        <div style="text-align:right;">
                            <h4 style="font-size:11px; font-weight:700;">PROYEK: ${report.projectName}</h4>
                            <p style="font-size:10px; color:#64748b;">No: ${report.noBap} | Hal ${pageIdx + 1} dari ${totalPages}</p>
                        </div>
                    </div>

                    ${pageIdx === 0 ? `
                    <div class="a4-title-block" style="margin-bottom: 10px;">
                        <h1 style="font-size: 14px; color: #1e3a8a; font-weight: 800;">LAPORAN PEKERJAAN SELESAI (WORK COMPLETION REPORT)</h1>
                    </div>

                    <table class="a4-info-table" style="margin-bottom: 10px;">
                        <tr>
                            <td class="lbl">Nama Proyek</td>
                            <td>${report.projectName}</td>
                            <td class="lbl">Nomor Laporan</td>
                            <td>${report.noBap}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Lokasi / Area</td>
                            <td>${report.location}</td>
                            <td class="lbl">Tanggal</td>
                            <td>${report.workDate}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Nama Pekerjaan</td>
                            <td>${report.workName}</td>
                            <td class="lbl">Pelaksana</td>
                            <td>${report.supervisor}</td>
                        </tr>
                    </table>
                    ` : ''}

                    <div class="a4-section-heading" style="font-size: 11px; margin-top: 6px; margin-bottom: 8px;">
                        DOKUMENTASI BEFORE & AFTER (Halaman ${pageIdx + 1} dari ${totalPages} - Point ${pageIdx * POINTS_PER_PAGE + 1} s.d ${Math.min((pageIdx + 1) * POINTS_PER_PAGE, comparisons.length)})
                    </div>
                    
                    ${pointsHtml}
                    ${footerSection}
                </div>
            `;
        }

        modalBody.innerHTML = fullDocumentHtml;

        document.getElementById('modalBtnDownloadDocx').onclick = () => {
            exportReportToDocx(report);
        };

        document.getElementById('previewModal').classList.add('active');
    }

    closePreviewModal() {
        document.getElementById('previewModal').classList.remove('active');
    }

    downloadDocxFromForm() {
        const report = this.getFormData();
        exportReportToDocx(report);
    }

    downloadDocxForId(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            exportReportToDocx(report);
        }
    }
}

// Global initialization
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ProjectReportApp();
});
