

# TITANX FITNESS 

## Sistema Inteligente de Gestión para Gimnasios

TitanX Fitness es una plataforma web full-stack diseñada para la administración integral de gimnasios. El sistema permite gestionar miembros, pagos, membresías, entrenamientos, check-ins y dietas personalizadas desde una interfaz moderna y responsiva. Además, incorpora un panel exclusivo para clientes donde pueden consultar sus rutinas, planes alimenticios, historial de pagos y horarios de clases.

Desarrollado con tecnologías modernas como Node.js, Express, SQLite y Bootstrap, el proyecto está orientado a brindar una experiencia completa tanto para administradores como para usuarios del gimnasio. 

---

##  Características Principales

###  Sistema de Autenticación

* Inicio de sesión y registro de usuarios.
* Validación de formularios.
* Mostrar/Ocultar contraseña.
* Redirección automática según el rol del usuario.
* Acceso administrativo protegido.

###  Panel Administrativo

* Dashboard con estadísticas generales.
* Gestión completa de miembros (CRUD).
* Control de check-in y check-out.
* Administración de entrenamientos.
* Gestión de membresías.
* Historial de pagos.
* Seguimiento de actividad de usuarios.

###  Panel de Miembros

* Consulta de membresía activa.
* Generación automática de rutinas.
* Planes alimenticios personalizados.
* Visualización de entrenadores.
* Consulta de horarios de clases.
* Historial de pagos.
* Actualización de perfil personal.

###  Sistema de Pagos

* Simulación de pagos con tarjeta.
* Control de vencimientos.
* Alertas automáticas de pagos próximos.
* Actualización automática de fechas de renovación.

###  Landing Page Comercial

* Presentación del gimnasio.
* Planes de membresía.
* Galería de entrenadores.
* Tienda virtual de suplementos y accesorios.
* Información de contacto y redes sociales.

---

##  Tecnologías Utilizadas

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript (Vanilla JS)
* Font Awesome

### Backend

* Node.js
* Express.js

### Base de Datos

* SQLite
* SQL.js (WebAssembly)

### Almacenamiento Local

* LocalStorage (modo offline)

---

##  Estructura del Proyecto

```bash
titanx-fitness/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── member.html
├── plans.html
├── contact.html
│
├── server.js
├── package.json
├── titanx.db
│
├── css/
│   └── style.css
│
└── js/
    ├── auth.js
    ├── app.js
    ├── member.js
    └── db-sync.js
```

---

##  Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/titanx-fitness.git
```

### 2. Entrar al directorio

```bash
cd titanx-fitness
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el servidor

```bash
npm start
```

---

##  Acceso al Sistema

Una vez iniciado el servidor:

```bash
http://localhost:3001
```

---

##  Credenciales de Prueba

### Administrador

```text
Correo: cesarfrapu@gmail.com
Contraseña: 123456
```

### Miembro

```text
Registrar una nueva cuenta desde la pantalla de registro.
```

---

##  API REST

### Miembros

```http
GET     /api/members
POST    /api/members
PUT     /api/members/:id
DELETE  /api/members/:id
```

### Entrenamientos

```http
GET     /api/workouts
POST    /api/workouts
PUT     /api/workouts/:id
DELETE  /api/workouts/:id
```

### Dietas

```http
GET     /api/diets
POST    /api/diets
PUT     /api/diets/:id
DELETE  /api/diets/:id
```

### Check-ins

```http
GET     /api/checkins
POST    /api/checkins
```

### Pagos

```http
GET     /api/payments
POST    /api/payments
```

### Autenticación

```http
POST    /api/auth/register
POST    /api/auth/login
```

---

##  Funcionalidades Destacadas

✅ Gestión completa de usuarios

✅ Administración de membresías

✅ Control de acceso mediante check-in

✅ Rutinas personalizadas automáticas

✅ Dietas personalizadas

✅ Simulación de pagos

✅ Dashboard administrativo

✅ Sistema responsive

✅ Persistencia en SQLite

✅ Modo offline mediante LocalStorage

---

##  Objetivo del Proyecto

Este proyecto fue desarrollado como parte de mi portafolio profesional en el área de Desarrollo Web Full Stack y Gestión de Sistemas Informáticos, aplicando conocimientos de:

* Desarrollo Frontend
* Desarrollo Backend
* Bases de Datos
* Diseño Responsivo
* Arquitectura Cliente-Servidor
* APIs REST
* Gestión de Usuarios y Roles

---

##  Licencia

Este proyecto se distribuye bajo la licencia MIT.

---

##  Autor

**César Frapu**

Licenciado en Informática y Tecnologías Computacionales.

*"Transformando ideas en soluciones tecnológicas."* 🚀

