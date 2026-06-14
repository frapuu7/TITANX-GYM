/* ===== MEMBER DASHBOARD - TITANX FITNESS ===== */

function getStore(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
const userEmail = loggedUser ? loggedUser.email : '';

function getMemberData() {
    return getStore("gymMembers").find(m => m.email === userEmail) || null;
}

/* --- NAV --- */
const sectionTitles = {
    inicio: 'Inicio', rutinas: 'Mis Rutinas', dietas: 'Mis Dietas',
    coach: 'Mi Coach', horarios: 'Horarios', pagos: 'Mis Pagos',
    plan: 'Mi Plan', perfil: 'Mi Perfil'
};

function showSection(section) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const el = document.getElementById('section-' + section);
    if (el) el.style.display = 'block';
    document.getElementById('sectionTitle').textContent = sectionTitles[section] || 'Inicio';
    if (section === 'inicio') loadInicio();
    if (section === 'rutinas') loadRutinas();
    if (section === 'dietas') loadDietas();
    if (section === 'coach') loadCoach();
    if (section === 'horarios') loadHorarios();
    if (section === 'pagos') loadPagos();
    if (section === 'plan') loadPlan();
    if (section === 'perfil') loadPerfil();
}

/* --- USER GREETING --- */
(function() {
    const el = document.getElementById('userNameDisplay');
    if (loggedUser && el) el.textContent = 'Hola, ' + loggedUser.name;
})();

/* ===== INICIO ===== */
function loadInicio() {
    document.getElementById('welcomeName').textContent = loggedUser ? loggedUser.name : 'Miembro';

    const workouts = getStore("gymWorkouts").filter(w => w.memberEmail === userEmail);
    document.getElementById('memberRoutineCount').textContent = workouts.length;

    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    const checkins = getStore("gymCheckins").filter(c => c.memberEmail === userEmail && c.date >= month);
    document.getElementById('memberCheckinCount').textContent = checkins.length;

    const diets = getStore("gymDiets").filter(d => d.memberEmail === userEmail);
    document.getElementById('memberDietCount').textContent = diets.length;

    const schedule = getStore("gymSchedule");
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const todayName = days[new Date().getDay()];
    const todayClasses = schedule.filter(s => s.day === todayName);
    document.getElementById('memberNextClass').textContent = todayClasses.length > 0 ? todayClasses[0].time : '—';

    /* Next workout */
    const nw = document.getElementById('nextWorkout');
    if (workouts.length > 0) {
        nw.innerHTML = workouts.slice(0, 2).map(w =>
            `<div class="mini-card"><strong>${w.name}</strong> — ${w.days || 'Flexible'} | ${w.duration || '—'}</div>`
        ).join('');
    } else {
        nw.innerHTML = '<p class="text-muted">Sin rutinas asignadas. Consulta con tu entrenador.</p>';
    }

    /* Membership status */
    const member = getMemberData();
    const ms = document.getElementById('memberStatusCard');
    if (member) {
        const statusClass = member.status === 'Activo' ? 'active' : 'inactive';
        let paymentHtml = '';
        if (member.nextPaymentDate) {
            const daysLeft = daysUntilDate(member.nextPaymentDate);
            const dateStr = new Date(member.nextPaymentDate).toLocaleDateString('es-MX');
            const dotClass = daysLeft <= 0 ? 'overdue' : daysLeft <= 3 ? 'warning' : 'ok';
            const label = daysLeft <= 0 ? 'VENCIDO' : daysLeft + ' días';
            paymentHtml = `<p><strong>Próximo pago:</strong> <span class="payment-status-dot ${dotClass}" style="display:inline-block;vertical-align:middle;margin-right:5px;"></span> ${dateStr} (${label})</p>`;
        } else {
            paymentHtml = `<p><strong>Próximo pago:</strong> <span style="color:#888;">No registrado</span></p>`;
        }
        ms.innerHTML = `
            <p><strong>Plan:</strong> ${member.membership}</p>
            <p><strong>Estado:</strong> <span class="status-badge ${statusClass}">${member.status}</span></p>
            <p><strong>Registro:</strong> ${new Date(member.created).toLocaleDateString('es-MX')}</p>
            ${paymentHtml}
        `;
    } else {
        ms.innerHTML = '<p class="text-muted">Completa tu perfil para ver tu membresía.</p>';
    }
}

/* ===== RUTINAS ===== */
function loadRutinas() {
    const container = document.getElementById('routinesList');
    const workouts = getStore("gymWorkouts").filter(w => w.memberEmail === userEmail);

    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-dumbbell"></i>
                <p>No tienes rutinas asignadas todavía.</p>
                <p class="text-muted">Tu entrenador te asignará rutinas personalizadas.</p>
            </div>`;
        return;
    }

    const dayColors = { Lunes: '#ff3131', Martes: '#e67e22', Miércoles: '#f1c40f', Jueves: '#2ecc71', Viernes: '#3498db', Sábado: '#9b59b6', Domingo: '#e84393' };

    container.innerHTML = workouts.map(w => {
        let daysHtml = '';
        if (w.days) {
            daysHtml = '<div class="day-pills">';
            w.days.split(',').forEach(d => {
                const day = d.trim();
                const color = dayColors[day] || '#ff3131';
                daysHtml += `<span class="day-pill" style="background:${color}20;color:${color};border:1px solid ${color}40;">${day}</span>`;
            });
            daysHtml += '</div>';
        }

        let exercisesHtml = '';
        if (w.notes) {
            const lines = w.notes.split('\n').filter(l => l.trim());
            const exerciseLines = lines.filter(l => l.includes('•') || l.includes('SEMANA') || l.includes('TIP'));
            const firstLine = lines.find(l => l.includes('SEMANA'));
            const tipLine = lines.find(l => l.includes('TIP'));

            if (firstLine) {
                exercisesHtml += `<div class="routine-phase">${firstLine}</div>`;
            }

            const dayBlocks = [];
            let currentDay = '';
            lines.forEach(l => {
                if (l.match(/^[A-ZÁÉÍÓÚÑ]{4,}/)) {
                    currentDay = l;
                } else if (l.includes('•') && currentDay) {
                    dayBlocks.push({ day: currentDay, exercise: l });
                }
            });

            if (dayBlocks.length > 0) {
                exercisesHtml += '<div class="exercise-list">';
                dayBlocks.forEach(e => {
                    exercisesHtml += `<div class="exercise-item">
                        <span class="ex-day-badge">${e.day.split('(')[0].trim().substring(0, 3)}</span>
                        <span class="ex-text">${e.exercise}</span>
                    </div>`;
                });
                exercisesHtml += '</div>';
            }

            if (tipLine) {
                exercisesHtml += `<div class="routine-tip">💡 ${tipLine.replace('TIP: ', '')}</div>`;
            }
        }

        return `<div class="routine-card">
            <div class="routine-header">
                <div>
                    <h3>${w.name}</h3>
                    <div class="routine-meta">
                        <span><i class="fa-regular fa-clock"></i> ${w.duration || '—'}</span>
                    </div>
                </div>
                <span class="status-badge active">Activa</span>
            </div>
            ${daysHtml}
            ${exercisesHtml}
        </div>`;
    }).join('');
}

/* ===== DIETAS ===== */
function loadDietas() {
    const container = document.getElementById('dietsList');
    const diets = getStore("gymDiets").filter(d => d.memberEmail === userEmail);

    if (diets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-apple-alt"></i>
                <p>No tienes planes de alimentación asignados.</p>
                <p class="text-muted">Solicita una asesoría nutricional con tu entrenador.</p>
            </div>`;
        return;
    }

    container.innerHTML = diets.map(d => {
        /* Parse macros from notes */
        let protein = 0, carbs = 0, fats = 0;
        let mealSections = [];
        if (d.notes) {
            const macroMatch = d.notes.match(/Proteína: (\d+)g.*Carbohidratos: (\d+)g.*Grasas: (\d+)g/);
            if (macroMatch) {
                protein = parseInt(macroMatch[1]);
                carbs = parseInt(macroMatch[2]);
                fats = parseInt(macroMatch[3]);
            }

            /* Split meal plan into sections */
            const lines = d.notes.split('\n');
            let currentMeal = '';
            let currentFoods = [];
            let inMacro = true;
            lines.forEach(l => {
                if (l.match(/^[A-ZÁÉÍÓÚÑ ]+ \(\d+:\d+\):/) || l.match(/^[A-ZÁÉÍÓÚÑ ]+ \(\d+:\d+\)/) || l.match(/^[A-ZÁÉÍÓÚÑ]{4,} \(\d+:/)) {
                    if (currentMeal && currentFoods.length > 0) {
                        mealSections.push({ name: currentMeal, foods: currentFoods });
                    }
                    currentMeal = l;
                    currentFoods = [];
                    inMacro = false;
                } else if (l.includes('•') && !inMacro) {
                    currentFoods.push(l);
                } else if (l.includes('💧')) {
                    currentFoods.push(l);
                }
            });
            if (currentMeal && currentFoods.length > 0) {
                mealSections.push({ name: currentMeal, foods: currentFoods });
            }
        }

        const total = protein + carbs + fats || 1;
        const proteinPct = Math.round((protein * 4 / (d.calories || 2000)) * 100);
        const carbsPct = Math.round((carbs * 4 / (d.calories || 2000)) * 100);
        const fatsPct = Math.round((fats * 9 / (d.calories || 2000)) * 100);

        const mealIcons = { DESAYUNO: '☀️', 'COLACIÓN': '🍎', ALMUERZO: '🍗', COMIDA: '🍗', CENA: '🌙', 'POST-CENA': '🌙' };

        let mealsHtml = '';
        if (mealSections.length > 0) {
            mealsHtml = '<div class="diet-meals">';
            mealSections.forEach(m => {
                const icon = Object.keys(mealIcons).find(k => m.name.includes(k));
                mealsHtml += `<div class="diet-meal-card">
                    <div class="diet-meal-header">
                        <span>${icon ? mealIcons[icon] : '🍽️'}</span>
                        <strong>${m.name}</strong>
                    </div>
                    <div class="diet-meal-foods">`;
                m.foods.forEach(f => {
                    mealsHtml += `<div class="diet-food-item">${f}</div>`;
                });
                mealsHtml += `</div></div>`;
            });
            mealsHtml += '</div>';
        }

        return `<div class="diet-card">
            <div class="diet-card-header">
                <div>
                    <h3><i class="fa-solid fa-apple-alt" style="color:#2ecc71"></i> ${d.name}</h3>
                    <div class="diet-calorie-badge">🔥 ${d.calories} kcal/día</div>
                </div>
                <span class="status-badge ${d.status === 'Activo' ? 'active' : 'pending'}">${d.status}</span>
            </div>

            <div class="diet-macro-bar">
                <div class="macro-bar">
                    <div class="macro-segment protein" style="width:${proteinPct}%">
                        <span>P ${protein}g</span>
                    </div>
                    <div class="macro-segment carbs" style="width:${carbsPct}%">
                        <span>C ${carbs}g</span>
                    </div>
                    <div class="macro-segment fats" style="width:${fatsPct}%">
                        <span>G ${fats}g</span>
                    </div>
                </div>
                <div class="macro-legend">
                    <span><span class="dot protein"></span> Proteína ${proteinPct}%</span>
                    <span><span class="dot carbs"></span> Carbos ${carbsPct}%</span>
                    <span><span class="dot fats"></span> Grasas ${fatsPct}%</span>
                </div>
            </div>

            ${mealsHtml}
        </div>`;
    }).join('');
}

/* ===== COACH ===== */
function loadCoach() {
    const container = document.getElementById('coachInfo');
    const coaches = getStore("gymCoaches");

    if (coaches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-tie"></i>
                <p>No hay información de entrenadores disponible.</p>
            </div>`;
        return;
    }

    container.innerHTML = coaches.map(c => `
        <div class="coach-card">
            <div class="coach-avatar">
                <img src="${c.img}" alt="${c.name}">
            </div>
            <div class="coach-info">
                <h3>${c.name}</h3>
                <p class="coach-role">${c.role}</p>
                <div class="coach-details">
                    <p><i class="fa-solid fa-calendar"></i> <strong>Experiencia:</strong> ${c.exp}</p>
                    <p><i class="fa-solid fa-dumbbell"></i> <strong>Especialidad:</strong> ${c.specialty}</p>
                    <p><i class="fa-solid fa-graduation-cap"></i> <strong>Certificación:</strong> ${c.cert}</p>
                </div>
                <p class="coach-bio">${c.bio}</p>
            </div>
        </div>
    `).join('');
}

/* ===== HORARIOS ===== */
function loadHorarios() {
    const container = document.getElementById('scheduleGrid');
    const schedule = getStore("gymSchedule");
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (schedule.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-clock"></i><p>No hay horarios disponibles.</p></div>`;
        return;
    }

    let html = '<div class="schedule-table-wrap"><table class="schedule-table"><thead><tr><th>Horario</th>';
    days.forEach(d => { html += `<th>${d}</th>`; });
    html += '</tr></thead><tbody>';

    const timeSlots = ['6:00 - 7:00', '7:00 - 8:00', '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00'];

    timeSlots.forEach(slot => {
        html += `<tr><td class="time-cell">${slot}</td>`;
        days.forEach(day => {
            const cls = schedule.filter(s => s.day === day && s.time === slot);
            if (cls.length > 0) {
                html += `<td class="class-cell">${cls.map(c => `<div class="class-name">${c.class}</div>`).join('')}</td>`;
            } else {
                html += `<td class="empty-cell">—</td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/* ===== PAGOS ===== */
function loadPagos() {
    const container = document.getElementById('paymentsList');
    const payments = getStore("gymPayments").filter(p => p.memberEmail === userEmail);

    /* Next payment info */
    const member = getMemberData();
    const nextInfo = document.getElementById('nextPaymentInfo');
    if (member && member.nextPaymentDate) {
        const daysLeft = daysUntilDate(member.nextPaymentDate);
        const dateStr = new Date(member.nextPaymentDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        let statusHtml = '';
        if (daysLeft <= 0) {
            statusHtml = `<div class="payment-status-dot overdue"></div> VENCIDO — Debías pagar el ${dateStr}`;
        } else if (daysLeft <= 3) {
            statusHtml = `<div class="payment-status-dot warning"></div> Próximo vencimiento: ${dateStr} (${daysLeft} día${daysLeft === 1 ? '' : 's'})`;
        } else {
            statusHtml = `<div class="payment-status-dot ok"></div> Próximo pago: ${dateStr} (${daysLeft} días)`;
        }
        nextInfo.innerHTML = `<div class="next-payment-bar">${statusHtml}</div>`;
    } else {
        nextInfo.innerHTML = `<div class="next-payment-bar"><div class="payment-status-dot"></div> Sin fecha de pago registrada. Realiza tu primer pago.</div>`;
    }

    if (payments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-credit-card"></i>
                <p>No hay pagos registrados.</p>
                <p class="text-muted">Realiza tu primer pago para activar tu membresía.</p>
            </div>`;
        return;
    }

    let html = '<div class="table-container"><table><thead><tr><th>Plan</th><th>Monto</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>';
    payments.slice().reverse().forEach(p => {
        const statusClass = p.status === 'Pagado' ? 'active' : p.status === 'Pendiente' ? 'pending' : 'inactive';
        html += `<tr>
            <td>${p.plan}</td>
            <td>$${p.amount}</td>
            <td>${new Date(p.date).toLocaleDateString('es-MX')}</td>
            <td><span class="status-badge ${statusClass}">${p.status}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/* ===== PAYMENT ALERT ===== */
function daysUntilDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function checkPaymentDueDate() {
    const member = getMemberData();
    const alert = document.getElementById('paymentAlert');
    const text = document.getElementById('paymentAlertText');
    if (!alert || !text || !member || !member.nextPaymentDate) {
        if (alert) alert.style.display = 'none';
        return;
    }

    const daysLeft = daysUntilDate(member.nextPaymentDate);
    const dateStr = new Date(member.nextPaymentDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    if (daysLeft < 0) {
        alert.className = 'payment-alert danger';
        text.innerHTML = `⚠️ Tu pago del <strong>${dateStr}</strong> está <strong>VENCIDO</strong>. Renueva tu membresía para seguir entrenando.`;
        alert.style.display = 'flex';
    } else if (daysLeft <= 3) {
        alert.className = 'payment-alert warning';
        text.innerHTML = `⏳ Tu pago vence el <strong>${dateStr}</strong> (${daysLeft} día${daysLeft === 1 ? '' : 's'}). ¡Realiza tu pago a tiempo!`;
        alert.style.display = 'flex';
    } else {
        alert.style.display = 'none';
    }
}

function dismissAlert() {
    document.getElementById('paymentAlert').style.display = 'none';
}

/* ===== CARD PAYMENT ===== */
function openCardPayment() {
    document.getElementById('cardPaymentModal').style.display = 'flex';
    const member = getMemberData();
    if (member && member.membership) {
        const prices = { Basic: 499, Pro: 899, Elite: 1499 };
        const sel = document.getElementById('cardAmount');
        const price = prices[member.membership] || 899;
        sel.value = String(price);
        updatePayAmount();
    }
}

function closeCardPayment() {
    document.getElementById('cardPaymentModal').style.display = 'none';
}

function updatePayAmount() {
    const amount = document.getElementById('cardAmount').value;
    document.getElementById('payAmountDisplay').textContent = amount;
}

/* Bind card amount select */
(function() {
    const sel = document.getElementById('cardAmount');
    if (sel) sel.addEventListener('change', updatePayAmount);
})();

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
    }
    input.value = formatted;
    updateCardPreview();
}

function formatCardExp(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
    }
    input.value = val;
    updateCardPreview();
}

function updateCardPreview() {
    const num = document.getElementById('cardNumber').value || '•••• •••• •••• ••••';
    const name = document.getElementById('cardName').value.toUpperCase() || 'TITULAR';
    const exp = document.getElementById('cardExp').value || 'MM/AA';

    document.getElementById('cardNumberDisplay').textContent = num || '•••• •••• •••• ••••';
    document.getElementById('cardNameDisplay').textContent = name;
    document.getElementById('cardExpDisplay').textContent = exp;
}

function submitCardPayment() {
    const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value.trim();
    const cardExp = document.getElementById('cardExp').value.trim();
    const cardCvv = document.getElementById('cardCvv').value.trim();
    const amount = document.getElementById('cardAmount').value;
    const member = getMemberData();

    if (!cardNum || cardNum.length < 13) { alert('Ingresa un número de tarjeta válido'); return; }
    if (!cardName) { alert('Ingresa el nombre del titular'); return; }
    if (!cardExp || cardExp.length < 4) { alert('Ingresa la fecha de vencimiento'); return; }
    if (!cardCvv || cardCvv.length < 3) { alert('Ingresa el CVV'); return; }

    const planNames = { '499': 'Basic', '899': 'Pro', '1499': 'Elite' };
    const planName = planNames[amount] || (member ? member.membership : 'Basic');

    /* Save payment */
    let payments = getStore("gymPayments");
    payments.push({
        id: Date.now(),
        memberEmail: userEmail,
        memberName: loggedUser ? loggedUser.name : '',
        plan: planName,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pagado',
        method: 'Tarjeta',
        last4: cardNum.slice(-4)
    });
    setStore("gymPayments", payments);

    /* Update next payment date (30 days from now) */
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    let members = getStore("gymMembers");
    const idx = members.findIndex(m => m.email === userEmail);
    if (idx !== -1) {
        members[idx].nextPaymentDate = nextDateStr;
        members[idx].membership = planName;
        members[idx].status = 'Activo';
        setStore("gymMembers", members);
    }

    closeCardPayment();
    alert('✅ Pago exitoso!\n\nTarjeta: **** ' + cardNum.slice(-4) + '\nPlan: ' + planName + '\nMonto: $' + amount + '\nPróximo vencimiento: ' + new Date(nextDateStr).toLocaleDateString('es-MX'));

    /* Reset form */
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardName').value = '';
    document.getElementById('cardExp').value = '';
    document.getElementById('cardCvv').value = '';
    updateCardPreview();

    loadPagos();
    checkPaymentDueDate();
}

/* ===== INIT PAYMENT ALERT ON INICIO ===== */
(function() {
    const origLoadInicio = loadInicio;
    loadInicio = function() {
        origLoadInicio();
        checkPaymentDueDate();
    };
})();

/* ===== PERFIL ===== */
function loadPerfil() {
    const member = getMemberData();
    if (!member) return;

    document.getElementById('profileName').value = member.name || '';
    document.getElementById('profileEmail').value = member.email || '';
    document.getElementById('profilePhone').value = member.phone || '';
    document.getElementById('profileMembership').value = member.membership || '—';
    document.getElementById('profileSince').value = member.created ? new Date(member.created).toLocaleDateString('es-MX') : '—';
}

function updateProfile() {
    const name = document.getElementById('profileName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    if (!name) { alert('El nombre es obligatorio'); return; }

    let members = getStore("gymMembers");
    const idx = members.findIndex(m => m.email === userEmail);
    if (idx !== -1) {
        members[idx].name = name;
        members[idx].phone = phone;
        setStore("gymMembers", members);
        alert('Perfil actualizado correctamente');
    }
}

/* ===== MI PLAN ===== */
function loadPlan() {
    const container = document.getElementById('planDisplay');
    const formContainer = document.getElementById('planFormContainer');
    const member = getMemberData();

    if (member && member.peso && member.altura && member.nivel) {
        formContainer.style.display = 'none';
        renderGeneratedPlan(container, member);
    } else {
        formContainer.style.display = 'block';
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-list"></i>
                <p>No has generado un plan todavía.</p>
                <p class="text-muted">Completa tus datos para obtener una rutina y dieta personalizada.</p>
            </div>`;
    }
}

function showPlanForm() {
    document.getElementById('planFormContainer').style.display = 'block';
    const member = getMemberData();
    if (member && member.peso) {
        document.getElementById('planWeight').value = member.peso;
        document.getElementById('planHeight').value = member.altura;
        document.getElementById('planLevel').value = member.nivel || 'principiante';
        document.getElementById('planGoal').value = member.objetivo || 'tonificar';
    }
}

function hidePlanForm() {
    document.getElementById('planFormContainer').style.display = 'none';
}

function generatePlan() {
    const peso = parseFloat(document.getElementById('planWeight').value);
    const altura = parseFloat(document.getElementById('planHeight').value);
    const nivel = document.getElementById('planLevel').value;
    const objetivo = document.getElementById('planGoal').value;

    if (!peso || !altura || peso < 30 || peso > 300 || altura < 100 || altura > 250) {
        alert('Ingresa valores válidos (peso 30-300 kg, altura 100-250 cm)');
        return;
    }

    /* Save metrics to member */
    let members = getStore("gymMembers");
    const idx = members.findIndex(m => m.email === userEmail);
    if (idx !== -1) {
        members[idx].peso = peso;
        members[idx].altura = altura;
        members[idx].nivel = nivel;
        members[idx].objetivo = objetivo;
        setStore("gymMembers", members);
    }

    /* Generate routine */
    const routine = generateRoutine(peso, altura, nivel, objetivo);
    let workouts = getStore("gymWorkouts");
    /* Remove old generated routines for this user */
    workouts = workouts.filter(w => !(w.memberEmail === userEmail && w.generated));
    workouts.push(routine);
    setStore("gymWorkouts", workouts);

    /* Generate diet */
    const diet = generateDiet(peso, altura, nivel, objetivo);
    let diets = getStore("gymDiets");
    diets = diets.filter(d => !(d.memberEmail === userEmail && d.generated));
    diets.push(diet);
    setStore("gymDiets", diets);

    hidePlanForm();
    loadPlan();
}

function generateRoutine(peso, altura, nivel, objetivo) {
    const routines = {
        principiante: {
            name: 'Full Body Principiante',
            days: 'Lunes, Miércoles, Viernes',
            duration: '45 min',
            notes: 'SEMANA 1-2: 3 series x 12 reps | SEMANA 3-4: 4 series x 10 reps\n\n' +
                'LUNES (Full Body A):\n' +
                '• Sentadillas con peso corporal → Sentadillas con barra\n' +
                '• Press de banca con mancuernas\n' +
                '• Remo con barra\n' +
                '• Plancha 3x30s\n' +
                '• Curl de bíceps con mancuernas\n' +
                '• Elevación de talones (pantorrillas)\n\n' +
                'MIÉRCOLES (Full Body B):\n' +
                '• Peso muerto rumano con mancuernas\n' +
                '• Press militar con mancuernas\n' +
                '• Jalón al pecho (polea)\n' +
                '• Sentadilla búlgara (sin peso)\n' +
                '• Tríceps en polea alta\n' +
                '• Abdominales declinados 3x15\n\n' +
                'VIERNES (Full Body C):\n' +
                '• Zancadas con mancuernas\n' +
                '• Press inclinado con mancuernas\n' +
                '• Dominadas asistidas o jalón al pecho\n' +
                '• Peso muerto convencional (barra ligera)\n' +
                '• Curl martillo\n' +
                '• Elevación lateral de hombros\n\n' +
                'TIP: Descansa 60s entre series. Aumenta peso solo cuando completes todas las reps con buena forma.'
        },
        intermedio: {
            name: 'Upper / Lower Split',
            days: 'Lunes, Martes, Jueves, Viernes',
            duration: '50-60 min',
            notes: 'SEMANA 1-4: 4 series x 8-12 reps\n\n' +
                'LUNES (Upper A):\n' +
                '• Press banca con barra 4x8\n' +
                '• Remo con barra 4x10\n' +
                '• Press militar con barra 4x8\n' +
                '• Dominadas 4xfallo\n' +
                '• Curl con barra Z 3x12\n' +
                '• Tríceps en polea 3x15\n\n' +
                'MARTES (Lower A):\n' +
                '• Sentadilla con barra 4x8\n' +
                '• Peso muerto rumano 4x10\n' +
                '• Zancadas con mancuernas 3x12\n' +
                '• Elevación de talones 4x15\n' +
                '• Curl femoral acostado 3x12\n' +
                '• Abdominales en máquina 3x15\n\n' +
                'JUEVES (Upper B):\n' +
                '• Press inclinado con mancuernas 4x10\n' +
                '• Jalón al pecho 4x10\n' +
                '• Elevaciones laterales 3x15\n' +
                '• Remo en máquina 4x10\n' +
                '• Curl alternado con mancuernas 3x12\n' +
                '• Fondos en paralelas 3xfallo\n\n' +
                'VIERNES (Lower B):\n' +
                '• Peso muerto convencional 4x6\n' +
                '• Sentadilla búlgara 3x10\n' +
                '• Hip thrust 4x12\n' +
                '• Pantorrilla en prensa 4x20\n' +
                '• Abdominales con peso 3x12'
        },
        avanzado: {
            name: 'Push / Pull / Legs',
            days: 'Lunes a Viernes',
            duration: '60-75 min',
            notes: 'SEMANA 1-4: 4-5 series x 6-12 reps\n\n' +
                'LUNES (Push A):\n' +
                '• Press banca inclinado con barra 5x6\n' +
                '• Press militar con barra 4x8\n' +
                '• Fondos en paralelas con peso 4x10\n' +
                '• Aperturas con mancuernas 3x12\n' +
                '• Elevaciones laterales 4x15\n' +
                '• Tríceps en polea 4x12\n\n' +
                'MARTES (Pull A):\n' +
                '• Dominadas con peso 5x6\n' +
                '• Remo con barra 4x8\n' +
                '• Face pull 4x15\n' +
                '• Curl con barra Z 4x10\n' +
                '• Remo en T 4x10\n' +
                '• Curl martillo 3x12\n\n' +
                'MIÉRCOLES (Legs A):\n' +
                '• Sentadilla con barra 5x6\n' +
                '• Peso muerto rumano 4x10\n' +
                '• Prensa de piernas 4x12\n' +
                '• Zancadas con barra 3x10\n' +
                '• Curl femoral 4x12\n' +
                '• Pantorrilla de pie 5x15\n\n' +
                'JUEVES (Push B):\n' +
                '• Press banca plano 5x8\n' +
                '• Press mancuernas inclinado 4x10\n' +
                '• Press Arnold 4x10\n' +
                '• Cruce en poleas 3x15\n' +
                '• Laterales con cable 4x12\n' +
                '• Extensión de tríceps 4x12\n\n' +
                'VIERNES (Pull B + Glúteos):\n' +
                '• Jalón al pecho 4x10\n' +
                '• Remo en máquina 4x12\n' +
                '• Peso muerto convencional 4x6\n' +
                '• Curl concentrado 3x12\n' +
                '• Pájaros (deltoide posterior) 4x15\n' +
                '• Abdominales con rueda 4xfallo'
        }
    };

    const base = routines[nivel] || routines.principiante;
    return {
        name: base.name,
        memberEmail: userEmail,
        memberName: loggedUser ? loggedUser.name : '',
        days: base.days,
        duration: base.duration,
        notes: base.notes,
        generated: true,
        createdAt: new Date().toISOString()
    };
}

function generateDiet(peso, altura, nivel, objetivo) {
    /* Calcular BMR (Mifflin-St Jeor, asumiendo hombre 25 años para simplicidad) */
    const bmr = 10 * peso + 6.25 * altura - 5 * 25 + 5;

    const activityMultipliers = { principiante: 1.3, intermedio: 1.5, avancado: 1.7 };
    const tdee = Math.round(bmr * (activityMultipliers[nivel] || 1.4));

    /* Adjust calories by goal */
    let calories, carbPct, proteinPct, fatPct, dietName, meals;
    switch (objetivo) {
        case 'volumen':
            calories = Math.round(tdee * 1.15);
            carbPct = 0.45; proteinPct = 0.30; fatPct = 0.25;
            dietName = 'Dieta Volumen - ' + nivel.charAt(0).toUpperCase() + nivel.slice(1);
            meals = '5 comidas';
            break;
        case 'perder_peso':
            calories = Math.round(tdee * 0.80);
            carbPct = 0.30; proteinPct = 0.40; fatPct = 0.30;
            dietName = 'Dieta Déficit - ' + nivel.charAt(0).toUpperCase() + nivel.slice(1);
            meals = '5-6 comidas';
            break;
        default: /* tonificar */
            calories = Math.round(tdee * 0.90);
            carbPct = 0.40; proteinPct = 0.35; fatPct = 0.25;
            dietName = 'Dieta Definición - ' + nivel.charAt(0).toUpperCase() + nivel.slice(1);
            meals = '5 comidas';
    }

    const proteinG = Math.round((calories * proteinPct) / 4);
    const carbsG = Math.round((calories * carbPct) / 4);
    const fatsG = Math.round((calories * fatPct) / 9);

    let mealPlan;
    if (objetivo === 'perder_peso') {
        mealPlan =
            'DESAYUNO (7:00):\n' +
            '• 3 claras de huevo revueltas + 1 huevo entero\n' +
            '• 1 rebanada de pan integral\n' +
            '• 1 taza de fruta variada\n\n' +
            'COLACIÓN 1 (10:00):\n' +
            '• 1 manzana + 10 almendras\n' +
            '• 1 yogur griego natural\n\n' +
            'ALMUERZO (13:00):\n' +
            '• 150g pechuga de pollo a la plancha\n' +
            '• 1 taza de brócoli y zanahoria al vapor\n' +
            '• 1/2 taza de arroz integral\n\n' +
            'COLACIÓN 2 (16:00):\n' +
            '• 1 batido de proteína con agua\n' +
            '• 1 puñado de almendras\n\n' +
            'CENA (19:00):\n' +
            '• 150g de pescado blanco\n' +
            '• Ensalada verde con vinagreta ligera\n' +
            '• 1/2 aguacate\n\n' +
            '💧 AGUA: 3-4 litros durante el día';
    } else if (objetivo === 'volumen') {
        mealPlan =
            'DESAYUNO (7:00):\n' +
            '• 4 huevos revueltos + 2 claras adicionales\n' +
            '• 2 rebanadas de pan integral con mermelada\n' +
            '• 1 plátano + 1 taza de avena\n\n' +
            'COLACIÓN 1 (10:00):\n' +
            '• 200g de yogur griego + granola + miel\n' +
            '• 1 puñado de nueces\n\n' +
            'ALMUERZO (13:00):\n' +
            '• 200g de res o pollo\n' +
            '• 1 taza de arroz integral o camote\n' +
            '• Verduras salteadas\n\n' +
            'COLACIÓN 2 (16:00):\n' +
            '• Batido: 2 scoops proteína + 1 plátano + 2 cdas mantequilla maní + leche\n\n' +
            'CENA (19:30):\n' +
            '• 200g de salmón o atún\n' +
            '• 1 taza de quinoa\n' +
            '• Ensalada de espinacas con aderezo ligero\n\n' +
            'POST-CENA (22:00):\n' +
            '• 1 taza de requesón + miel + canela\n\n' +
            '💧 AGUA: 3-4 litros durante el día';
    } else {
        mealPlan =
            'DESAYUNO (7:00):\n' +
            '• 2 huevos revueltos + 2 claras\n' +
            '• 1 rebanada de pan integral\n' +
            '• 1 taza de fruta variada\n\n' +
            'COLACIÓN 1 (10:00):\n' +
            '• 1 yogur griego + 1 cucharada de semillas chía\n\n' +
            'ALMUERZO (13:00):\n' +
            '• 180g pechuga de pollo\n' +
            '• 3/4 taza de arroz integral\n' +
            '• Ensalada verde con aceite de oliva\n\n' +
            'COLACIÓN 2 (16:00):\n' +
            '• 1 manzana + 15 almendras\n' +
            '• 1 batido de proteína light\n\n' +
            'CENA (19:00):\n' +
            '• 150g de pescado o pollo\n' +
            '• Verduras al vapor\n' +
            '• 1/2 taza de quinoa o camote\n\n' +
            '💧 AGUA: 2.5-3 litros durante el día';
    }

    return {
        name: dietName,
        memberEmail: userEmail,
        memberName: loggedUser ? loggedUser.name : '',
        calories: calories,
        meals: meals,
        status: 'Activo',
        notes: '📊 MACROS DIARIOS:\n' +
            `• Calorías: ${calories} kcal\n` +
            `• Proteína: ${proteinG}g (${Math.round(proteinPct*100)}%)\n` +
            `• Carbohidratos: ${carbsG}g (${Math.round(carbPct*100)}%)\n` +
            `• Grasas: ${fatsG}g (${Math.round(fatPct*100)}%)\n\n` +
            '📋 PLAN DE COMIDAS:\n\n' +
            mealPlan,
        generated: true,
        createdAt: new Date().toISOString()
    };
}

function renderGeneratedPlan(container, member) {
    const workouts = getStore("gymWorkouts").filter(w => w.memberEmail === userEmail && w.generated);
    const diets = getStore("gymDiets").filter(d => d.memberEmail === userEmail && d.generated);
    const bmi = (member.peso / ((member.altura / 100) ** 2)).toFixed(1);
    let bmiLabel = bmi < 18.5 ? 'Bajo peso' : bmi < 25 ? 'Peso saludable' : bmi < 30 ? 'Sobrepeso' : 'Obesidad';

    let html = `
        <div class="plan-summary">
            <div class="plan-metrics">
                <div class="metric-chip"><i class="fa-solid fa-weight"></i> ${member.peso} kg</div>
                <div class="metric-chip"><i class="fa-solid fa-ruler-vertical"></i> ${member.altura} cm</div>
                <div class="metric-chip"><i class="fa-solid fa-chart-line"></i> IMC: ${bmi} (${bmiLabel})</div>
                <div class="metric-chip"><i class="fa-solid fa-signal"></i> ${member.nivel.charAt(0).toUpperCase() + member.nivel.slice(1)}</div>
                <div class="metric-chip"><i class="fa-solid fa-bullseye"></i> ${member.objetivo === 'volumen' ? 'Ganar Masa' : member.objetivo === 'perder_peso' ? 'Perder Peso' : 'Tonificar'}</div>
            </div>
        </div>`;

    /* Routine section */
    if (workouts.length > 0) {
        const w = workouts[workouts.length - 1];
        html += `
            <div class="plan-section">
                <h3><i class="fa-solid fa-dumbbell" style="color:#ff3131"></i> Rutina Generada</h3>
                <div class="routine-card generated">
                    <div class="routine-header">
                        <h3>${w.name}</h3>
                        <span class="status-badge active">Generado</span>
                    </div>
                    <div class="routine-details">
                        <p><i class="fa-solid fa-calendar"></i> ${w.days}</p>
                        <p><i class="fa-solid fa-clock"></i> ${w.duration}</p>
                        <pre class="workout-notes">${w.notes}</pre>
                    </div>
                </div>
            </div>`;
    }

    /* Diet section */
    if (diets.length > 0) {
        const d = diets[diets.length - 1];
        html += `
            <div class="plan-section">
                <h3><i class="fa-solid fa-apple-alt" style="color:#2ecc71"></i> Dieta Generada</h3>
                <div class="routine-card generated diet-card">
                    <div class="routine-header">
                        <h3>${d.name}</h3>
                        <span class="status-badge active">${d.status}</span>
                    </div>
                    <div class="routine-details">
                        <p><i class="fa-solid fa-fire"></i> <strong>${d.calories} kcal/día</strong></p>
                        <p><i class="fa-solid fa-utensils"></i> ${d.meals}</p>
                        <pre class="workout-notes">${d.notes}</pre>
                    </div>
                </div>
            </div>`;
    }

    container.innerHTML = html;
}

/* ===== LOGOUT ===== */
function logout() {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
}

/* ===== SEED DATA ===== */
(function seedMemberData() {
    if (localStorage.getItem('_memberSeeded')) return;

    /* Seed coaches */
    const coaches = [
        {
            name: 'Andrea Fit',
            role: 'Fitness Trainer',
            img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400',
            exp: '6 años',
            specialty: 'Fitness, Yoga, Pilates',
            cert: 'NASM Certified Personal Trainer',
            bio: 'Apasionada del bienestar integral, Andrea combina entrenamiento funcional con yoga y pilates para lograr cuerpos equilibrados y saludables.'
        },
        {
            name: 'Carlos Vega',
            role: 'Crossfit Coach',
            img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=400',
            exp: '8 años',
            specialty: 'Crossfit, HIIT, Calistenia',
            cert: 'CrossFit Level 3 Trainer',
            bio: 'Ex atleta profesional especializado en entrenamientos de alta intensidad y acondicionamiento físico.'
        },
        {
            name: 'Mike Power',
            role: 'Bodybuilding Coach',
            img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400',
            exp: '10 años',
            specialty: 'Bodybuilding, Powerlifting, Nutrición',
            cert: 'IFBB Pro League Coach',
            bio: 'Campeón nacional de bodybuilding con experiencia en transformaciones extremas y preparación para competencias.'
        }
    ];
    setStore("gymCoaches", coaches);

    /* Seed schedule */
    const schedule = [
        { day: 'Lunes', time: '6:00 - 7:00', class: 'Crossfit' },
        { day: 'Lunes', time: '8:00 - 9:00', class: 'Yoga' },
        { day: 'Lunes', time: '17:00 - 18:00', class: 'Spinning' },
        { day: 'Lunes', time: '18:00 - 19:00', class: 'Body Pump' },
        { day: 'Martes', time: '7:00 - 8:00', class: 'Pilates' },
        { day: 'Martes', time: '9:00 - 10:00', class: 'Crossfit' },
        { day: 'Martes', time: '17:00 - 18:00', class: 'HIIT' },
        { day: 'Martes', time: '19:00 - 20:00', class: 'Boxeo' },
        { day: 'Miércoles', time: '6:00 - 7:00', class: 'Crossfit' },
        { day: 'Miércoles', time: '8:00 - 9:00', class: 'Yoga' },
        { day: 'Miércoles', time: '17:00 - 18:00', class: 'Spinning' },
        { day: 'Miércoles', time: '18:00 - 19:00', class: 'Body Pump' },
        { day: 'Jueves', time: '7:00 - 8:00', class: 'Pilates' },
        { day: 'Jueves', time: '9:00 - 10:00', class: 'Crossfit' },
        { day: 'Jueves', time: '17:00 - 18:00', class: 'HIIT' },
        { day: 'Jueves', time: '19:00 - 20:00', class: 'Boxeo' },
        { day: 'Viernes', time: '6:00 - 7:00', class: 'Crossfit' },
        { day: 'Viernes', time: '8:00 - 9:00', class: 'Yoga' },
        { day: 'Viernes', time: '17:00 - 18:00', class: 'Spinning' },
        { day: 'Sábado', time: '8:00 - 9:00', class: 'Crossfit' },
        { day: 'Sábado', time: '9:00 - 10:00', class: 'Yoga' },
        { day: 'Sábado', time: '10:00 - 11:00', class: 'HIIT' }
    ];
    setStore("gymSchedule", schedule);

    localStorage.setItem('_memberSeeded', 'true');
})();

/* ===== INIT ===== */
showSection('inicio');
checkPaymentDueDate();
