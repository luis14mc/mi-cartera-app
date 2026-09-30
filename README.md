# Mi Cartera App 💰📊

Aplicación de gestión de finanzas personales, presupuestos mensuales por categoría y recordatorios de pagos programados, construida con **Astro 5 (SSR)**, **Tailwind CSS**, **DaisyUI**, **Drizzle ORM** y **Neon PostgreSQL**, optimizada como **PWA** instalable en dispositivos móviles.

---

## 🚀 Stack Tecnológico

- **Framework**: [Astro 5](https://astro.build/) en modo SSR (`output: 'server'`).
- **Adaptador de Despliegue**: `@astrojs/vercel` (Serverless Functions).
- **Estilos y Componentes UI**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) (mobile-first, temas responsivos).
- **Base de Datos Serverless**: [Neon](https://neon.tech/) PostgreSQL.
- **ORM & Migraciones**: [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit` usando `@neondatabase/serverless`.
- **PWA (Progressive Web App)**: `@vite-pwa/astro` con service worker, manifest y soporte offline básico.
- **Cron Jobs**: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) configurados en `vercel.json`.

---

## 🗄️ Esquema de la Base de Datos (`src/db/schema.ts`)

1. **`categories`**:
   - `id`: Identificador único (serial, PK).
   - `name`: Nombre de la categoría (text).
   - `monthly_limit`: Límite mensual asignado (numeric 12,2).

2. **`transactions`**:
   - `id`: Identificador único (serial, PK).
   - `amount`: Monto del gasto (numeric 12,2).
   - `category_id`: Clave foránea referenciando `categories.id`.
   - `description`: Concepto o detalle de la compra (text).
   - `date`: Fecha de la transacción (timestamp con zona horaria).

3. **`scheduled_payments`**:
   - `id`: Identificador único (serial, PK).
   - `title`: Concepto del pago (text).
   - `amount`: Monto a pagar (numeric 12,2).
   - `due_date`: Fecha de vencimiento (timestamp con zona horaria).
   - `is_paid`: Estado de pago (boolean, por defecto `false`).

---

## ⚙️ Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Configura tus variables:

```env
# Connection String de Neon PostgreSQL (obtenida desde https://console.neon.tech)
DATABASE_URL="postgresql://neondb_owner:tu_password@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# (Opcional) Token para proteger el endpoint del Cron Job de Vercel
CRON_SECRET="tu_clave_secreta"
```

> [!TIP]
> En la consola de Neon, ve a **Dashboard** -> **Connection Details** -> copia la cadena de conexión en modo **Pooled** o **Direct** con `sslmode=require`.

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:4321`. |
| `npm run build` | Compila el proyecto con Astro y el adaptador de Vercel. |
| `npm run db:push` | Sincroniza el esquema de Drizzle directamente con tu base de datos Neon. |
| `npm run db:generate` | Genera archivos de migración SQL en `./drizzle`. |
| `npm run db:studio` | Abre la interfaz web Drizzle Studio para inspeccionar los registros. |
| `npm run db:seed` | Puebla la base de datos con categorías y pagos programados de prueba. |

---

## 🔌 Endpoints y Lógica de Servidor

### 1. `POST /api/transactions`
Registra un nuevo gasto validando en tiempo real contra el límite de la categoría:
- **Cálculo previo**: Suma todas las transacciones existentes en el mes calendario actual para la categoría indicada.
- **Validación**: Si `(gasto_actual + nuevo_monto) > monthly_limit`, retorna un código **HTTP 400** con un mensaje de rechazo y el detalle del excedente.
- **Respuesta Exitosa**: Retorna **HTTP 201** con la transacción creada y el saldo restante del presupuesto mensual.

### 2. `GET /api/cron/reminders`
Preparado para Vercel Cron Jobs:
- Consulta la tabla `scheduled_payments` buscando pagos pendientes (`is_paid = false`).
- Filtra aquellos cuya fecha de vencimiento esté dentro de los **próximos 3 días** (incluyendo avisos especiales para fechas de corte como el día 20).
- Retorna las alertas en formato JSON listo para integración con notificaciones push o email.

---

## ☁️ Despliegue en Vercel

1. Sube tu repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new). Vercel detectará automáticamente Astro y el framework preset.
3. En la sección **Environment Variables**, añade `DATABASE_URL` con tu connection string de Neon.
4. Una vez desplegado, el archivo `vercel.json` ejecutará automáticamente el cron job:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reminders",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```
5. En la sección de **Settings > Cron Jobs** de tu dashboard de Vercel verás activo el cron job diario a las 8:00 AM UTC.
