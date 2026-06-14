const ADMIN_EMAIL = 'cesarfrapu@gmail.com';
const ADMIN_PASS = '123456';

function showMessage(elId, text, isError = true) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-message ' + (isError ? 'error' : 'success');
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fa-regular fa-eye-slash toggle-pwd' : 'fa-regular fa-eye toggle-pwd';
}

/* REGISTER */
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirm").value;
        const phone = document.getElementById("registerPhone").value.trim();

        if (password.length < 6) {
            showMessage("registerMessage", "La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (password !== confirm) {
            showMessage("registerMessage", "Las contraseñas no coinciden");
            return;
        }
        if (email === ADMIN_EMAIL) {
            showMessage("registerMessage", "Este correo es de administrador y ya está registrado");
            return;
        }

        let users = JSON.parse(localStorage.getItem("authUsers")) || [];
        if (users.find(u => u.email === email)) {
            showMessage("registerMessage", "El correo ya está registrado");
            return;
        }

        users.push({ name, email, password, phone, created: new Date().toISOString() });
        localStorage.setItem("authUsers", JSON.stringify(users));

        let members = JSON.parse(localStorage.getItem("gymMembers")) || [];
        if (!members.find(m => m.email === email)) {
            members.push({ name, email, phone, membership: 'Basic', status: 'Activo', created: new Date().toISOString() });
            localStorage.setItem("gymMembers", JSON.stringify(members));
        }

        /* Sync with API if available */
        fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone })
        }).catch(() => {});

        showMessage("registerMessage", "Cuenta creada correctamente", false);
        setTimeout(() => { window.location.href = "login.html"; }, 1200);
    });
}

/* LOGIN */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        let validUser = null;

        if (email === ADMIN_EMAIL) {
            if (password === ADMIN_PASS) {
                validUser = { name: 'Admin TitanX', email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin' };
            }
        } else {
            const users = JSON.parse(localStorage.getItem("authUsers")) || [];
            validUser = users.find(u => u.email === email && u.password === password);
        }

        if (!validUser) {
            showMessage("loginMessage", "Correo o contraseña incorrectos");
            return;
        }

        localStorage.setItem("loggedUser", JSON.stringify(validUser));

        const isAdmin = email === ADMIN_EMAIL;
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

        showMessage("loginMessage", "Iniciando sesión...", false);

        const redirect = isAdmin ? "dashboard.html" : "member.html";
        setTimeout(() => { window.location.href = redirect; }, 800);
    });
}

/* PROTECT DASHBOARD & MEMBER */
function protectPage() {
    const loggedUser = localStorage.getItem("loggedUser");
    if (!loggedUser) {
        window.location.href = "login.html";
        return null;
    }
    return JSON.parse(loggedUser);
}

if (window.location.pathname.includes("dashboard.html")) {
    const user = protectPage();
    if (user && user.email !== ADMIN_EMAIL) {
        window.location.href = "login.html";
    }
}

if (window.location.pathname.includes("member.html")) {
    const user = protectPage();
    if (user && user.email === ADMIN_EMAIL) {
        window.location.href = "dashboard.html";
    }
}
