const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'titanx.db');
const PORT = process.env.PORT || 3001;

let db;

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

async function start() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const file = fs.readFileSync(DB_PATH);
    db = new SQL.Database(file);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT DEFAULT '',
    membership TEXT DEFAULT 'Basic', status TEXT DEFAULT 'Activo',
    peso REAL, altura REAL, nivel TEXT, objetivo TEXT,
    nextPaymentDate TEXT, created TEXT DEFAULT (datetime('now')),
    updated TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    memberEmail TEXT NOT NULL, memberName TEXT DEFAULT '',
    days TEXT DEFAULT '', duration TEXT DEFAULT '', notes TEXT DEFAULT '',
    generated INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS diets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    memberEmail TEXT NOT NULL, memberName TEXT DEFAULT '',
    calories INTEGER DEFAULT 0, meals TEXT DEFAULT '',
    status TEXT DEFAULT 'Activo', notes TEXT DEFAULT '',
    generated INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberEmail TEXT NOT NULL, memberName TEXT DEFAULT '',
    date TEXT NOT NULL, checkinTime TEXT, checkoutTime TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberEmail TEXT NOT NULL, memberName TEXT DEFAULT '',
    plan TEXT DEFAULT '', amount REAL DEFAULT 0,
    date TEXT DEFAULT (date('now')), status TEXT DEFAULT 'Pagado',
    method TEXT DEFAULT 'Tarjeta', last4 TEXT DEFAULT ''
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL, price REAL DEFAULT 0,
    duration TEXT DEFAULT '30 días', benefits TEXT DEFAULT ''
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    role TEXT DEFAULT '', img TEXT DEFAULT '', exp TEXT DEFAULT '',
    specialty TEXT DEFAULT '', students TEXT DEFAULT '',
    cert TEXT DEFAULT '', bio TEXT DEFAULT ''
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL,
    time TEXT NOT NULL, class TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    phone TEXT DEFAULT '', created TEXT DEFAULT (datetime('now'))
  )`);

  /* Seed */
  const count = db.exec("SELECT COUNT(*) as c FROM memberships");
  if (!count.length || !count[0].values.length || count[0].values[0][0] === 0) {
    db.run("INSERT INTO memberships (name, price, duration, benefits) VALUES (?, ?, ?, ?)", ['Basic', 499, '30 días', 'Acceso general']);
    db.run("INSERT INTO memberships (name, price, duration, benefits) VALUES (?, ?, ?, ?)", ['Pro', 899, '30 días', 'Entrenador personal + clases grupales']);
    db.run("INSERT INTO memberships (name, price, duration, benefits) VALUES (?, ?, ?, ?)", ['Elite', 1499, '30 días', 'Acceso VIP total 24/7']);
    saveDb();
  }

  const coachCount = db.exec("SELECT COUNT(*) as c FROM coaches");
  if (!coachCount.length || !coachCount[0].values.length || coachCount[0].values[0][0] === 0) {
    const insert = db.prepare("INSERT INTO coaches (name, role, img, exp, specialty, students, cert, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    insert.run(['Andrea Fit', 'Fitness Trainer', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400', '6 años', 'Fitness, Yoga, Pilates', '500+', 'NASM Certified', 'Apasionada del bienestar integral.']);
    insert.run(['Carlos Vega', 'Crossfit Coach', 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=400', '8 años', 'Crossfit, HIIT, Calistenia', '320+', 'CrossFit Level 3', 'Ex atleta profesional.']);
    insert.run(['Mike Power', 'Bodybuilding Coach', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400', '10 años', 'Bodybuilding, Powerlifting, Nutrición', '280+', 'IFBB Pro League', 'Campeón nacional de bodybuilding.']);
    saveDb();
  }

  const schedCount = db.exec("SELECT COUNT(*) as c FROM schedule");
  if (!schedCount.length || !schedCount[0].values.length || schedCount[0].values[0][0] === 0) {
    const insert = db.prepare("INSERT INTO schedule (day, time, class) VALUES (?, ?, ?)");
    const classes = [
      ['Lunes', '6:00 - 7:00', 'Crossfit'], ['Lunes', '8:00 - 9:00', 'Yoga'], ['Lunes', '17:00 - 18:00', 'Spinning'], ['Lunes', '18:00 - 19:00', 'Body Pump'],
      ['Martes', '7:00 - 8:00', 'Pilates'], ['Martes', '9:00 - 10:00', 'Crossfit'], ['Martes', '17:00 - 18:00', 'HIIT'], ['Martes', '19:00 - 20:00', 'Boxeo'],
      ['Miércoles', '6:00 - 7:00', 'Crossfit'], ['Miércoles', '8:00 - 9:00', 'Yoga'], ['Miércoles', '17:00 - 18:00', 'Spinning'], ['Miércoles', '18:00 - 19:00', 'Body Pump'],
      ['Jueves', '7:00 - 8:00', 'Pilates'], ['Jueves', '9:00 - 10:00', 'Crossfit'], ['Jueves', '17:00 - 18:00', 'HIIT'], ['Jueves', '19:00 - 20:00', 'Boxeo'],
      ['Viernes', '6:00 - 7:00', 'Crossfit'], ['Viernes', '8:00 - 9:00', 'Yoga'], ['Viernes', '17:00 - 18:00', 'Spinning'],
      ['Sábado', '8:00 - 9:00', 'Crossfit'], ['Sábado', '9:00 - 10:00', 'Yoga'], ['Sábado', '10:00 - 11:00', 'HIIT']
    ];
    classes.forEach(c => insert.run(c));
    saveDb();
  }

  /* Express setup */
  const app = express();
  app.use(cors());
  app.use(express.json());

  /* Helper */
  function query(sql, params = []) {
    const stmt = db.prepare(sql);
    const result = stmt.getAsObject(params);
    stmt.free();
    return result;
  }

  function all(sql, params = []) {
    const stmt = db.prepare(sql);
    const rows = stmt.getAsObject(params);
    const results = [];
    // sql.js's getAsObject only returns one row, need to iterate
    let row;
    while ((row = stmt.getAsObject(params)) !== undefined) {
      if (Object.keys(row).length) results.push(row);
    }
    stmt.free();
    return results;
  }

  function run(sql, params = []) {
    db.run(sql, params);
    saveDb();
  }

  /* ===== AUTH ===== */
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'cesarfrapu@gmail.com' && password === '123456') {
      return res.json({ success: true, user: { name: 'Admin TitanX', email, role: 'admin' } });
    }
    const stmt = db.prepare("SELECT * FROM auth_users WHERE email = ? AND password = ?");
    const user = stmt.getAsObject([email, password]);
    stmt.free();
    if (!user || !user.email) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    res.json({ success: true, user: { name: user.name, email: user.email, role: 'member' } });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    if (email === 'cesarfrapu@gmail.com') return res.status(400).json({ success: false, message: 'Email de administrador' });
    try {
      run("INSERT INTO auth_users (name, email, password, phone) VALUES (?, ?, ?, ?)", [name, email, password, phone || '']);
      const stmt = db.prepare("SELECT id FROM members WHERE email = ?");
      const m = stmt.getAsObject([email]);
      stmt.free();
      if (!m || !m.id) run("INSERT INTO members (name, email, phone) VALUES (?, ?, ?)", [name, email, phone || '']);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ success: false, message: 'El correo ya existe' });
    }
  });

  /* ===== MEMBERS ===== */
  app.get('/api/members', (req, res) => {
    const results = [];
    const stmt = db.prepare("SELECT * FROM members ORDER BY name");
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.get('/api/members/:email', (req, res) => {
    const stmt = db.prepare("SELECT * FROM members WHERE email = ?");
    const m = stmt.getAsObject([req.params.email]);
    stmt.free();
    if (!m || !m.email) return res.status(404).json({ error: 'No encontrado' });
    res.json(m);
  });

  app.post('/api/members', (req, res) => {
    const { name, email, phone, membership, status } = req.body;
    try {
      run("INSERT INTO members (name, email, phone, membership, status) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone || '', membership || 'Basic', status || 'Activo']);
      res.json({ success: true });
    } catch { res.status(400).json({ error: 'El email ya existe' }); }
  });

  app.put('/api/members/:email', (req, res) => {
    const { name, phone, membership, status, peso, altura, nivel, objetivo, nextPaymentDate } = req.body;
    const sets = []; const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
    if (membership !== undefined) { sets.push('membership = ?'); params.push(membership); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status); }
    if (peso !== undefined) { sets.push('peso = ?'); params.push(peso); }
    if (altura !== undefined) { sets.push('altura = ?'); params.push(altura); }
    if (nivel !== undefined) { sets.push('nivel = ?'); params.push(nivel); }
    if (objetivo !== undefined) { sets.push('objetivo = ?'); params.push(objetivo); }
    if (nextPaymentDate !== undefined) { sets.push('nextPaymentDate = ?'); params.push(nextPaymentDate); }
    sets.push("updated = datetime('now')");
    params.push(req.params.email);
    run(`UPDATE members SET ${sets.join(', ')} WHERE email = ?`, params);
    res.json({ success: true });
  });

  app.delete('/api/members/:email', (req, res) => {
    run("DELETE FROM members WHERE email = ?", [req.params.email]);
    res.json({ success: true });
  });

  /* ===== WORKOUTS ===== */
  app.get('/api/workouts', (req, res) => {
    const { email } = req.query;
    const sql = email ? "SELECT * FROM workouts WHERE memberEmail = ? ORDER BY createdAt DESC" : "SELECT * FROM workouts ORDER BY createdAt DESC";
    const params = email ? [email] : [];
    const results = [];
    const stmt = db.prepare(sql);
    if (email) stmt.bind(params);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.post('/api/workouts', (req, res) => {
    const { name, memberEmail, memberName, days, duration, notes, generated } = req.body;
    run("INSERT INTO workouts (name, memberEmail, memberName, days, duration, notes, generated) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, memberEmail, memberName || '', days || '', duration || '', notes || '', generated ? 1 : 0]);
    res.json({ success: true });
  });

  app.delete('/api/workouts/:id', (req, res) => {
    run("DELETE FROM workouts WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  /* ===== DIETS ===== */
  app.get('/api/diets', (req, res) => {
    const { email } = req.query;
    const sql = email ? "SELECT * FROM diets WHERE memberEmail = ? ORDER BY createdAt DESC" : "SELECT * FROM diets ORDER BY createdAt DESC";
    const params = email ? [email] : [];
    const results = [];
    const stmt = db.prepare(sql);
    if (email) stmt.bind(params);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.post('/api/diets', (req, res) => {
    const { name, memberEmail, memberName, calories, meals, status, notes, generated } = req.body;
    run("INSERT INTO diets (name, memberEmail, memberName, calories, meals, status, notes, generated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, memberEmail, memberName || '', calories || 0, meals || '', status || 'Activo', notes || '', generated ? 1 : 0]);
    res.json({ success: true });
  });

  /* ===== CHECKINS ===== */
  app.get('/api/checkins', (req, res) => {
    const { email, date } = req.query;
    let sql = "SELECT * FROM checkins WHERE 1=1";
    const params = [];
    if (email) { sql += " AND memberEmail = ?"; params.push(email); }
    if (date) { sql += " AND date = ?"; params.push(date); }
    sql += " ORDER BY id DESC";
    const results = [];
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.post('/api/checkins', (req, res) => {
    const { memberEmail, memberName, date, checkinTime, checkoutTime } = req.body;
    run("INSERT INTO checkins (memberEmail, memberName, date, checkinTime, checkoutTime) VALUES (?, ?, ?, ?, ?)",
      [memberEmail, memberName || '', date, checkinTime, checkoutTime || null]);
    res.json({ success: true });
  });

  app.put('/api/checkins/:id', (req, res) => {
    const { checkoutTime } = req.body;
    run("UPDATE checkins SET checkoutTime = ? WHERE id = ?", [checkoutTime, req.params.id]);
    res.json({ success: true });
  });

  /* ===== PAYMENTS ===== */
  app.get('/api/payments', (req, res) => {
    const { email } = req.query;
    const sql = email ? "SELECT * FROM payments WHERE memberEmail = ? ORDER BY date DESC" : "SELECT * FROM payments ORDER BY date DESC";
    const params = email ? [email] : [];
    const results = [];
    const stmt = db.prepare(sql);
    if (email) stmt.bind(params);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.post('/api/payments', (req, res) => {
    const { memberEmail, memberName, plan, amount, date, status, method, last4 } = req.body;
    run("INSERT INTO payments (memberEmail, memberName, plan, amount, date, status, method, last4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [memberEmail, memberName || '', plan || '', amount || 0, date || new Date().toISOString().split('T')[0], status || 'Pagado', method || 'Tarjeta', last4 || '']);
    res.json({ success: true });
  });

  /* ===== MEMBERSHIPS ===== */
  app.get('/api/memberships', (req, res) => {
    const results = [];
    const stmt = db.prepare("SELECT * FROM memberships");
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  app.post('/api/memberships', (req, res) => {
    const { name, price, duration, benefits } = req.body;
    run("INSERT INTO memberships (name, price, duration, benefits) VALUES (?, ?, ?, ?)", [name, price, duration || '', benefits || '']);
    res.json({ success: true });
  });

  app.put('/api/memberships/:id', (req, res) => {
    const { name, price, duration, benefits } = req.body;
    run("UPDATE memberships SET name = ?, price = ?, duration = ?, benefits = ? WHERE id = ?", [name, price, duration, benefits, req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/memberships/:id', (req, res) => {
    run("DELETE FROM memberships WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  /* ===== COACHES ===== */
  app.get('/api/coaches', (req, res) => {
    const results = [];
    const stmt = db.prepare("SELECT * FROM coaches");
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  /* ===== SCHEDULE ===== */
  app.get('/api/schedule', (req, res) => {
    const results = [];
    const stmt = db.prepare("SELECT * FROM schedule ORDER BY CASE day WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3 WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sábado' THEN 6 WHEN 'Domingo' THEN 7 END, time");
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    res.json(results);
  });

  /* Serve static */
  app.use(express.static(__dirname));

  app.listen(PORT, () => {
    console.log(`✅ TitanX API corriendo en http://localhost:${PORT}`);
    console.log(`📁 Base de datos: ${DB_PATH}`);
  });
}

start().catch(console.error);
