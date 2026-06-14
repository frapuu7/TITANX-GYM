/* ===== GYM SOFTWARE - TITANX FITNESS ===== */

/* --- DATA STORES --- */
const STORES = {
    members: 'gymMembers',
    checkins: 'gymCheckins',
    workouts: 'gymWorkouts',
    memberships: 'gymMemberships',
    payments: 'gymPayments'
};

function getStore(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* --- NAVIGATION --- */
function showSection(section) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const el = document.getElementById('section-' + section);
    if (el) el.style.display = 'block';

    const titles = { dashboard: 'Dashboard', members: 'Miembros', checkins: 'Registro de Asistencia', workouts: 'Rutinas', memberships: 'Membresías', payments: 'Pagos' };
    document.getElementById('sectionTitle').textContent = titles[section] || 'Dashboard';

    if (section === 'dashboard') updateDashboard();
    if (section === 'members') renderMembers();
    if (section === 'checkins') { populateCheckinSelect(); renderCheckins(); }
    if (section === 'workouts') { populateWorkoutSelect(); renderWorkouts(); }
    if (section === 'memberships') renderMemberships();
    if (section === 'payments') { populatePaymentSelect(); renderPayments(); }
}

/* --- DASHBOARD --- */
function updateDashboard() {
    const members = getStore(STORES.members);
    const checkins = getStore(STORES.checkins);
    const workouts = getStore(STORES.workouts);
    const payments = getStore(STORES.payments);

    document.getElementById('statMembers').textContent = members.length;

    const today = new Date().toISOString().split('T')[0];
    const todayCheckins = checkins.filter(c => c.date === today);
    document.getElementById('statCheckins').textContent = todayCheckins.length;

    document.getElementById('statWorkouts').textContent = workouts.length;

    const totalRevenue = payments.filter(p => p.status === 'Pagado').reduce((sum, p) => sum + Number(p.amount), 0);
    document.getElementById('statRevenue').textContent = '$' + totalRevenue.toLocaleString();

    /* Recent checkins */
    const recentDiv = document.getElementById('recentCheckins');
    if (todayCheckins.length === 0) {
        recentDiv.innerHTML = '<p class="text-muted">Sin registros hoy</p>';
    } else {
        let html = '<div class="table-container"><table><thead><tr><th>Miembro</th><th>Hora</th></tr></thead><tbody>';
        todayCheckins.slice(-5).reverse().forEach(c => {
            html += `<tr><td>${c.memberName}</td><td>${c.checkinTime}</td></tr>`;
        });
        html += '</tbody></table></div>';
        recentDiv.innerHTML = html;
    }

    /* Chart */
    updateChart(checkins);
}

function updateChart(checkins) {
    const ctx = document.getElementById('fitnessChart');
    if (!ctx) return;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const data = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        data[6 - i] = checkins.filter(c => c.date === dateStr).length;
    }
    if (window.fitnessChartInstance) window.fitnessChartInstance.destroy();
    window.fitnessChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Asistencia',
                data: data,
                borderColor: '#ff3131',
                backgroundColor: 'rgba(255,49,49,0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { labels: { color: 'white' } } },
            scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }
        }
    });
}

/* ===== MEMBERS CRUD ===== */
let editingMemberIndex = null;

function renderMembers() {
    const tbody = document.getElementById('memberTableBody');
    if (!tbody) return;
    const members = getStore(STORES.members);
    tbody.innerHTML = '';
    members.forEach((m, i) => {
        tbody.innerHTML += `<tr>
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td>${m.phone || '-'}</td>
            <td>${m.membership}</td>
            <td><span class="status-badge ${m.status === 'Activo' ? 'active' : 'inactive'}">${m.status}</span></td>
            <td>
                <button class="edit-btn" onclick="editMember(${i})">Editar</button>
                <button class="delete-btn" onclick="deleteMember(${i})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function openMemberModal() {
    editingMemberIndex = null;
    document.getElementById('memberModalTitle').textContent = 'Nuevo Miembro';
    document.getElementById('memberName').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberPhone').value = '';
    document.getElementById('memberMembership').value = 'Basic';
    document.getElementById('memberStatus').value = 'Activo';
    document.getElementById('memberModal').style.display = 'flex';
}

function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
}

function saveMember() {
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const phone = document.getElementById('memberPhone').value.trim();
    const membership = document.getElementById('memberMembership').value;
    const status = document.getElementById('memberStatus').value;
    if (!name || !email) { alert('Completa nombre y correo'); return; }

    const members = getStore(STORES.members);
    const member = { name, email, phone, membership, status, created: new Date().toISOString() };

    if (editingMemberIndex === null) {
        members.push(member);
    } else {
        members[editingMemberIndex] = member;
        editingMemberIndex = null;
    }
    setStore(STORES.members, members);
    renderMembers();
    closeMemberModal();
}

function editMember(index) {
    editingMemberIndex = index;
    const members = getStore(STORES.members);
    const m = members[index];
    document.getElementById('memberModalTitle').textContent = 'Editar Miembro';
    document.getElementById('memberName').value = m.name;
    document.getElementById('memberEmail').value = m.email;
    document.getElementById('memberPhone').value = m.phone || '';
    document.getElementById('memberMembership').value = m.membership;
    document.getElementById('memberStatus').value = m.status;
    document.getElementById('memberModal').style.display = 'flex';
}

function deleteMember(index) {
    if (!confirm('¿Eliminar miembro?')) return;
    const members = getStore(STORES.members);
    members.splice(index, 1);
    setStore(STORES.members, members);
    renderMembers();
}

function searchMembers() {
    const value = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#memberTableBody tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? '' : 'none';
    });
}

/* ===== CHECK-INS ===== */
function populateCheckinSelect() {
    const sel = document.getElementById('checkinSelect');
    if (!sel) return;
    const members = getStore(STORES.members).filter(m => m.status === 'Activo');
    sel.innerHTML = '<option value="">Seleccionar miembro...</option>';
    members.forEach(m => {
        sel.innerHTML += `<option value="${m.email}">${m.name}</option>`;
    });
}

function checkinMember() {
    const sel = document.getElementById('checkinSelect');
    const email = sel.value;
    if (!email) { alert('Selecciona un miembro'); return; }

    const members = getStore(STORES.members);
    const member = members.find(m => m.email === email);
    if (!member) { alert('Miembro no encontrado'); return; }

    const checkins = getStore(STORES.checkins);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const existing = checkins.find(c => c.memberEmail === email && c.date === today && !c.checkoutTime);
    if (existing) {
        /* Check-out */
        existing.checkoutTime = time;
        setStore(STORES.checkins, checkins);
        alert('Salida registrada: ' + member.name);
    } else {
        /* Check-in */
        checkins.push({
            id: Date.now(),
            memberEmail: email,
            memberName: member.name,
            date: today,
            checkinTime: time,
            checkoutTime: null
        });
        setStore(STORES.checkins, checkins);
        alert('Entrada registrada: ' + member.name);
    }
    sel.value = '';
    renderCheckins();
}

function renderCheckins() {
    const tbody = document.getElementById('checkinTableBody');
    if (!tbody) return;
    const checkins = getStore(STORES.checkins);
    const today = new Date().toISOString().split('T')[0];
    const todayData = checkins.filter(c => c.date === today);
    tbody.innerHTML = '';
    if (todayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Sin registros hoy</td></tr>';
        return;
    }
    todayData.reverse().forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${c.memberName}</td>
            <td>${c.checkinTime}</td>
            <td>${c.checkoutTime || '—'}</td>
            <td>${!c.checkoutTime ? `<button class="edit-btn" onclick="checkoutMember(${c.id})">Salida</button>` : '—'}</td>
        </tr>`;
    });
}

function checkoutMember(id) {
    const checkins = getStore(STORES.checkins);
    const idx = checkins.findIndex(c => c.id === id);
    if (idx === -1) return;
    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    checkins[idx].checkoutTime = now;
    setStore(STORES.checkins, checkins);
    renderCheckins();
}

/* ===== WORKOUTS CRUD ===== */
let editingWorkoutIndex = null;

function populateWorkoutSelect() {
    const sel = document.getElementById('workoutMember');
    if (!sel) return;
    const members = getStore(STORES.members);
    sel.innerHTML = '<option value="">Sin asignar</option>';
    members.forEach(m => {
        sel.innerHTML += `<option value="${m.email}">${m.name}</option>`;
    });
}

function renderWorkouts() {
    const tbody = document.getElementById('workoutTableBody');
    if (!tbody) return;
    const workouts = getStore(STORES.workouts);
    tbody.innerHTML = '';
    if (workouts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">Sin rutinas creadas</td></tr>';
        return;
    }
    workouts.forEach((w, i) => {
        tbody.innerHTML += `<tr>
            <td>${w.name}</td>
            <td>${w.memberName || '—'}</td>
            <td>${w.days || '—'}</td>
            <td>${w.duration || '—'}</td>
            <td>
                <button class="edit-btn" onclick="editWorkout(${i})">Editar</button>
                <button class="delete-btn" onclick="deleteWorkout(${i})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function openWorkoutModal() {
    editingWorkoutIndex = null;
    document.getElementById('workoutModalTitle').textContent = 'Nueva Rutina';
    document.getElementById('workoutName').value = '';
    document.getElementById('workoutMember').value = '';
    document.getElementById('workoutDays').value = '';
    document.getElementById('workoutDuration').value = '';
    document.getElementById('workoutNotes').value = '';
    document.getElementById('workoutModal').style.display = 'flex';
}

function closeWorkoutModal() {
    document.getElementById('workoutModal').style.display = 'none';
}

function saveWorkout() {
    const name = document.getElementById('workoutName').value.trim();
    const memberEmail = document.getElementById('workoutMember').value;
    const days = document.getElementById('workoutDays').value.trim();
    const duration = document.getElementById('workoutDuration').value.trim();
    const notes = document.getElementById('workoutNotes').value.trim();
    if (!name) { alert('Ingresa el nombre de la rutina'); return; }

    const members = getStore(STORES.members);
    const member = members.find(m => m.email === memberEmail);
    const workout = { name, memberEmail, memberName: member ? member.name : '', days, duration, notes };

    const workouts = getStore(STORES.workouts);
    if (editingWorkoutIndex === null) {
        workouts.push(workout);
    } else {
        workouts[editingWorkoutIndex] = workout;
        editingWorkoutIndex = null;
    }
    setStore(STORES.workouts, workouts);
    renderWorkouts();
    closeWorkoutModal();
}

function editWorkout(index) {
    editingWorkoutIndex = index;
    const workouts = getStore(STORES.workouts);
    const w = workouts[index];
    document.getElementById('workoutModalTitle').textContent = 'Editar Rutina';
    document.getElementById('workoutName').value = w.name;
    document.getElementById('workoutMember').value = w.memberEmail || '';
    document.getElementById('workoutDays').value = w.days || '';
    document.getElementById('workoutDuration').value = w.duration || '';
    document.getElementById('workoutNotes').value = w.notes || '';
    document.getElementById('workoutModal').style.display = 'flex';
}

function deleteWorkout(index) {
    if (!confirm('¿Eliminar rutina?')) return;
    const workouts = getStore(STORES.workouts);
    workouts.splice(index, 1);
    setStore(STORES.workouts, workouts);
    renderWorkouts();
}

/* ===== MEMBERSHIPS CRUD ===== */
let editingMembershipIndex = null;

function renderMemberships() {
    const tbody = document.getElementById('membershipTableBody');
    if (!tbody) return;
    const memberships = getStore(STORES.memberships);
    const members = getStore(STORES.members);
    tbody.innerHTML = '';
    if (memberships.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">Sin planes creados</td></tr>';
        return;
    }
    memberships.forEach((p, i) => {
        const active = members.filter(m => m.membership === p.name && m.status === 'Activo').length;
        tbody.innerHTML += `<tr>
            <td>${p.name}</td>
            <td>$${p.price}</td>
            <td>${p.duration}</td>
            <td>${active}</td>
            <td>
                <button class="edit-btn" onclick="editMembership(${i})">Editar</button>
                <button class="delete-btn" onclick="deleteMembership(${i})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function openMembershipModal() {
    editingMembershipIndex = null;
    document.getElementById('membershipModalTitle').textContent = 'Nuevo Plan';
    document.getElementById('membershipName').value = '';
    document.getElementById('membershipPrice').value = '';
    document.getElementById('membershipDuration').value = '';
    document.getElementById('membershipBenefits').value = '';
    document.getElementById('membershipModal').style.display = 'flex';
}

function closeMembershipModal() {
    document.getElementById('membershipModal').style.display = 'none';
}

function saveMembership() {
    const name = document.getElementById('membershipName').value.trim();
    const price = document.getElementById('membershipPrice').value;
    const duration = document.getElementById('membershipDuration').value.trim();
    const benefits = document.getElementById('membershipBenefits').value.trim();
    if (!name || !price) { alert('Completa nombre y precio'); return; }

    const memberships = getStore(STORES.memberships);
    const plan = { name, price, duration, benefits };

    if (editingMembershipIndex === null) {
        memberships.push(plan);
    } else {
        memberships[editingMembershipIndex] = plan;
        editingMembershipIndex = null;
    }
    setStore(STORES.memberships, memberships);
    renderMemberships();
    closeMembershipModal();
}

function editMembership(index) {
    editingMembershipIndex = index;
    const memberships = getStore(STORES.memberships);
    const p = memberships[index];
    document.getElementById('membershipModalTitle').textContent = 'Editar Plan';
    document.getElementById('membershipName').value = p.name;
    document.getElementById('membershipPrice').value = p.price;
    document.getElementById('membershipDuration').value = p.duration || '';
    document.getElementById('membershipBenefits').value = p.benefits || '';
    document.getElementById('membershipModal').style.display = 'flex';
}

function deleteMembership(index) {
    if (!confirm('¿Eliminar plan?')) return;
    const memberships = getStore(STORES.memberships);
    memberships.splice(index, 1);
    setStore(STORES.memberships, memberships);
    renderMemberships();
}

/* ===== PAYMENTS CRUD ===== */
let editingPaymentIndex = null;

function populatePaymentSelect() {
    const sel = document.getElementById('paymentMember');
    if (!sel) return;
    const members = getStore(STORES.members);
    sel.innerHTML = '<option value="">Seleccionar miembro</option>';
    members.forEach(m => {
        sel.innerHTML += `<option value="${m.email}" data-plan="${m.membership}">${m.name}</option>`;
    });
    sel.onchange = function() {
        const opt = this.options[this.selectedIndex];
        document.getElementById('paymentPlan').value = opt.dataset.plan || '';
        const plans = getStore(STORES.memberships);
        const plan = plans.find(p => p.name === opt.dataset.plan);
        document.getElementById('paymentAmount').value = plan ? plan.price : '';
    };
}

function renderPayments() {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;
    const payments = getStore(STORES.payments);
    tbody.innerHTML = '';
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">Sin pagos registrados</td></tr>';
        return;
    }
    payments.slice().reverse().forEach((p, i) => {
        const realIndex = payments.length - 1 - i;
        tbody.innerHTML += `<tr>
            <td>${p.memberName}</td>
            <td>${p.plan}</td>
            <td>$${p.amount}</td>
            <td>${p.date}</td>
            <td><span class="status-badge ${p.status === 'Pagado' ? 'active' : p.status === 'Pendiente' ? 'pending' : 'inactive'}">${p.status}</span></td>
            <td>
                <button class="edit-btn" onclick="editPayment(${realIndex})">Editar</button>
                <button class="delete-btn" onclick="deletePayment(${realIndex})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function openPaymentModal() {
    editingPaymentIndex = null;
    document.getElementById('paymentModalTitle').textContent = 'Nuevo Pago';
    document.getElementById('paymentMember').value = '';
    document.getElementById('paymentPlan').value = '';
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentStatus').value = 'Pagado';
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function savePayment() {
    const email = document.getElementById('paymentMember').value;
    const plan = document.getElementById('paymentPlan').value;
    const amount = document.getElementById('paymentAmount').value;
    const status = document.getElementById('paymentStatus').value;
    if (!email || !amount) { alert('Selecciona un miembro y monto'); return; }

    const members = getStore(STORES.members);
    const member = members.find(m => m.email === email);

    const payments = getStore(STORES.payments);
    const payment = {
        id: Date.now(),
        memberEmail: email,
        memberName: member ? member.name : '',
        plan: plan,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: status
    };

    if (editingPaymentIndex === null) {
        payments.push(payment);
    } else {
        payments[editingPaymentIndex] = payment;
        editingPaymentIndex = null;
    }
    setStore(STORES.payments, payments);
    renderPayments();
    closePaymentModal();
}

function editPayment(index) {
    editingPaymentIndex = index;
    const payments = getStore(STORES.payments);
    const p = payments[index];
    document.getElementById('paymentModalTitle').textContent = 'Editar Pago';
    document.getElementById('paymentMember').value = p.memberEmail;
    document.getElementById('paymentPlan').value = p.plan;
    document.getElementById('paymentAmount').value = p.amount;
    document.getElementById('paymentStatus').value = p.status;
    document.getElementById('paymentModal').style.display = 'flex';
}

function deletePayment(index) {
    if (!confirm('¿Eliminar pago?')) return;
    const payments = getStore(STORES.payments);
    payments.splice(index, 1);
    setStore(STORES.payments, payments);
    renderPayments();
}

/* ===== USER GREETING ===== */
(function showUserName() {
    const el = document.getElementById('userNameDisplay');
    if (el) el.textContent = 'Hola, Administrador';
})();

/* ===== LOGOUT ===== */
function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
}

/* ===== SEED DEFAULT DATA ===== */
(function seedData() {
    if (!localStorage.getItem('_seeded')) {
        const memberships = [
            { name: 'Basic', price: 499, duration: '30 días', benefits: 'Acceso general' },
            { name: 'Pro', price: 899, duration: '30 días', benefits: 'Entrenador personal' },
            { name: 'Elite', price: 1499, duration: '30 días', benefits: 'Acceso VIP total' }
        ];
        setStore(STORES.memberships, memberships);
        localStorage.setItem('_seeded', 'true');
    }
})();

/* ===== SEED DEMO MEMBERS ===== */
(function seedDemoMembers() {
    const members = getStore(STORES.members);
    if (members.length === 0) {
        const soon = new Date(); soon.setDate(soon.getDate() + 2);
        const later = new Date(); later.setDate(later.getDate() + 25);
        const demos = [
            { name: 'Carlos López', email: 'carlos@email.com', phone: '4491234567', membership: 'Pro', status: 'Activo', created: new Date().toISOString(), nextPaymentDate: soon.toISOString().split('T')[0] },
            { name: 'María García', email: 'maria@email.com', phone: '4497654321', membership: 'Elite', status: 'Activo', created: new Date().toISOString(), nextPaymentDate: later.toISOString().split('T')[0] },
            { name: 'Juan Pérez', email: 'juan@email.com', phone: '4499876543', membership: 'Basic', status: 'Activo', created: new Date().toISOString(), nextPaymentDate: later.toISOString().split('T')[0] }
        ];
        setStore(STORES.members, demos);
    }
})();

/* ===== INIT ===== */
showSection('dashboard');
