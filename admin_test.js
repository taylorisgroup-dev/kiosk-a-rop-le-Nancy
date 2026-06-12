
    let currentData = {};
    let adminLang = 'fr';

    function changeAdminLang() {
        // First gather existing data for the current language
        gatherFormData();
        
        // Switch language and populate
        adminLang = document.getElementById('admin-lang').value;
        populateForm();
    }

    function uploadVideo(input) {
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const progress = document.getElementById('upload_progress');
        progress.style.display = 'block';
        progress.innerText = 'Upload en cours (0%)...';

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('X-File-Name', file.name);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progress.innerText = 'Upload en cours (' + percent + '%)...';
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                if (res.success) {
                    document.getElementById('media_topVideo').value = res.path;
                    progress.innerText = '✅ Upload terminé !';
                    setTimeout(() => progress.style.display = 'none', 3000);
                } else {
                    progress.innerText = '❌ Erreur serveur.';
                }
            } else {
                progress.innerText = '❌ Erreur lors de l\'upload.';
            }
        };

        xhr.onerror = () => progress.innerText = '❌ Erreur réseau.';
        xhr.send(file);
    }

    // Navigation
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('sec-' + li.dataset.section).classList.add('active');
            if (li.dataset.section === 'stats') loadStats();
        });
    });

    // Load data
    fetch('/api/config?t=' + Date.now(), { cache: "no-store" })
        .then(r => r.json())
        .then(data => {
            currentData = data;
            populateForm();
        });

    function getT(obj) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[adminLang] || '';
    }

    function setT(obj, value) {
        if (typeof obj === 'string') {
            const multi = { fr: obj, en: obj, de: obj, es: obj };
            multi[adminLang] = value;
            return multi;
        }
        if (!obj) obj = { fr: '', en: '', de: '', es: '' };
        obj[adminLang] = value;
        return obj;
    }

    function populateForm() {
        const d = currentData;
        
        document.getElementById('gen_title').value = getT(d.general?.title);
        document.getElementById('gen_subtitle').value = getT(d.general?.subtitle);
        
        document.getElementById('ss_title').value = getT(d.screensaver?.title);
        document.getElementById('ss_subtitle').value = getT(d.screensaver?.subtitle);
        
        // Media is universal, not translated
        document.getElementById('media_topVideo').value = d.media?.topVideoUrl || '';
        
        document.getElementById('aerops_title').value = getT(d.aerops?.title);
        document.getElementById('aerops_headline').value = getT(d.aerops?.headline);
        document.getElementById('aerops_desc').value = getT(d.aerops?.description);
        document.getElementById('aerops_qrUrl').value = d.aerops?.qrUrl || ''; // universal
        document.getElementById('aerops_image').value = d.aerops?.image || '';  // universal

        if (!d.infosPratiques) d.infosPratiques = { title: {fr:"Infos Pratiques"}, headline: {fr:"Horaires"}, description: {fr:""}, image: "assets/hero_aviation.png" };
        document.getElementById('infos_title').value = getT(d.infosPratiques?.title);
        document.getElementById('infos_headline').value = getT(d.infosPratiques?.headline);
        document.getElementById('infos_desc').value = getT(d.infosPratiques?.description);
        document.getElementById('infos_image').value = d.infosPratiques?.image || '';
        
        renderCategories();
        renderProviders();
    }

    function renderCategories() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';
        (currentData.categories || []).forEach((cat, i) => {
            const div = document.createElement('div');
            div.className = 'cat-card';
            div.innerHTML = `
                <img src="${cat.image}" alt="${getT(cat.name)}" onerror="this.src='assets/hero_aviation.png'">
                <div class="cat-info">
                    <strong>${getT(cat.name)}</strong>
                    <small>ID: ${cat.id}${cat.special ? ' — Spécial: ' + cat.special : ''}</small>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="text" value="${escHtml(getT(cat.name))}" style="width:160px;padding:6px 10px;font-size:.85rem" id="cat_name_${i}" placeholder="Nom">
                    <input type="text" value="${cat.image}" style="width:200px;padding:6px 10px;font-size:.85rem" id="cat_img_${i}" placeholder="Image (Universelle)">
                </div>
            `;
            container.appendChild(div);
        });
    }

    function renderProviders() {
        const container = document.getElementById('providers-container');
        container.innerHTML = '';
        (currentData.providers || []).forEach((prov, i) => {
            const catOptions = (currentData.categories || []).map(c =>
                `<option value="${c.id}" ${prov.categoryId === c.id ? 'selected' : ''}>${getT(c.name)}</option>`
            ).join('');

            const card = document.createElement('div');
            card.className = 'provider-card';
            card.innerHTML = `
                <div class="pc-header">
                    <span class="pc-name">${prov.name}</span>
                    <button class="btn btn-danger" onclick="deleteProvider(${i})">🗑 Supprimer</button>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Catégorie</label><select id="p_${i}_cat">${catOptions}</select></div>
                    <div class="form-group"><label>Nom (Universel)</label><input type="text" id="p_${i}_name" value="${escHtml(prov.name)}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Image</label><input type="text" id="p_${i}_img" value="${escHtml(prov.image)}"></div>
                    <div class="form-group"><label>Lien QR Code</label><input type="text" id="p_${i}_qr" value="${escHtml(prov.qrUrl)}"></div>
                </div>
                <div class="form-group"><label>Description</label><textarea id="p_${i}_desc">${escHtml(getT(prov.description))}</textarea></div>
                <div class="form-group"><label>Contact / Horaires</label><input type="text" id="p_${i}_contact" value="${escHtml(getT(prov.contact))}"></div>
            `;
            container.appendChild(card);
        });
    }

    function escHtml(s) { return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

    function addProvider() {
        gatherFormData();
        currentData.providers.unshift({
            id: 'new_' + Date.now(), categoryId: 'hotel', name: 'Nouveau prestataire',
            image: '', description: {fr:'', en:'', de:'', es:''}, contact: {fr:'', en:'', de:'', es:''}, qrUrl: ''
        });
        renderProviders();
        document.getElementById('sec-providers').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteProvider(i) {
        if (confirm('Supprimer "' + currentData.providers[i].name + '" ?')) {
            gatherFormData();
            currentData.providers.splice(i, 1);
            renderProviders();
        }
    }

    function gatherFormData() {
        if (!currentData.general) return;
        
        currentData.general.title = setT(currentData.general.title, document.getElementById('gen_title').value);
        currentData.general.subtitle = setT(currentData.general.subtitle, document.getElementById('gen_subtitle').value);

        if (!currentData.screensaver) currentData.screensaver = {};
        currentData.screensaver.title = setT(currentData.screensaver.title, document.getElementById('ss_title').value);
        currentData.screensaver.subtitle = setT(currentData.screensaver.subtitle, document.getElementById('ss_subtitle').value);

        currentData.media.topVideoUrl = document.getElementById('media_topVideo').value;

        if (!currentData.aerops) currentData.aerops = {};
        currentData.aerops.title = setT(currentData.aerops.title, document.getElementById('aerops_title').value);
        currentData.aerops.headline = setT(currentData.aerops.headline, document.getElementById('aerops_headline').value);
        currentData.aerops.description = setT(currentData.aerops.description, document.getElementById('aerops_desc').value);
        currentData.aerops.qrUrl = document.getElementById('aerops_qrUrl').value;
        currentData.aerops.image = document.getElementById('aerops_image').value;

        if (!currentData.infosPratiques) currentData.infosPratiques = {};
        currentData.infosPratiques.title = setT(currentData.infosPratiques.title, document.getElementById('infos_title').value);
        currentData.infosPratiques.headline = setT(currentData.infosPratiques.headline, document.getElementById('infos_headline').value);
        currentData.infosPratiques.description = setT(currentData.infosPratiques.description, document.getElementById('infos_desc').value);
        currentData.infosPratiques.image = document.getElementById('infos_image').value;

        currentData.categories.forEach((cat, i) => {
            const nameInput = document.getElementById('cat_name_' + i);
            const imgInput = document.getElementById('cat_img_' + i);
            if (nameInput) cat.name = setT(cat.name, nameInput.value);
            if (imgInput) cat.image = imgInput.value;
        });

        currentData.providers.forEach((prov, i) => {
            const cat = document.getElementById('p_' + i + '_cat');
            const name = document.getElementById('p_' + i + '_name');
            const img = document.getElementById('p_' + i + '_img');
            const desc = document.getElementById('p_' + i + '_desc');
            const contact = document.getElementById('p_' + i + '_contact');
            const qr = document.getElementById('p_' + i + '_qr');
            
            if (cat) prov.categoryId = cat.value;
            if (name) prov.name = name.value; // Name is universal
            if (img) prov.image = img.value;
            if (qr) prov.qrUrl = qr.value;
            
            if (desc) prov.description = setT(prov.description, desc.value);
            if (contact) prov.contact = setT(prov.contact, contact.value);
        });
    }

    function saveData() {
        gatherFormData();
        fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentData)
        }).then(r => r.json()).then(r => {
            if (r.success) {
                const toast = document.getElementById('toast');
                toast.style.display = 'block';
                setTimeout(() => toast.style.display = 'none', 3000);
            }
        });
    }

    // Stats
    function loadStats() {
        fetch('/api/stats?t=' + Date.now())
            .then(r => r.json())
            .then(stats => {
                const summary = document.getElementById('stat-summary');
                const totalSessions = stats.total?.sessions || 0;
                const totalClicks = Object.values(stats.total?.clicks || {}).reduce((a, b) => a + b, 0);
                const todayKey = new Date().toISOString().slice(0, 10);
                const todaySessions = stats.daily?.[todayKey]?.sessions || 0;
                const todayClicks = Object.values(stats.daily?.[todayKey]?.clicks || {}).reduce((a, b) => a + b, 0);

                summary.innerHTML = `
                    <div class="stat-card"><div class="stat-value">${totalSessions}</div><div class="stat-label">Sessions totales</div></div>
                    <div class="stat-card"><div class="stat-value">${totalClicks}</div><div class="stat-label">Clics totaux</div></div>
                    <div class="stat-card"><div class="stat-value">${todaySessions}</div><div class="stat-label">Sessions aujourd'hui</div></div>
                    <div class="stat-card"><div class="stat-value">${todayClicks}</div><div class="stat-label">Clics aujourd'hui</div></div>
                `;

                const clicks = stats.total?.clicks || {};
                const sorted = Object.entries(clicks).sort((a, b) => b[1] - a[1]);
                const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
                const tbody = document.getElementById('stat-tbody');
                tbody.innerHTML = sorted.map(([key, val]) => `
                    <tr>
                        <td>${key}</td>
                        <td><strong>${val}</strong></td>
                        <td style="width:40%"><div class="stat-bar" style="width:${(val / maxVal) * 100}%"></div></td>
                    </tr>
                `).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text2)">Aucune donnée disponible</td></tr>';
            });
    }
