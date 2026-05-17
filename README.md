# Vending Services Web App (VLB App)

A comprehensive web application designed for the professional management of vending machine businesses. This application provides robust tools for sales tracking, inventory management, and business analytics.

## Functionalities

- **User Authentication:** Secure login system with role-based access control (Admin/Operator).
- **Dashboard:** High-level overview of business performance and key metrics.
- **Sales Tracking:** Record and monitor daily sales by location and machine.
- **Inventory Management:** Track product stock levels and manage supplies.
- **Complaints Management:** System for registering and tracking customer complaints.
- **Administration (Admin Only):**
  - **Manage Products:** Add, update, and categorize products.
  - **Manage Plazas:** Configure vending machine locations.
  - **Manage Machines:** Oversee vending machine units.
  - **Manage Supplies:** Track operational supplies.
- **Reports (Admin Only):** Detailed financial and sales analytics to drive business decisions.

## Tech Stack & Methodology

This project is built using modern web development technologies and methodologies:

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Styling:** Custom CSS Variables (Slate & Gold Theme) for a premium, responsive design.
- **Icons:** [Lucide React](https://lucide.dev/)
- **Architecture:** Component-based architecture focused on modularity and reusability.

### Backend
- **Framework:** [Django 6.0.5](https://www.djangoproject.com/)
- **REST API:** [Django REST Framework 3.17.1](https://www.django-rest-framework.org/)
- **CORS:** [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- **Database:** SQLite (development) / PostgreSQL (production-ready)
- **Environment Management:** [django-environ](https://github.com/joke2k/django-environ)
- **Image Processing:** [Pillow 12.2.0](https://python-pillow.org/)

## Installation & Setup Guide

### Prerequisites
- **Python:** 3.12 or higher
- **Node.js:** 18.x or higher (for Frontend)
- **npm or yarn:** Package manager for Node.js
- **Git:** Version control

### Backend Setup (Django)

#### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd Vending-Services-web-app/backend
```

#### 2. **Create and Activate Virtual Environment**
```bash
# On Linux/macOS
python3 -m venv env
source env/bin/activate

# On Windows
python -m venv env
env\Scripts\activate
```

#### 3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

#### 4. **Configure Environment Variables**
Create a `.env` file in the `backend/` directory with the following variables:
```bash
# Debug mode (set to False in production)
DEBUG=True

# Secret key (change this in production!)
SECRET_KEY=your-secret-key-here

# Allowed hosts (comma-separated for production servers)
ALLOWED_HOSTS=localhost,127.0.0.1

# Optional: PostgreSQL database configuration for production
# DATABASE_URL=postgres://user:password@localhost:5432/vending_db
```

**⚠️ Important:** Never commit the `.env` file. Add it to `.gitignore`.

#### 5. **Run Database Migrations**
```bash
python manage.py migrate
```

This creates the SQLite database and applies all migrations.

#### 6. **Create Superuser (Admin Account)**
```bash
python manage.py createsuperuser
```

You will be prompted to enter:
- **Username:** (e.g., `admin`)
- **Email:** (e.g., `admin@example.com`)
- **Password:** (enter and confirm)

#### 7. **Start Development Server**
```bash
python manage.py runserver
```

The backend API will be available at: `http://localhost:8000`

**API Documentation & Admin Panel:**
- Django Admin: `http://localhost:8000/admin/`
- API Locations Endpoint: `http://localhost:8000/api/locations/`

---

### Frontend Setup (React + Vite)

#### 1. **Navigate to Frontend Directory**
```bash
cd ../frontend
```

#### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

#### 3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at: `http://localhost:5173`

#### 4. **Build for Production**
```bash
npm run build
# or
yarn build
```

---

### Running Both Services Simultaneously

**Option 1: In Separate Terminals**
```bash
# Terminal 1 - Backend
cd backend
source env/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Using a Process Manager**

Install `concurrently` in the frontend directory:
```bash
npm install --save-dev concurrently
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd ../backend && source env/bin/activate && python manage.py runserver",
    "dev:frontend": "vite"
  }
}
```

---

### Environment Configuration for CORS

The backend is already configured with CORS headers enabled for frontend communication. If you need to modify CORS settings, edit `backend/core/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend development server
    "http://localhost:3000",  # Alternative frontend port
]
```

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'django'` | Ensure virtual environment is activated and dependencies are installed with `pip install -r requirements.txt` |
| `CORS error when calling API from frontend` | Verify `CORS_ALLOWED_ORIGINS` in `backend/core/settings.py` includes your frontend URL |
| `Bad Request (400) when posting data` | Ensure POST request body matches the expected JSON structure (see serializers) |
| `Database locked` | Close other processes using SQLite; consider switching to PostgreSQL for production |



This application was created with **"vibe coding"** methodology, leveraging the power of advanced AI tools to accelerate development and ensure high-quality code.

**Tools used:**

- **Google Antigravity:** For advanced agentic coding workflows.
- **Agent Manager:** For orchestrating complex tasks.
- **Gemini 3.0:** Providing state-of-the-art language understanding and code generation.
- And other AI-assisted development tools.

---

# Aplicación Web de Servicios de Vending (VLB App)

Una aplicación web completa diseñada para la gestión profesional de negocios de máquinas expendedoras. Esta aplicación proporciona herramientas robustas para el seguimiento de ventas, gestión de inventario y análisis de negocios.

## Funcionalidades

- **Autenticación de Usuarios:** Sistema de inicio de sesión seguro con control de acceso basado en roles (Administrador/Operador).
- **Panel de Control (Dashboard):** Visión general del rendimiento del negocio y métricas clave.
- **Seguimiento de Ventas:** Registro y monitoreo de ventas diarias por ubicación y máquina.
- **Gestión de Inventario:** Control de niveles de stock de productos y gestión de suministros.
- **Gestión de Quejas:** Sistema para registrar y dar seguimiento a las quejas de los clientes.
- **Administración (Solo Administrador):**
  - **Gestión de Productos:** Agregar, actualizar y categorizar productos.
  - **Gestión de Plazas:** Configurar ubicaciones de las máquinas expendedoras.
  - **Gestión de Máquinas:** Supervisar unidades de máquinas expendedoras.
  - **Gestión de Suministros:** Rastreo de suministros operativos.
- **Reportes (Solo Administrador):** Análisis detallados financieros y de ventas para la toma de decisiones.

## Tecnologías y Metodología

Este proyecto está construido utilizando tecnologías y metodologías modernas de desarrollo web:

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Herramienta de Construcción:** [Vite](https://vitejs.dev/)
- **Enrutamiento:** [React Router 7](https://reactrouter.com/)
- **Estilos:** Variables CSS personalizadas (Tema Pizarra y Oro) para un diseño premium y responsivo.
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Arquitectura:** Arquitectura basada en componentes enfocada en la modularidad y reutilización.

### Backend
- **Framework:** [Django 6.0.5](https://www.djangoproject.com/)
- **API REST:** [Django REST Framework 3.17.1](https://www.django-rest-framework.org/)
- **CORS:** [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- **Base de Datos:** SQLite (desarrollo) / PostgreSQL (listo para producción)
- **Gestión de Entorno:** [django-environ](https://github.com/joke2k/django-environ)
- **Procesamiento de Imágenes:** [Pillow 12.2.0](https://python-pillow.org/)

## Desarrollo con IA

Esta aplicación fue creada con la metodología **"vibe coding"**, aprovechando el poder de herramientas avanzadas de IA para acelerar el desarrollo y asegurar código de alta calidad.

**Herramientas utilizadas:**

- **Google Antigravity:** Para flujos de trabajo de codificación agéntica avanzados.
- **Agent Manager:** Para la orquestación de tareas complejas.
- **Gemini 3.0:** Proporcionando comprensión de lenguaje y generación de código de última generación.
- **Herramientas utilizadas:**

- **Google Antigravity:** Para flujos de trabajo de codificación agéntica avanzados.
- **Agent Manager:** Para la orquestación de tareas complejas.
- **Gemini 3.0:** Proporcionando comprensión de lenguaje y generación de código de última generación.
- Y otras herramientas de desarrollo asistidas por IA.

---

## Guía de Instalación y Configuración

### Requisitos Previos
- **Python:** 3.12 o superior
- **Node.js:** 18.x o superior (para Frontend)
- **npm o yarn:** Gestor de paquetes para Node.js
- **Git:** Control de versiones

### Configuración del Backend (Django)

#### 1. **Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd Vending-Services-web-app/backend
```

#### 2. **Crear y Activar el Entorno Virtual**
```bash
# En Linux/macOS
python3 -m venv env
source env/bin/activate

# En Windows
python -m venv env
env\Scripts\activate
```

#### 3. **Instalar Dependencias**
```bash
pip install -r requirements.txt
```

#### 4. **Configurar Variables de Entorno**
Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:
```bash
# Modo debug (cambiar a False en producción)
DEBUG=True

# Clave secreta (¡cambiar en producción!)
SECRET_KEY=tu-clave-secreta-aqui

# Hosts permitidos (separados por comas para servidores de producción)
ALLOWED_HOSTS=localhost,127.0.0.1

# Opcional: Configuración de base de datos PostgreSQL para producción
# DATABASE_URL=postgres://usuario:contraseña@localhost:5432/bd_vending
```

**⚠️ Importante:** Nunca hagas commit del archivo `.env`. Agrégalo a `.gitignore`.

#### 5. **Ejecutar Migraciones de Base de Datos**
```bash
python manage.py migrate
```

Esto crea la base de datos SQLite y aplica todas las migraciones.

#### 6. **Crear Usuario Administrador (Superusuario)**
```bash
python manage.py createsuperuser
```

Se te pedirá que ingreses:
- **Usuario:** (ej: `admin`)
- **Correo:** (ej: `admin@example.com`)
- **Contraseña:** (ingresa y confirma)

#### 7. **Iniciar el Servidor de Desarrollo**
```bash
python manage.py runserver
```

La API del backend estará disponible en: `http://localhost:8000`

**Documentación API y Panel de Administración:**
- Panel Admin de Django: `http://localhost:8000/admin/`
- Endpoint de Ubicaciones API: `http://localhost:8000/api/locations/`

---

### Configuración del Frontend (React + Vite)

#### 1. **Navegar al Directorio Frontend**
```bash
cd ../frontend
```

#### 2. **Instalar Dependencias**
```bash
npm install
# o
yarn install
```

#### 3. **Iniciar Servidor de Desarrollo**
```bash
npm run dev
# o
yarn dev
```

El frontend estará disponible en: `http://localhost:5173`

#### 4. **Compilar para Producción**
```bash
npm run build
# o
yarn build
```

---

### Ejecutar Ambos Servicios Simultáneamente

**Opción 1: En Terminales Separadas**
```bash
# Terminal 1 - Backend
cd backend
source env/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Opción 2: Usando un Gestor de Procesos**

Instala `concurrently` en el directorio frontend:
```bash
npm install --save-dev concurrently
```

Actualiza los scripts en `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd ../backend && source env/bin/activate && python manage.py runserver",
    "dev:frontend": "vite"
  }
}
```

---

### Configuración de CORS para Comunicación Frontend-Backend

El backend ya está configurado con headers CORS habilitados para la comunicación con el frontend. Si necesitas modificar la configuración de CORS, edita `backend/core/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Servidor de desarrollo frontend
    "http://localhost:3000",  # Puerto alternativo frontend
]
```

---

### Solución de Problemas

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: No module named 'django'` | Asegúrate de activar el entorno virtual e instalar dependencias con `pip install -r requirements.txt` |
| `Error CORS al llamar la API desde el frontend` | Verifica que `CORS_ALLOWED_ORIGINS` en `backend/core/settings.py` incluya la URL de tu frontend |
| `Bad Request (400) al enviar datos` | Asegúrate de que el cuerpo de la solicitud POST coincida con la estructura JSON esperada (ver serializers) |
| `Base de datos bloqueada` | Cierra otros procesos que usen SQLite; considera cambiar a PostgreSQL para producción |


