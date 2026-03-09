// ============================================================
// SIMPACT ERP - CORE ENGINE v3.0
// ============================================================

const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycbwGrUl_KQhLQMFW-PcRcu1FbFbkorpHEiAYOTWQAtPev9Ai40DUj_ne7Jh0R7CGmNwi/exec"; // Google Apps Script SIMPACT
const CLOUD_SECRET  = "simpact2026secure"; // ← Même valeur que dans le script Google

// ─── CLOUD SYNC ──────────────────────────────────────────────
function cloudEnabled() {
    return CLOUD_API_URL && CLOUD_API_URL.startsWith('http');
}

// Envoyer un utilisateur vers Google Sheets (ajout ou modification)
async function cloudSaveUser(userObj) {
    if (!cloudEnabled()) return;
    try {
        const body = JSON.stringify({ action: 'save_user', key: CLOUD_SECRET, ...userObj });
        await fetch(CLOUD_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });
    } catch(e) { console.warn('[SIMPACT Cloud] Erreur sauvegarde:', e); }
}

// Supprimer un utilisateur de Google Sheets
async function cloudDeleteUser(userId) {
    if (!cloudEnabled()) return;
    try {
        const body = JSON.stringify({ action: 'delete_user', key: CLOUD_SECRET, id: userId });
        await fetch(CLOUD_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });
    } catch(e) { console.warn('[SIMPACT Cloud] Erreur suppression:', e); }
}

// Charger tous les utilisateurs depuis Google Sheets et les fusionner dans le localStorage
// Retourne true si la sync a réussi
async function cloudSyncUsers() {
    if (!cloudEnabled()) return false;
    try {
        const body = JSON.stringify({ action: 'get_users', key: CLOUD_SECRET });
        const resp = await fetch(CLOUD_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });
        if (!resp.ok) return false;
        const json = await resp.json();
        if (!json.ok || !Array.isArray(json.users)) return false;

        // Fusionner les utilisateurs cloud avec le localStorage
        const stored = localStorage.getItem('SIMPACT_USERS');
        const localUsers = stored ? JSON.parse(stored) : [];

        json.users.forEach(cloudUser => {
            if (!cloudUser.id) return;
            // Ignorer les utilisateurs déjà dans DEFAULT_USERS (ils sont gérés par le code)
            const isDefault = DEFAULT_USERS.some(d => d.id.toLowerCase() === cloudUser.id.toLowerCase());
            if (isDefault) return;

            const idx = localUsers.findIndex(u => u.id.toLowerCase() === cloudUser.id.toLowerCase());
            if (idx === -1) {
                localUsers.push(cloudUser);
            } else {
                // Mise à jour depuis le cloud (le cloud a priorité pour les users ajoutés via admin)
                Object.assign(localUsers[idx], cloudUser);
            }
        });

        // Supprimer du localStorage les users cloud qui ont été supprimés sur le cloud
        // (uniquement les non-DEFAULT)
        const cloudIds = json.users.map(u => u.id.toLowerCase());
        const cleaned = localUsers.filter(u => {
            const isDefault = DEFAULT_USERS.some(d => d.id.toLowerCase() === u.id.toLowerCase());
            if (isDefault) return true; // Toujours garder les DEFAULT
            return cloudIds.includes(u.id.toLowerCase()); // Garder uniquement si présent dans cloud
        });

        localStorage.setItem('SIMPACT_USERS', JSON.stringify(cleaned));
        console.log('[SIMPACT Cloud] ✅ Sync réussie —', json.users.length, 'utilisateurs cloud');
        return true;
    } catch(e) {
        console.warn('[SIMPACT Cloud] Sync impossible (mode hors ligne):', e);
        return false;
    }
}

// Compatibilité ancienne fonction (non utilisée mais gardée)
function syncToCloud(type, data) {}

// ─────────────────────────────────────────────────────────────
//  UTILISATEURS
// ─────────────────────────────────────────────────────────────
const DEFAULT_USERS = [
    // ── ÉQUIPE INTERNE ──
    { id: 'youssef',   pass: 'h_fmbfji',  role: 'superadmin', name: 'Youssef (PDG)',      redirect: 'hub.html'        },
    { id: 'talel',     pass: 'h_a6esyc',  role: 'superadmin', name: 'Talel',               redirect: 'hub.html'        },
    { id: 'admin01',   pass: 'h_riha7v',  role: 'admin',      name: 'Admin Simpact',      redirect: 'admin.html'      },
    { id: 'prod01',    pass: 'h_be518k',  role: 'production', name: 'Chef Atelier',       redirect: 'production.html' },
    { id: 'compta01',  pass: 'h_i22pok',  role: 'compta',     name: 'Service Compta',     redirect: 'compta.html'     },
    { id: 'comm01',    pass: 'h_1uqk40',  role: 'commercial', name: 'Commercial 1',       redirect: 'commercial.html' },

    // ── CLIENTS ──
    { id: 'client01',  pass: 'h_vho8e1',  role: 'client',     name: 'Agence Pub Alpha',   redirect: 'client.html', sector: 'Agence', phone: '+216 71 000 001', email: 'alpha@agence.tn', address: 'Tunis Centre, Tunisie' },
    { id: 'client02',  pass: 'h_wcoy',    role: 'client',     name: 'Restaurant Le Chef', redirect: 'client.html', sector: 'Restauration', phone: '+216 71 000 002', email: 'contact@lechef.tn' },
    { id: 'uib',       pass: 'h_78v1kg',  role: 'client',     name: 'UIB BANK',           redirect: 'client.html', sector: 'Banque', phone: '+216 71 108 000', email: 'com@uib.com.tn', address: 'Avenue Mohamed V, Tunis' },

    // ── BANQUES ──
    { id: 'ubci',      pass: 'h_t3dh6d',  role: 'client',     name: 'UBCI',               redirect: 'client.html', sector: 'Banque' },
    { id: 'attijari',  pass: 'h_jdkj1k',  role: 'client',     name: 'Attijari Bank',      redirect: 'client.html', sector: 'Banque' },
    { id: 'atb',       pass: 'h_bgunsf',  role: 'client',     name: 'ATB Bank',            redirect: 'client.html', sector: 'Banque' },
    { id: 'amen',      pass: 'h_tqcdyh',  role: 'client',     name: 'Amen Bank',           redirect: 'client.html', sector: 'Banque' },
    { id: 'biat',      pass: 'h_9lxa64',  role: 'client',     name: 'BIAT',                redirect: 'client.html', sector: 'Banque' },
    { id: 'zitouna',   pass: 'h_ly9vb4',  role: 'client',     name: 'Zitouna Bank',        redirect: 'client.html', sector: 'Banque' },
    { id: 'BTK',       pass: 'h_3chrrv',  role: 'client',     name: 'BTK Bank',            redirect: 'client.html', sector: 'Banque' },
    { id: 'QNB',       pass: 'h_7fvzhj',  role: 'client',     name: 'QNB Bank',            redirect: 'client.html', sector: 'Banque' },
    { id: 'TSB',       pass: 'h_h6t3uj',  role: 'client',     name: 'TSB Bank',            redirect: 'client.html', sector: 'Banque' },
    { id: 'BTE',       pass: 'h_39707p',  role: 'client',     name: 'BTE Bank',            redirect: 'client.html', sector: 'Banque' },
    { id: 'BT',        pass: 'h_mu00bw',  role: 'client',     name: 'BT Bank',             redirect: 'client.html', sector: 'Banque' },

    // ── ASSURANCES ──
    { id: 'star',      pass: 'h_lqsdp0',  role: 'client',     name: 'STAR Assurances',     redirect: 'client.html', sector: 'Assurance' },
    { id: 'astree',    pass: 'h_ypv3de',  role: 'client',     name: 'Astrée Assurances',   redirect: 'client.html', sector: 'Assurance' },
    { id: 'comar',     pass: 'h_u8l9cc',  role: 'client',     name: 'Comar',               redirect: 'client.html', sector: 'Assurance' },
    { id: 'carte',     pass: 'h_3kxakn',  role: 'client',     name: 'La Carte',            redirect: 'client.html', sector: 'Assurance' },
    { id: 'gat',       pass: 'h_35jj8k',  role: 'client',     name: 'GAT Assurance',       redirect: 'client.html', sector: 'Assurance' },
    { id: 'maghrebia', pass: 'h_sksay4',  role: 'client',     name: 'Maghrebia',           redirect: 'client.html', sector: 'Assurance' },
    { id: 'biatassur', pass: 'h_1953mi',  role: 'client',     name: 'Biat Assurance',      redirect: 'client.html', sector: 'Assurance' },
    { id: 'lloyd',     pass: 'h_9x9ruk',  role: 'client',     name: 'Lloyd Assurances',    redirect: 'client.html', sector: 'Assurance' },
    { id: 'mae',       pass: 'h_dnh783',  role: 'client',     name: 'MAE Assurance',       redirect: 'client.html', sector: 'Assurance' },
    { id: 'takaful',   pass: 'h_h5bj18',  role: 'client',     name: 'Zitouna Takaful',     redirect: 'client.html', sector: 'Assurance' },
    { id: 'takafulia', pass: 'h_qn1ewk',  role: 'client',     name: 'At-Takafulia',        redirect: 'client.html', sector: 'Assurance' }
];

// Mots de passe :
// youssef→youssef123 | talel→talel123 | admin01→simpact2026 | prod01→atelier | compta01→facture | comm01→vente
// client01→client123 | client02→1234 | uib→uib2026
// ubci→ubci2026 | attijari→attijari2026 | atb→atb2026 | amen→amen2026
// biat→biat2026 | zitouna→zitouna2026 | BTK→btk2026 | QNB→qnb2026
// TSB→tsb2026 | BTE→bte2026 | BT→bt2026
// star→star2026 | astree→astree2026 | comar→comar2026 | carte→carte2026
// gat→gat2026 | maghrebia→maghrebia2026 | biatassur→biatassur2026 | lloyd→lloyd2026
// mae→mae2026 | takaful→takaful2026 | takafulia→takafulia2026

// ════════════════════════════════════════════════════════════
//  NE MODIFIEZ RIEN EN DESSOUS DE CETTE LIGNE
// ════════════════════════════════════════════════════════════

function hashPass(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36);
}

function getUsers() {
    try {
        const stored = localStorage.getItem('SIMPACT_USERS');
        const localUsers = stored ? JSON.parse(stored) : [];
        const merged = [...localUsers];

        DEFAULT_USERS.forEach(def => {
            const li = merged.findIndex(u => u.id === def.id);
            if (li === -1) {
                // Utilisateur absent du localStorage → on l'ajoute
                merged.push(def);
            } else {
                // Toujours synchroniser le rôle et le mot de passe depuis DEFAULT_USERS
                // (évite les décalages entre appareils après une mise à jour)
                merged[li].pass     = def.pass;
                merged[li].role     = def.role;
                merged[li].redirect = def.redirect;
                // Compléter les champs manquants
                if (def.sector && !merged[li].sector) merged[li].sector = def.sector;
                if (def.phone  && !merged[li].phone)  merged[li].phone  = def.phone;
                if (def.email  && !merged[li].email)  merged[li].email  = def.email;
            }
        });

        // Resauvegarder pour que le localStorage soit à jour
        localStorage.setItem('SIMPACT_USERS', JSON.stringify(merged));
        return merged;
    } catch(e) {}
    const initial = JSON.parse(JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('SIMPACT_USERS', JSON.stringify(initial));
    return initial;
}

function saveUsers(users) {
    localStorage.setItem('SIMPACT_USERS', JSON.stringify(users));
}

function login(userId, password) {
    if (!userId || !password) return null;
    const users = getUsers();
    const hashed = hashPass(password);
    const found = users.find(u =>
        u.id.toLowerCase() === userId.toLowerCase() &&
        (u.pass === hashed || u.pass === password)
    );
    if (found) {
        const session = { id: found.id, name: found.name, role: found.role, loginTime: new Date().toISOString() };
        localStorage.setItem('SIMPACT_USER', JSON.stringify(session));
        logActivity(found.id, 'LOGIN');
        return found;
    }
    return null;
}

function checkAuth(allowedRoles) {
    try {
        const session = localStorage.getItem('SIMPACT_USER');
        if (!session) { window.location.href = 'index.html'; return null; }
        const user = JSON.parse(session);
        if (!user || !user.id || !user.role) {
            localStorage.removeItem('SIMPACT_USER');
            window.location.href = 'index.html'; return null;
        }

        // ── Le superadmin bypass TOUT sans exception ──────────
        if (user.role === 'superadmin') return user;

        // ── Page réservée uniquement au superadmin ────────────
        const roles = Array.isArray(allowedRoles) ? allowedRoles : (allowedRoles ? [allowedRoles] : []);
        if (roles.length === 1 && roles[0] === 'superadmin') {
            window.location.href = 'index.html'; return null;
        }

        // ── Vérification du rôle (on ignore 'superadmin' dans la liste) ──
        const filteredRoles = roles.filter(r => r !== 'superadmin');
        if (filteredRoles.length > 0 && !filteredRoles.includes(user.role)) {
            window.location.href = 'index.html'; return null;
        }

        return user;
    } catch(e) {
        localStorage.removeItem('SIMPACT_USER');
        window.location.href = 'index.html'; return null;
    }
}

function logout() {
    const session = localStorage.getItem('SIMPACT_USER');
    if (session) { try { logActivity(JSON.parse(session).id, 'LOGOUT'); } catch(e) {} }
    localStorage.removeItem('SIMPACT_USER');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_USER')); } catch(e) { return null; }
}

function updateUserProfile(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    const allowed = ['name', 'email', 'phone', 'address', 'sector', 'contactName'];
    allowed.forEach(k => { if (updates[k] !== undefined) users[idx][k] = updates[k]; });
    if (updates.newPass) users[idx].pass = hashPass(updates.newPass);
    saveUsers(users);
    // Update session name
    const session = getCurrentUser();
    if (session && session.id === userId && updates.name) {
        session.name = updates.name;
        localStorage.setItem('SIMPACT_USER', JSON.stringify(session));
    }
    return true;
}

function addOrUpdateUser(userData) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userData.originalId || u.id === userData.id);
    if (idx !== -1 && users[idx].role === 'superadmin' && userData.role !== 'superadmin') {
        alert('Impossible de changer le rôle du Super Admin.'); return false;
    }
    const newUser = {
        id: userData.id,
        pass: userData.passChanged ? hashPass(userData.pass) : (idx !== -1 ? users[idx].pass : hashPass(userData.pass)),
        role: userData.role,
        name: userData.name,
        redirect: userData.redirect,
        email: userData.email || '',
        phone: userData.phone || '',
        sector: userData.sector || '',
        address: userData.address || ''
    };
    if (idx !== -1) {
        if (users[idx].role === 'superadmin') newUser.id = users[idx].id;
        users[idx] = newUser;
    } else {
        users.push(newUser);
    }
    saveUsers(users);
    // 🌐 Synchronisation cloud (ne bloque pas l'interface)
    cloudSaveUser(newUser);
    return true;
}

function deleteUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.role === 'superadmin') { alert('Impossible de supprimer le Super Admin.'); return false; }
    saveUsers(users.filter(u => u.id !== userId));
    // 🌐 Synchronisation cloud
    cloudDeleteUser(userId);
    return true;
}

// ─── COMMANDES ───────────────────────────────────────────────
function getOrders() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_ORDERS')) || []; }
    catch(e) { return []; }
}

function saveOrder(orderData) {
    let orders = getOrders();
    orders = orders.filter(o => o.ref !== orderData.ref);
    orders.unshift({ ...orderData, ts: orderData.ts || new Date().toISOString() });
    if (orders.length > 500) orders = orders.slice(0, 500);
    localStorage.setItem('SIMPACT_ORDERS', JSON.stringify(orders));
    syncToCloud('commande', {
        Date: orderData.date, Ref: orderData.ref, Client: orderData.client,
        ClientId: orderData.clientId || '', Produit: orderData.prod, Quantite: orderData.qty,
        Prix_HT: orderData.price, TVA: orderData.tva || 0, Prix_TTC: orderData.priceTTC || orderData.price,
        Details: orderData.desc, Commercial: orderData.user,
        Statut_Prod: orderData.statusProd, Statut_Compta: orderData.statusCompta, Delai: orderData.delai || ''
    });
}

function updateOrderStatus(ref, newStatus, type) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.ref === ref);
    if (idx !== -1) {
        if (type === 'prod')   orders[idx].statusProd   = newStatus;
        if (type === 'compta') orders[idx].statusCompta = newStatus;
        orders[idx].ts = new Date().toISOString();
        localStorage.setItem('SIMPACT_ORDERS', JSON.stringify(orders));
        const o = orders[idx];
        syncToCloud('commande', {
            Date: o.date, Ref: o.ref, Client: o.client, ClientId: o.clientId||'',
            Produit: o.prod, Quantite: o.qty, Prix_HT: o.price, TVA: o.tva||0,
            Prix_TTC: o.priceTTC||o.price, Details: o.desc||'', Commercial: o.user||'',
            Statut_Prod: o.statusProd, Statut_Compta: o.statusCompta, Delai: o.delai||''
        });
    }
}

function deleteOrder(ref) {
    let orders = getOrders();
    orders = orders.filter(o => o.ref !== ref);
    localStorage.setItem('SIMPACT_ORDERS', JSON.stringify(orders));
}

// ─── DEVIS ───────────────────────────────────────────────────
function getQuotes() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_QUOTES')) || []; }
    catch(e) { return []; }
}

function saveQuote(quoteData) {
    let quotes = getQuotes();
    quotes = quotes.filter(q => q.ref !== quoteData.ref);
    quotes.unshift(quoteData);
    if (quotes.length > 200) quotes = quotes.slice(0, 200);
    localStorage.setItem('SIMPACT_QUOTES', JSON.stringify(quotes));
    syncToCloud('devis', {
        Date: quoteData.date, Ref: quoteData.ref, Client: quoteData.client,
        Produit: quoteData.prod, Quantite: quoteData.qty,
        Prix_HT: quoteData.price, TVA: quoteData.tva||0, Prix_TTC: quoteData.priceTTC||quoteData.price,
        Statut: quoteData.status||'En attente'
    });
}

function deleteQuote(ref) {
    let quotes = getQuotes();
    quotes = quotes.filter(q => q.ref !== ref);
    localStorage.setItem('SIMPACT_QUOTES', JSON.stringify(quotes));
}

function convertQuoteToOrder(quoteRef) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.ref === quoteRef);
    if (!quote) return null;
    const orderRef = 'CMD-' + Date.now().toString(36).toUpperCase();
    const now = new Date();
    const order = {
        ...quote, ref: orderRef, quoteRef,
        date: now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        statusProd: 'En attente', statusCompta: 'Non payé', type: 'order'
    };
    saveOrder(order);
    const qIdx = quotes.findIndex(q => q.ref === quoteRef);
    if (qIdx !== -1) {
        quotes[qIdx].status = 'Converti';
        quotes[qIdx].orderRef = orderRef;
        localStorage.setItem('SIMPACT_QUOTES', JSON.stringify(quotes));
    }
    // Notification to client
    addNotification(quote.clientId || quote.client, {
        type: 'order_confirmed',
        title: 'Commande confirmée',
        message: `Votre devis ${quoteRef} a été converti en commande (${orderRef}).`,
        ref: orderRef
    });
    return order;
}

// ─── STOCK ───────────────────────────────────────────────────
function getStock() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_STOCK')) || []; }
    catch(e) { return []; }
}

function saveStock(data) {
    localStorage.setItem('SIMPACT_STOCK', JSON.stringify(data));
}

function getStockMovements() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_STOCK_MOVEMENTS')) || []; }
    catch(e) { return []; }
}

function saveStockMovement(m) {
    let moves = getStockMovements();
    moves.unshift(m);
    if (moves.length > 500) moves = moves.slice(0, 500);
    localStorage.setItem('SIMPACT_STOCK_MOVEMENTS', JSON.stringify(moves));
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
function getNotifications(userId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_NOTIFS') || '{}');
        return all[userId] || [];
    } catch(e) { return []; }
}

function addNotification(userId, notif) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_NOTIFS') || '{}');
        if (!all[userId]) all[userId] = [];
        all[userId].unshift({
            id: Date.now().toString(36),
            ts: new Date().toISOString(),
            read: false,
            ...notif
        });
        if (all[userId].length > 50) all[userId] = all[userId].slice(0, 50);
        localStorage.setItem('SIMPACT_NOTIFS', JSON.stringify(all));
    } catch(e) {}
}

function markNotificationsRead(userId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_NOTIFS') || '{}');
        if (all[userId]) all[userId].forEach(n => n.read = true);
        localStorage.setItem('SIMPACT_NOTIFS', JSON.stringify(all));
    } catch(e) {}
}

function getUnreadCount(userId) {
    return getNotifications(userId).filter(n => !n.read).length;
}

// ─── DOCUMENTS CLIENTS ───────────────────────────────────────
function getClientDocuments(clientId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_DOCS') || '{}');
        return all[clientId] || [];
    } catch(e) { return []; }
}

function saveClientDocument(clientId, doc) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_DOCS') || '{}');
        if (!all[clientId]) all[clientId] = [];
        const idx = all[clientId].findIndex(d => d.id === doc.id);
        if (idx !== -1) all[clientId][idx] = doc;
        else all[clientId].unshift({ ...doc, id: doc.id || Date.now().toString(36), ts: new Date().toISOString() });
        localStorage.setItem('SIMPACT_DOCS', JSON.stringify(all));
        return true;
    } catch(e) { return false; }
}

function deleteClientDocument(clientId, docId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_DOCS') || '{}');
        if (all[clientId]) all[clientId] = all[clientId].filter(d => d.id !== docId);
        localStorage.setItem('SIMPACT_DOCS', JSON.stringify(all));
    } catch(e) {}
}

// ─── MESSAGES / CHAT ─────────────────────────────────────────
function getMessages(clientId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_MSGS') || '{}');
        return all[clientId] || [];
    } catch(e) { return []; }
}

function sendMessage(clientId, msg) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_MSGS') || '{}');
        if (!all[clientId]) all[clientId] = [];
        all[clientId].push({ ...msg, id: Date.now().toString(36), ts: new Date().toISOString() });
        if (all[clientId].length > 200) all[clientId] = all[clientId].slice(-200);
        localStorage.setItem('SIMPACT_MSGS', JSON.stringify(all));
        return true;
    } catch(e) { return false; }
}

function getUnreadMessages(clientId) {
    return getMessages(clientId).filter(m => !m.read && m.from !== clientId).length;
}

function markMessagesRead(clientId) {
    try {
        const all = JSON.parse(localStorage.getItem('SIMPACT_MSGS') || '{}');
        if (all[clientId]) all[clientId].forEach(m => { if (m.from !== clientId) m.read = true; });
        localStorage.setItem('SIMPACT_MSGS', JSON.stringify(all));
    } catch(e) {}
}

// ─── HISTORIQUE & STATS ──────────────────────────────────────
function logActivity(userId, action, details) {
    try {
        let logs = JSON.parse(localStorage.getItem('SIMPACT_LOGS') || '[]');
        logs.unshift({ ts: new Date().toISOString(), user: userId, action, details: details || '' });
        if (logs.length > 500) logs = logs.slice(0, 500);
        localStorage.setItem('SIMPACT_LOGS', JSON.stringify(logs));
        if (action === 'LOGIN' || action === 'LOGOUT') {
            syncToCloud('log', { user: userId, action, details: details || '' });
        }
    } catch(e) {}
}

function getLogs() {
    try { return JSON.parse(localStorage.getItem('SIMPACT_LOGS') || '[]'); }
    catch(e) { return []; }
}

function getClientHistory(clientId) {
    return getOrders().filter(o => o.clientId === clientId || o.client === clientId || o.clientId === clientId);
}

function getClientStats(clientId) {
    const user = getUsers().find(u => u.id === clientId);
    const history = getClientHistory(clientId);
    const totalCA = history.reduce((s, o) => s + parseFloat(o.price || 0), 0);
    const totalTTC = history.reduce((s, o) => s + parseFloat(o.priceTTC || o.price || 0), 0);
    const paidOrders = history.filter(o => o.statusCompta === 'Payé');
    const pendingOrders = history.filter(o => o.statusCompta !== 'Payé');
    const paidCA = paidOrders.reduce((s, o) => s + parseFloat(o.price || 0), 0);
    const pendingCA = pendingOrders.reduce((s, o) => s + parseFloat(o.price || 0), 0);
    const products = {};
    history.forEach(o => { products[o.prod] = (products[o.prod] || 0) + 1; });
    const topProduct = Object.keys(products).sort((a, b) => products[b] - products[a])[0] || '—';
    const avgBasket = history.length ? totalCA / history.length : 0;
    const loyaltyLevel = getLoyaltyLevel(history.length);
    const quotes = getQuotes().filter(q => q.clientId === clientId || q.client === clientId);
    return {
        count: history.length,
        totalCA, totalTTC, paidCA, pendingCA,
        topProduct, avgBasket, loyaltyLevel,
        lastOrder: history[0] || null,
        quotesCount: quotes.length,
        name: user ? user.name : clientId
    };
}

function getLoyaltyLevel(orderCount) {
    if (orderCount >= 30) return { name: 'Diamant', icon: '💎', cls: 'diamond', color: '#06b6d4', next: 30, progress: 100 };
    if (orderCount >= 20) return { name: 'Platinum', icon: '🏆', cls: 'platinum', color: '#8b5cf6', next: 30, progress: ((orderCount-20)/10)*100 };
    if (orderCount >= 10) return { name: 'Gold', icon: '⭐', cls: 'gold', color: '#f59e0b', next: 20, progress: ((orderCount-10)/10)*100 };
    if (orderCount >= 5)  return { name: 'Silver', icon: '🥈', cls: 'silver', color: '#94a3b8', next: 10, progress: ((orderCount-5)/5)*100 };
    return { name: 'Bronze', icon: '🥉', cls: 'bronze', color: '#cd7c4a', next: 5, progress: (orderCount/5)*100 };
}

// ─── EXPORT / IMPORT ─────────────────────────────────────────
function exportDatabase() {
    const backup = {
        version: '3.0',
        exportDate: new Date().toISOString(),
        users: getUsers(),
        orders: getOrders(),
        quotes: getQuotes(),
        stock: getStock(),
        notifications: JSON.parse(localStorage.getItem('SIMPACT_NOTIFS') || '{}'),
        documents: JSON.parse(localStorage.getItem('SIMPACT_DOCS') || '{}'),
        messages: JSON.parse(localStorage.getItem('SIMPACT_MSGS') || '{}')
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simpact_backup_' + new Date().toLocaleDateString('fr-FR').replace(/\//g,'-') + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importDatabase(file, onSuccess) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            if (!backup.users) { alert('❌ Fichier invalide.'); return; }
            if (backup.users)  localStorage.setItem('SIMPACT_USERS',  JSON.stringify(backup.users));
            if (backup.orders) localStorage.setItem('SIMPACT_ORDERS', JSON.stringify(backup.orders));
            if (backup.quotes) localStorage.setItem('SIMPACT_QUOTES', JSON.stringify(backup.quotes));
            if (backup.stock)  localStorage.setItem('SIMPACT_STOCK',  JSON.stringify(backup.stock));
            if (backup.notifications) localStorage.setItem('SIMPACT_NOTIFS', JSON.stringify(backup.notifications));
            if (backup.documents) localStorage.setItem('SIMPACT_DOCS', JSON.stringify(backup.documents));
            if (backup.messages) localStorage.setItem('SIMPACT_MSGS', JSON.stringify(backup.messages));
            const d = backup.exportDate ? new Date(backup.exportDate).toLocaleDateString('fr-FR') : '?';
            alert('✅ Base restaurée !\n\n' + backup.users.length + ' utilisateurs\n' + (backup.orders||[]).length + ' commandes\nDate : ' + d);
            if (typeof onSuccess === 'function') onSuccess();
        } catch(err) { alert('❌ Erreur import : ' + err.message); }
    };
    reader.readAsText(file);
}

// ─── UTILITAIRES ─────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount) {
    return parseFloat(amount || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DT';
}

function generateRef(prefix) {
    return prefix + '-' + Date.now().toString(36).toUpperCase();
}
