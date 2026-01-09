/**
 * NINBLU CONNECT - MAIN LOGIC v5.0 (FINAL)
 * Author: CodeCraft Architect
 */

const STORAGE_KEY = 'ninblu_connect_db_final_v5';

// --- 1. DATOS INICIALES (Con teléfonos reales y estructura nueva) ---
const defaultData = {
    user: null, 
    alerts: { text: "📅 Reunión General: Viernes 10:00 AM", active: true },
    news: [
        { id: 1, title: 'Sistema Actualizado', content: 'Bienvenido a la versión 5.0 con gestión de enlaces.', date: 'Hoy', target: 'global' }
    ],
    employees: [
        { id: 1, name: 'Alex Morgan', role: 'Lead Designer', avatar: 'AM', status: 'online', phone: '593999999999' },
        { id: 2, name: 'Sarah Connor', role: 'Frontend Dev', avatar: 'SC', status: 'busy', phone: '593988888888' },
        { id: 3, name: 'John Doe', role: 'Project Manager', avatar: 'JD', status: 'vacation', phone: '593977777777' }
    ],
    projects: [
        {
            id: 'proj_1',
            name: 'Rebranding Nike',
            desc: 'Rediseño total de identidad visual y landing page.',
            link: 'https://zoom.us/j/123456789', // Ejemplo de enlace
            status: 'active',
            team: [1, 2], 
            deadlines: [{ date: '2026-02-15', desc: 'Entrega Final' }]
        }
    ]
};

// Cargar estado
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;
let currentDate = new Date(); // Fecha actual del calendario
let currentProjectId = null;
let tempTeam = [];
let tempDeadlines = [];

// --- 2. SELECTORES DOM ---
const dom = {
    // Layout
    sections: document.querySelectorAll('section'),
    navItems: document.querySelectorAll('.nav-item'),
    headerAvatarBtn: document.getElementById('header-avatar-btn'),
    
    // Login & User
    loginScreen: document.getElementById('login-screen'),
    loginName: document.getElementById('login-name'),
    btnLogin: document.getElementById('btn-login'),
    headerAvatar: document.querySelector('.avatar-small'),
    headerStatusDot: document.getElementById('header-status-dot'),
    
    // Alerts & Notices
    alertBar: document.getElementById('global-alert-bar'),
    alertText: document.getElementById('alert-text'),
    closeAlert: document.querySelector('.close-alert'),
    modalNotice: document.getElementById('notice-modal'),
    noticeTarget: document.getElementById('notice-target'),
    noticeText: document.getElementById('notice-text'),

    // Project Modal Inputs
    modalProject: document.getElementById('project-modal'),
    projName: document.getElementById('proj-name'),
    projDesc: document.getElementById('proj-desc'), // Nuevo
    projLink: document.getElementById('proj-link'), // Nuevo
    projStatus: document.getElementById('proj-status'),
    projUserSelect: document.getElementById('proj-user-select'),
    
    // Grids & Displays
    projectsGrid: document.getElementById('projects-grid'),
    newsFeed: document.getElementById('news-feed'),
    directoryList: document.getElementById('directory-list'),
    urgentList: document.getElementById('urgent-tasks'),
    kpiGrid: document.querySelector('.kpi-grid'),
    
    // Calendar
    calGrid: document.getElementById('calendar-grid'),
    calMonthName: document.getElementById('cal-month-name'),
    calEventsList: document.getElementById('calendar-events-list')
};

// --- 3. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    checkSession();
    setupNavigation();
    setupEventListeners();
    renderAll();
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll(); 
}

// --- 4. NAVEGACIÓN ---
function setupNavigation() {
    dom.navItems.forEach(item => item.addEventListener('click', () => activateSection(item.dataset.target)));
    if(dom.headerAvatarBtn) dom.headerAvatarBtn.addEventListener('click', () => activateSection('profile-section'));
}

function activateSection(targetId) {
    // Actualizar botones inferiores
    dom.navItems.forEach(n => {
        n.classList.remove('active');
        if(n.dataset.target === targetId) n.classList.add('active');
    });

    // Cambiar Sección
    dom.sections.forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
        if(sec.id === targetId) {
            sec.classList.remove('hidden-section');
            sec.classList.add('active-section');
        }
    });
}

// --- 5. SESIÓN ---
function checkSession() {
    if (!state.user) dom.loginScreen.classList.remove('hidden');
    else {
        dom.loginScreen.classList.add('hidden');
        updateProfileUI();
    }
}

function login() {
    const name = dom.loginName.value.trim();
    if (name) {
        state.user = { name: name, role: 'Team Member', status: 'online', avatar: name.charAt(0).toUpperCase() };
        saveState();
        checkSession();
    }
}

function logout() {
    if(confirm('¿Cerrar sesión?')) {
        state.user = null;
        saveState();
        location.reload();
    }
}

function updateProfileUI() {
    if (!state.user) return;
    dom.headerAvatar.textContent = state.user.avatar;
    updateStatusVisuals(state.user.status);
    
    // Datos en la sección Perfil
    const pName = document.getElementById('profile-name-display');
    const pRole = document.getElementById('profile-role-display');
    const pAvatar = document.querySelector('.profile-avatar-large');
    
    if(pName) pName.textContent = state.user.name;
    if(pRole) pRole.textContent = state.user.role;
    if(pAvatar) pAvatar.textContent = state.user.avatar;
}

function updateStatusVisuals(status) {
    const colors = { online: '#00ff88', busy: '#ff4444', vacation: '#feee8c', offline: '#555' };
    dom.headerStatusDot.style.background = colors[status];
    dom.headerStatusDot.style.boxShadow = `0 0 8px ${colors[status]}`;
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.status === status) btn.classList.add('active');
    });
}

// --- 6. RENDERIZADO GENERAL ---
function renderAll() {
    renderAlertBar();
    renderDashboard();
    renderProjects();
    renderNews();
    renderDirectory();
    renderCalendar();
}

// --- 7. DASHBOARD ---
function renderDashboard() {
    const total = state.projects.length;
    const active = state.projects.filter(p => p.status === 'active').length;
    
    if(dom.kpiGrid) {
        dom.kpiGrid.innerHTML = `
            <div class="glass-card" style="text-align:center;">
                <h2 style="color:var(--ninblu-pink); font-size:2.5rem;">${active}</h2>
                <p style="color:#aaa; font-size:0.8rem;">En Curso</p>
            </div>
            <div class="glass-card" style="text-align:center;">
                <h2 style="color:var(--ninblu-purple); font-size:2.5rem;">${total}</h2>
                <p style="color:#aaa; font-size:0.8rem;">Totales</p>
            </div>
        `;
    }

    // Deadlines Urgentes
    const allDeadlines = [];
    state.projects.forEach(p => {
        if(p.status !== 'completed') {
            p.deadlines.forEach(d => allDeadlines.push({ proj: p.name, desc: d.desc, date: d.date }));
        }
    });
    allDeadlines.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    if(dom.urgentList) {
        dom.urgentList.innerHTML = allDeadlines.slice(0,3).length ? allDeadlines.slice(0,3).map(t => `
            <div class="glass-card" style="padding:12px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-weight:600; font-size:0.9rem;">${t.desc}</span>
                    <span style="color:var(--ninblu-pink); font-size:0.8rem;">${t.date}</span>
                </div>
                <div style="font-size:0.75rem; color:#888;">${t.proj}</div>
            </div>
        `).join('') : '<p style="text-align:center; color:#666; font-size:0.8rem;">No hay entregas pendientes.</p>';
    }
}

// --- 8. NOTICIAS Y AVISOS SEGMENTADOS ---
function renderNews() {
    if(!dom.newsFeed) return;
    
    dom.newsFeed.innerHTML = state.news.map(n => {
        // Lógica de Etiquetas (Global vs Proyecto)
        let label = '📢 General';
        let labelColor = 'rgba(255,255,255,0.1)';
        
        if(n.target && n.target !== 'global') {
            const p = state.projects.find(proj => proj.id === n.target);
            if(p) {
                label = `🚀 ${p.name}`;
                labelColor = 'rgba(117, 44, 134, 0.4)'; // Morado suave
            }
        }

        return `
        <div class="glass-card news-item" style="border:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span class="news-date">${n.date}</span>
                <span style="font-size:0.65rem; background:${labelColor}; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">${label}</span>
            </div>
            <h4 style="margin:0 0 5px 0; color:white;">${n.title}</h4>
            <p style="margin:0; font-size:0.9rem; color:#bbb;">${n.content}</p>
        </div>
    `}).join('');
}

function openNoticeModal() {
    dom.modalNotice.classList.remove('hidden');
    // Poblar Selector de Target
    let options = `<option value="global" style="background:#333;">📢 Todo el Equipo (General)</option>`;
    state.projects.forEach(p => {
        options += `<option value="${p.id}" style="background:#333;">🚀 ${p.name}</option>`;
    });
    dom.noticeTarget.innerHTML = options;
}

function publishNotice() {
    const text = dom.noticeText.value;
    const target = dom.noticeTarget.value;
    
    if(text) {
        state.alerts = { text: text, active: true };
        state.news.unshift({
            id: Date.now(),
            title: 'Aviso del Equipo',
            content: text,
            date: new Date().toLocaleDateString(),
            target: target
        });
        dom.modalNotice.classList.add('hidden');
        dom.noticeText.value = '';
        saveState();
    }
}

function renderAlertBar() {
    if (state.alerts.active) {
        dom.alertText.textContent = state.alerts.text;
        dom.alertBar.classList.remove('hidden');
    } else {
        dom.alertBar.classList.add('hidden');
    }
}

// --- 9. PROYECTOS (Con Link y Descripción) ---
function renderProjects() {
    if (!dom.projectsGrid) return;
    dom.projectsGrid.innerHTML = '';
    const tpl = document.getElementById('tpl-project-card');

    state.projects.forEach(proj => {
        const clone = tpl.content.cloneNode(true);
        clone.querySelector('.proj-title').textContent = proj.name;
        
        // Descripción
        clone.querySelector('.proj-description').textContent = proj.desc || 'Sin descripción';

        // Link Botón
        const linkBtn = clone.querySelector('.btn-link-proj');
        if(proj.link && proj.link.trim() !== "") {
            linkBtn.style.display = 'block'; // Mostrar si hay link
            linkBtn.href = proj.link;
        } else {
            linkBtn.style.display = 'none';
        }

        // Status Colors
        const dot = clone.querySelector('.status-dot');
        if(proj.status === 'active') { dot.style.background = '#00ff88'; dot.style.boxShadow = '0 0 5px #00ff88'; }
        else if(proj.status === 'pending') { dot.style.background = '#feee8c'; }
        else { dot.style.background = '#555'; }

        clone.querySelector('.team-count').textContent = proj.team.length;
        clone.querySelector('.deadline-count').textContent = proj.deadlines.length;
        clone.querySelector('.btn-edit-proj').addEventListener('click', () => openProjectModal(proj.id));
        
        dom.projectsGrid.appendChild(clone);
    });
}

function openProjectModal(projId) {
    currentProjectId = projId;
    dom.modalProject.classList.remove('hidden');
    dom.projUserSelect.innerHTML = state.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

    const title = document.getElementById('modal-title');
    const delBtn = document.getElementById('btn-delete-proj');

    if (projId) {
        const proj = state.projects.find(p => p.id === projId);
        title.textContent = 'Gestionar Proyecto';
        dom.projName.value = proj.name;
        dom.projDesc.value = proj.desc || '';
        dom.projLink.value = proj.link || '';
        dom.projStatus.value = proj.status;
        tempTeam = [...proj.team];
        tempDeadlines = [...proj.deadlines];
        delBtn.classList.remove('hidden');
    } else {
        title.textContent = 'Nuevo Proyecto';
        dom.projName.value = '';
        dom.projDesc.value = '';
        dom.projLink.value = '';
        dom.projStatus.value = 'active';
        tempTeam = [];
        tempDeadlines = [];
        delBtn.classList.add('hidden');
    }
    renderModalLists();
}

function saveProject() {
    const name = dom.projName.value;
    if (!name) return alert('El nombre es obligatorio');

    const newData = {
        id: currentProjectId || `proj_${Date.now()}`,
        name: name,
        desc: dom.projDesc.value,
        link: dom.projLink.value,
        status: dom.projStatus.value,
        team: tempTeam,
        deadlines: tempDeadlines
    };

    if (currentProjectId) {
        const idx = state.projects.findIndex(p => p.id === currentProjectId);
        state.projects[idx] = newData;
    } else {
        state.projects.push(newData);
    }
    dom.modalProject.classList.add('hidden');
    saveState();
}

function deleteProject() {
    if(confirm('¿Eliminar proyecto definitivamente?')) {
        state.projects = state.projects.filter(p => p.id !== currentProjectId);
        dom.modalProject.classList.add('hidden');
        saveState();
    }
}

// Helpers Listas Modal
function addTempDeadline() {
    const date = document.getElementById('new-deadline-date').value;
    const desc = document.getElementById('new-deadline-desc').value;
    if(date && desc) {
        tempDeadlines.push({ date, desc });
        renderModalLists();
        document.getElementById('new-deadline-desc').value = '';
    }
}
function addTempUser() {
    const uid = parseInt(dom.projUserSelect.value);
    if(!tempTeam.includes(uid)) {
        tempTeam.push(uid);
        renderModalLists();
    }
}
function renderModalLists() {
    document.getElementById('proj-deadlines-list').innerHTML = tempDeadlines.map((d, i) => `
        <li style="margin-bottom:5px; font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">
            <span>${d.date} - ${d.desc}</span>
            <span style="color:#ff4444; cursor:pointer;" onclick="window.removeItem('deadline', ${i})">×</span>
        </li>
    `).join('');
    document.getElementById('proj-team-tags').innerHTML = tempTeam.map(uid => {
        const u = state.employees.find(e => e.id === uid);
        return `<div class="user-tag">${u ? u.name : 'User'} <span onclick="window.removeItem('user', ${uid})" style="cursor:pointer; margin-left:5px;">×</span></div>`;
    }).join('');
}
window.removeItem = (type, id) => {
    if(type === 'deadline') tempDeadlines.splice(id, 1);
    if(type === 'user') tempTeam = tempTeam.filter(u => u !== id);
    renderModalLists();
};

// --- 10. DIRECTORIO (Con WhatsApp) ---
function renderDirectory() {
    if(!dom.directoryList) return;
    const term = document.getElementById('directory-search')?.value.toLowerCase() || '';
    const filtered = state.employees.filter(e => e.name.toLowerCase().includes(term));

    dom.directoryList.innerHTML = filtered.map(e => {
        // Generar enlace WA
        const waLink = e.phone ? `https://wa.me/${e.phone.replace(/\D/g,'')}` : '#';
        
        return `
        <div class="glass-card" style="display:flex; align-items:center; gap:15px; padding:10px;">
            <div class="avatar-small" style="min-width:40px; min-height:40px; border:1px solid var(--ninblu-pink);">${e.avatar}</div>
            <div style="flex-grow:1;">
                <h4 style="margin:0; font-size:1rem;">${e.name}</h4>
                <p style="margin:0; font-size:0.8rem; color:var(--ninblu-pink);">${e.role}</p>
            </div>
            <a href="${waLink}" target="_blank" class="btn-icon-primary" style="width:35px; height:35px; font-size:1rem; text-decoration:none;">
                <i class="ph ph-whatsapp-logo"></i>
            </a>
            <div style="width:8px; height:8px; border-radius:50%; background:${e.status==='online'?'#00ff88':e.status==='busy'?'#ff4444':e.status==='vacation'?'#feee8c':'#555'}; margin-left:5px;"></div>
        </div>
    `}).join('');
}

// --- 11. CALENDARIO (Con Botón Hoy) ---
function renderCalendar() {
    if(!dom.calGrid) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    dom.calMonthName.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);
    
    dom.calGrid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let i=0; i<firstDay; i++) dom.calGrid.innerHTML += '<div></div>';

    for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const hasEvent = state.projects.some(p => p.deadlines.some(d => d.date === dateStr));
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
        
        const el = document.createElement('div');
        el.className = `day-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`;
        el.textContent = i;
        el.onclick = () => showDayEvents(dateStr);
        dom.calGrid.appendChild(el);
    }
}

function showDayEvents(dateStr) {
    const events = [];
    state.projects.forEach(p => p.deadlines.forEach(d => { if(d.date === dateStr) events.push({ proj: p.name, desc: d.desc }); }));
    
    if(dom.calEventsList) {
        if(events.length > 0) {
            dom.calEventsList.innerHTML = events.map(e => `
                <div class="glass-card" style="padding:10px;">
                    <strong style="display:block;">${e.desc}</strong>
                    <small style="color:#aaa;">${e.proj}</small>
                </div>
            `).join('');
        } else {
            // MENSAJE DE ESTADO VACÍO
            dom.calEventsList.innerHTML = `<p style="text-align:center; color:#666; font-style:italic;">No hay planes para este día 🍃</p>`;
        }
    }
}

// --- 12. EVENT LISTENERS ---
function setupEventListeners() {
    dom.btnLogin.addEventListener('click', login);
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    // Status
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(state.user) {
                state.user.status = btn.dataset.status;
                saveState();
                updateProfileUI();
            }
        });
    });

    // Modals
    document.getElementById('btn-new-project').addEventListener('click', () => openProjectModal(null));
    document.getElementById('btn-create-notice').addEventListener('click', openNoticeModal);
    
    document.querySelectorAll('.close-modal, .close-modal-notice').forEach(b => {
        b.addEventListener('click', () => {
            dom.modalProject.classList.add('hidden');
            dom.modalNotice.classList.add('hidden');
        });
    });

    // Actions
    document.getElementById('btn-save-proj').addEventListener('click', saveProject);
    document.getElementById('btn-delete-proj').addEventListener('click', deleteProject);
    document.getElementById('btn-add-deadline').addEventListener('click', addTempDeadline);
    document.getElementById('btn-add-user').addEventListener('click', addTempUser);
    document.getElementById('btn-publish-notice').addEventListener('click', publishNotice);
    
    dom.closeAlert.addEventListener('click', () => {
        state.alerts.active = false;
        saveState();
    });

    // Calendar
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    // BOTÓN HOY
    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
        showDayEvents(currentDate.toISOString().split('T')[0]);
    });

    // Search
    const search = document.getElementById('directory-search');
    if(search) search.addEventListener('input', renderDirectory);
}