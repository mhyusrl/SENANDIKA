// Site-wide UI: theme, search, and product rendering (Top10 / Latest / Recommended)
(function () {
    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

    // Theme (dark) toggle with persistence
    function initTheme() {
        const btn = qs('#theme-toggle');
        const current = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (current === 'dark') document.body.classList.add('dark');
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // Simple search: store query and navigate to product page (client-side)
    function initSearch() {
        const form = qs('#site-search');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = qs('#search-input', form).value.trim();
            if (!q) return;
            localStorage.setItem('lastSearch', q);
            window.location.href = 'product.html?q=' + encodeURIComponent(q);
        });
    }

    // Sample product dataset (could be loaded from JSON/API later)
    const products = [
        { id:'p1', title:'Acer Aspire 5', cpu:'Intel i5', ram:'8GB', storage:'512GB SSD', price:8000000, date:'2025-11-12', score:86, recommended:true, image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRetdFzeKqHa5R_3jIG5MJ86NE-lW57-hgARw&s' },
        { id:'p2', title:'ASUS VivoBook 15', cpu:'Intel i3', ram:'8GB', storage:'256GB SSD', price:5500000, date:'2025-09-02', score:74, recommended:false, image:'https://orbit.co.id/assets/uploads/2022/09/Asus-Vivobook-15-A1502ZA-1.jpg' },
        { id:'p3', title:'Lenovo IdeaPad 3', cpu:'AMD Ryzen 5', ram:'8GB', storage:'512GB SSD', price:7200000, date:'2026-01-05', score:88, recommended:true, image:'https://els.id/wp-content/uploads/2024/08/ideapad-slim-3-arctic-grey-2.png' },
        { id:'p4', title:'HP Pavilion 14', cpu:'Intel i7', ram:'16GB', storage:'1TB SSD', price:14500000, date:'2025-12-20', score:91, recommended:true, image:'https://els.id/wp-content/uploads/2023/10/Pavilion-Plus-14-Silver-2.png' },
        { id:'p5', title:'Dell Inspiron 15', cpu:'Intel i5', ram:'8GB', storage:'1TB HDD', price:7500000, date:'2025-07-30', score:79, recommended:false, image:'https://storage.googleapis.com/download/storage/v1/b/xooply-static-production/o/dev%2F2dc20bbc-6521-4f69-ac9c-7d631e92e038.jpg-8DxioK.jpg?generation=1720247132720745&alt=media' },
        { id:'p6', title:'Apple MacBook Air M1', cpu:'Apple M1', ram:'8GB', storage:'256GB SSD', price:14000000, date:'2024-10-10', score:95, recommended:true, image:'https://everymac.com/images/cpu_pictures/macbook-air-2020-m1-top.jpg' },
        { id:'p7', title:'Microsoft Surface Laptop Go', cpu:'Intel i5', ram:'8GB', storage:'128GB SSD', price:9300000, date:'2025-08-14', score:82, recommended:false, image:'https://tier1online.com/cdn/shop/files/e47f8990-5678-46fa-a6fa-8e22c6389c77_768x_768x_768x_28023d60-4932-4d33-904d-ad3a69b08868.webp?v=1719501284' },
        { id:'p8', title:'HP Chromebook 14', cpu:'Intel Celeron', ram:'4GB', storage:'64GB eMMC', price:3200000, date:'2025-05-18', score:65, recommended:false, image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYSK3J2vpRQYS1PlzzrZKe8Zb0HFSUG3NwrA&s' },
        { id:'p9', title:'Lenovo Legion 5', cpu:'AMD Ryzen 7', ram:'16GB', storage:'1TB SSD', price:18500000, date:'2026-01-02', score:94, recommended:true, image:'https://els.id/wp-content/uploads/2025/07/Legion-5-15IRX10-4.png' },
        { id:'p10', title:'ASUS ROG Strix', cpu:'Intel i9', ram:'32GB', storage:'2TB SSD', price:35000000, date:'2025-11-28', score:96, recommended:true, image:'https://els.id/wp-content/uploads/2024/02/G614.png' },
        { id:'p11', title:'Xiaomi RedmiBook 14', cpu:'Intel i5', ram:'8GB', storage:'512GB SSD', price:6500000, date:'2025-06-12', score:78, recommended:false, image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQqW2C036WVtSdePL182I8lFxUxCs-E1EWrw&s' }
    ];

    // expose products for product.html detail view
    window.PRODUCTS = products;

    // Load extras from localStorage (persisted products added by user)
    function loadExtras() {
        try {
            const extras = JSON.parse(localStorage.getItem('products_extra') || '[]');
            if (Array.isArray(extras) && extras.length) {
                extras.forEach(ex => {
                    const normalized = Object.assign({
                        id: 'x' + Math.random().toString(36).slice(2,9),
                        title: ex.title || ex.name || 'Produk Baru',
                        cpu: ex.cpu || '-',
                        ram: ex.ram || '-',
                        storage: ex.storage || '-',
                        price: Number(ex.price) || 0,
                        date: ex.date || (new Date()).toISOString().slice(0,10),
                        score: Number(ex.score) || 75,
                        recommended: !!ex.recommended,
                        image: ex.image || ex.img || ''
                    }, ex);
                    products.push(normalized);
                });
            }
        } catch(e) { /* ignore */ }
    }

    function saveExtraProduct(item) {
        try {
            const arr = JSON.parse(localStorage.getItem('products_extra') || '[]');
            arr.push(item);
            localStorage.setItem('products_extra', JSON.stringify(arr));
        } catch(e){}
    }

    function formatPrice(n){ return n.toString().replace(/(\d)(?=(\d{3})+$)/g,'$1.'); }
    // Region / currency settings
    const REGION_KEY = 'regionSettings';
    const DEFAULT_REGION = { country: 'Indonesia', language: 'id', currency: 'IDR', currencyCode: 'IDR', locale: 'id-ID', rateToIDR: 1 };
    const REGION_PRESET = {
        IDR: { country: 'Indonesia', language: 'id', currency: 'IDR', currencyCode: 'IDR', locale: 'id-ID', rateToIDR: 1 },
        USD: { country: 'United States', language: 'en', currency: 'USD', currencyCode: 'USD', locale: 'en-US', rateToIDR: 1/15000 },
        EUR: { country: 'European Union', language: 'en', currency: 'EUR', currencyCode: 'EUR', locale: 'de-DE', rateToIDR: 1/16000 },
        GBP: { country: 'United Kingdom', language: 'en', currency: 'GBP', currencyCode: 'GBP', locale: 'en-GB', rateToIDR: 1/18000 },
        JPY: { country: 'Japan', language: 'ja', currency: 'JPY', currencyCode: 'JPY', locale: 'ja-JP', rateToIDR: 1/110 }
    };

    function getRegion() {
        try { const r = JSON.parse(localStorage.getItem(REGION_KEY)||'null'); if (r && r.currencyCode) return r; } catch(e){}
        return DEFAULT_REGION;
    }

    // simple translations
    const TRANSLATIONS = {
        id: {
            brand_title: 'Check & Compare',
            back_home: 'Back to Home',
            contact_us: 'Contact Us',
            search_placeholder: 'Cari produk...','"': '"',
            add_laptop: 'Tambah Laptop Baru',
            add_button: 'Tambahkan',
            toggle_add: 'Tambah Laptop Baru',
            filter_keyword_placeholder: 'Cari kata kunci...',
            min_price_placeholder: 'Min harga',
            max_price_placeholder: 'Max harga',
            min_weight_placeholder: 'Min berat (kg)',
            max_weight_placeholder: 'Max berat (kg)',
            min_battery_placeholder: 'Min baterai (mAh)',
            max_battery_placeholder: 'Max baterai (mAh)',
            apply_filters: 'Terapkan',
            reset_filters: 'Reset',
            add_success: 'Berhasil ditambahkan',
            compare_title: 'Hasil Perbandingan',
            export_csv: 'Ekspor CSV',
            clear_all: 'Bersihkan Semua',
            show_diff_only: 'Tampilkan hanya perbedaan',
            delete_btn: 'Hapus',
            no_selection: 'Belum ada laptop yang dipilih untuk dibanding.',
            recommendation_title: 'Rekomendasi Pintar',
            best_choice: 'Pilihan Terbaik',
            summary_title: 'Ringkasan',
            pros_title: 'Kelebihan',
            cons_title: 'Kekurangan',
            cta_search_again: 'Cari Lagi'
        },
        en: {
            brand_title: 'Check & Compare',
            back_home: 'Back to Home',
            contact_us: 'Contact Us',
            search_placeholder: 'Search products...',
            add_laptop: 'Add New Laptop',
            add_button: 'Add',
            toggle_add: 'Add New Laptop',
            filter_keyword_placeholder: 'Keyword...',
            min_price_placeholder: 'Min price',
            max_price_placeholder: 'Max price',
            min_weight_placeholder: 'Min weight (kg)',
            max_weight_placeholder: 'Max weight (kg)',
            min_battery_placeholder: 'Min battery (mAh)',
            max_battery_placeholder: 'Max battery (mAh)',
            apply_filters: 'Apply',
            reset_filters: 'Reset',
            add_success: 'Added successfully',
            compare_title: 'Comparison Results',
            export_csv: 'Export CSV',
            clear_all: 'Clear All',
            show_diff_only: 'Show differences only',
            delete_btn: 'Remove',
            no_selection: 'No laptops selected for comparison.',
            recommendation_title: 'Smart Recommendation',
            best_choice: 'Best Choice',
            summary_title: 'Summary',
            pros_title: 'Pros',
            cons_title: 'Cons',
            cta_search_again: 'Search Again'
        }
    };

    function t(key){
        const lang = (getRegion() && getRegion().language) || 'id';
        return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['id'] && TRANSLATIONS['id'][key]) || key;
    }

    function applyTranslations(){
        // elements with data-i18n -> textContent
        document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
        // placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder = t(el.dataset.i18nPlaceholder); });
    }

    function setRegion(code) {
        const preset = REGION_PRESET[code] || DEFAULT_REGION;
        localStorage.setItem(REGION_KEY, JSON.stringify(preset));
        applyRegionToUI();
        // rerender lists that show prices
        refreshAll();
    }

    function formatCurrency(amount) {
        const region = getRegion();
        const rate = region.rateToIDR || 1;
        const converted = Number(amount || 0) * rate;
        try {
            return new Intl.NumberFormat(region.locale || 'en-US', { style: 'currency', currency: region.currencyCode, maximumFractionDigits: region.currencyCode === 'IDR' ? 0 : 2 }).format(converted);
        } catch(e) {
            // fallback simple formatting
            const sym = region.currencyCode === 'IDR' ? 'Rp' : (region.currencyCode || '');
            return sym + ' ' + Math.round(converted).toString();
        }
    }

    function applyRegionToUI() {
        const header = document.querySelector('header');
        if (!header) return;
        let existing = document.getElementById('region-control');
        const region = getRegion();
        if (!existing) {
            existing = document.createElement('div');
            existing.id = 'region-control';
            existing.style.marginLeft = '12px';
            existing.style.display = 'inline-flex';
            existing.style.alignItems = 'center';
            existing.innerHTML = `
                <select id="region-select" title="Pilih mata uang" style="padding:6px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);">
                    <option value="IDR">Indonesia (IDR)</option>
                    <option value="USD">United States (USD)</option>
                    <option value="EUR">Europe (EUR)</option>
                    <option value="GBP">UK (GBP)</option>
                    <option value="JPY">Japan (JPY)</option>
                </select>
            `;
            // append to nav if exists, else header
            const nav = header.querySelector('nav') || header;
            nav.appendChild(existing);
        }
        const sel = document.getElementById('region-select');
        if (sel) {
            sel.value = region.currencyCode || 'IDR';
            sel.addEventListener('change', ()=> setRegion(sel.value));
        }
    }

    // expose formatter for other pages (compare.html)
    window.formatCurrency = formatCurrency;
    window.getRegion = getRegion;
    function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

    function renderCards(containerSelector, items) {
        const container = qs(containerSelector);
        if (!container) return;
        container.innerHTML = '';
        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            const imgSrc = p.image || `https://via.placeholder.com/600x200?text=${encodeURIComponent(p.title)}`;
            card.innerHTML = `
                <img src="${imgSrc}" alt="${escapeHtml(p.title)}">
                <h3>${escapeHtml(p.title)}</h3>
                <p><strong>CPU:</strong> ${escapeHtml(p.cpu)} &nbsp; <strong>RAM:</strong> ${escapeHtml(p.ram)}</p>
                <p><strong>Storage:</strong> ${escapeHtml(p.storage)} &nbsp; <strong>Harga:</strong> ${formatCurrency(p.price)}</p>
                <div style="display:flex; gap:8px; margin-top:12px; align-items:center; justify-content:center;">
                    <a class="button" href="product.html?id=${encodeURIComponent(p.id)}">Lihat Detail</a>
                    <button class="fav-btn" data-id="${encodeURIComponent(p.id)}" aria-label="Tambahkan ke favorit">♡</button>
                </div>
            `;
            container.appendChild(card);
            // attach favorite handler and update state
            const favBtn = card.querySelector('.fav-btn');
            if (favBtn) {
                updateFavButton(favBtn);
                favBtn.addEventListener('click', (e)=>{
                    const id = decodeURIComponent(favBtn.dataset.id);
                    toggleFavorite(id);
                    updateFavButton(favBtn);
                    renderFavorites();
                });
            }
        });
    }

    // Favorites (bookmarks)
    function readFavorites(){ try { return JSON.parse(localStorage.getItem('favorites')||'[]'); } catch(e){ return []; } }
    function writeFavorites(list){ localStorage.setItem('favorites', JSON.stringify(list)); }
    function toggleFavorite(id){ const list = readFavorites(); const idx = list.indexOf(id); if (idx === -1) { list.push(id); } else { list.splice(idx,1); } writeFavorites(list); }
    function isFavorite(id){ return readFavorites().indexOf(id) !== -1; }
    function updateFavButton(btn){ const id = decodeURIComponent(btn.dataset.id); btn.textContent = isFavorite(id) ? '❤' : '♡'; btn.style.background = isFavorite(id) ? '#ffd700' : 'transparent'; btn.style.color = isFavorite(id) ? '#111' : '#fff'; }
    function renderFavorites(){ const favIds = readFavorites(); const favItems = favIds.map(id => products.find(p=>p.id===id)).filter(Boolean); renderCards('#favorites', favItems); }

    function renderTop10() {
        const sorted = products.slice().sort((a,b)=> b.score - a.score).slice(0,10);
        renderCards('#top10', sorted);
    }

    function renderLatest() {
        const sorted = products.slice().sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,10);
        renderCards('#latest', sorted);
    }

    function renderRecommended() {
        const recs = products.filter(p=>p.recommended).slice(0,10);
        renderCards('#recommended', recs);
    }

    // Filtering/sorting helpers for product list
    function getFilteredProductsForList() {
        let list = products.slice();
        const kwEl = qs('#filter-keyword');
        const minEl = qs('#min-price');
        const maxEl = qs('#max-price');
        const minWEl = qs('#min-weight');
        const maxWEl = qs('#max-weight');
        const minBEl = qs('#min-battery');
        const maxBEl = qs('#max-battery');
        const sortEl = qs('#sort-select');
        const kw = kwEl ? (kwEl.value||'').trim().toLowerCase() : '';
        const min = minEl ? Number(minEl.value || 0) : 0;
        const max = maxEl ? Number(maxEl.value || 0) : 0;
        const minW = minWEl ? Number(minWEl.value || 0) : 0;
        const maxW = maxWEl ? Number(maxWEl.value || 0) : 0;
        const minB = minBEl ? Number(minBEl.value || 0) : 0;
        const maxB = maxBEl ? Number(maxBEl.value || 0) : 0;

        function numericValue(v){
            if (v === null || v === undefined) return 0;
            if (typeof v === 'number') return v||0;
            const s = String(v).replace(/[^0-9.]/g,'');
            return s ? Number(s) : 0;
        }
        if (kw) list = list.filter(p => (p.title+' '+p.cpu+' '+p.ram+' '+p.storage).toLowerCase().includes(kw));
        if (min) list = list.filter(p => Number(p.price||0) >= min);
        if (max) list = list.filter(p => Number(p.price||0) <= max);
        if (minW) list = list.filter(p => numericValue(p.weight) >= minW);
        if (maxW) list = list.filter(p => numericValue(p.weight) <= maxW);
        if (minB) list = list.filter(p => numericValue(p.battery) >= minB);
        if (maxB) list = list.filter(p => numericValue(p.battery) <= maxB);
        if (sortEl) {
            const s = sortEl.value;
            if (s === 'price-asc') list.sort((a,b)=> a.price - b.price);
            else if (s === 'price-desc') list.sort((a,b)=> b.price - a.price);
            else if (s === 'score-desc') list.sort((a,b)=> b.score - a.score);
        }
        return list;
    }

    function refreshAll() {
        renderTop10();
        renderLatest();
        renderRecommended();
        renderFavorites();
        const pl = qs('#product-list');
        if (pl) {
            const params = new URLSearchParams(location.search);
            const q = params.get('q') || localStorage.getItem('lastSearch') || '';
            if (q) {
                const filtered = getFilteredProductsForList().filter(p=> (p.title + ' ' + p.cpu + ' ' + p.ram).toLowerCase().includes(q.toLowerCase()));
                renderCards('#product-list', filtered);
            } else {
                renderCards('#product-list', getFilteredProductsForList());
            }
        }
    }

    // When arriving on product.html with ?q=, show the query and list filtered
    function showSearchOnProduct() {
        if (!/product\.html/i.test(location.pathname)) return;
        const params = new URLSearchParams(location.search);
        const q = params.get('q') || localStorage.getItem('lastSearch') || '';
        const el = qs('#search-result');
        if (el && q) el.innerHTML = `<p class="muted">Hasil pencarian untuk: <strong>${escapeHtml(q)}</strong></p>`;

        // if id provided, show detail
        const id = params.get('id');
        if (id) {
            const p = products.find(x=>x.id===id);
            const det = qs('#product-detail');
            if (!det) return;
            if (!p) { det.innerHTML = '<p class="muted">Produk tidak ditemukan.</p>'; return; }
            const detailImg = p.image || `https://via.placeholder.com/800x300?text=${encodeURIComponent(p.title)}`;
            det.innerHTML = `
                <h1>${escapeHtml(p.title)}</h1>
                <img src="${detailImg}" alt="${escapeHtml(p.title)}">
                <p><strong>CPU:</strong> ${escapeHtml(p.cpu)}</p>
                <p><strong>RAM:</strong> ${escapeHtml(p.ram)}</p>
                <p><strong>Storage:</strong> ${escapeHtml(p.storage)}</p>
                <p><strong>Harga:</strong> ${formatCurrency(p.price)}</p>
                <p><strong>Skor:</strong> ${p.score}</p>
                <a href="product.html" class="button">Kembali ke Daftar</a>
            `;
            return;
        }

        // otherwise, if there's a query or filters, show filtered list
        if (q) {
            const ql = q.toLowerCase();
            const filtered = getFilteredProductsForList().filter(p=> (p.title + ' ' + p.cpu + ' ' + p.ram).toLowerCase().includes(ql));
            renderCards('#product-list', filtered);
            return;
        }

        // default: show filtered/sorted list (latest by default)
        const list = getFilteredProductsForList();
        const latest = list.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,12);
        renderCards('#product-list', latest);
    }

    document.addEventListener('DOMContentLoaded', function(){
        loadExtras();
        initTheme();
        initSearch();
        applyRegionToUI();
        refreshAll();
        showSearchOnProduct();
    });

    // API for add-product form (index)
    window.addProductFromForm = function(data){
        const item = {
            title: data.title || data.name,
            cpu: data.cpu || '-',
            ram: data.ram || '-',
            storage: data.storage || '-',
            price: Number(data.price) || 0,
            date: data.date || (new Date()).toISOString().slice(0,10),
            score: Number(data.score) || 75,
            recommended: !!data.recommended,
            image: data.image || data.img || ''
        };
        products.push(Object.assign({ id: 'x' + Math.random().toString(36).slice(2,9) }, item));
        saveExtraProduct(item);
        refreshAll();
    };

    // expose refresh for external use
    window.refreshAll = refreshAll;
})();
