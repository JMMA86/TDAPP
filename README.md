# TDApp — Agenda inteligente para TDAH

TDApp es una aplicación web que ayuda a personas con TDAH y ansiedad a gestionar
tareas mediante una agenda visual, registro de estado anímico y división de tareas
con inteligencia artificial (Ollama).

## Stack

- **Next.js 16** (App Router, React 19, React Compiler)
- **Tailwind CSS v4**
- **Prisma v7** + PostgreSQL (Clean Architecture)
- **Ollama** (modelos locales) con `ai-sdk-ollama`

## Requisitos

| Herramienta | Mínimo | Verificar |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Docker | 24+ | `docker --version` |
| Ollama | ≥0.3.0 | `ollama --version` |

## Primer arranque (paso a paso)

### 1. Clonar y dependencias

```bash
git clone <repo-url> tdapp
cd tdapp
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

`.env.local` ya contiene los defaults correctos. Ajústalos si tu configuración
de PostgreSQL u Ollama difiere:

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://tdapp_user:tdapp_dev_pass@localhost:5432/tdapp_dev` | Conexión PostgreSQL |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL del servidor Ollama |
| `OLLAMA_MODEL` | `llama3.1:8b` | Modelo a usar |

> Nota: `.env` (sin `.local`) lo usa Prisma CLI. Ya existe con el mismo
> `DATABASE_URL` para que los comandos `prisma` funcionen.

### 3. Levantar la base de datos

```bash
docker compose up -d
```

Esto crea un contenedor PostgreSQL 17 con:
- Usuario: `tdapp_user`
- Password: `tdapp_dev_pass`
- Base de datos: `tdapp_dev`
- Puerto: `5432`

### 4. Aplicar migraciones y seed

```bash
npm run db:reset
```

Este comando ejecuta `prisma migrate reset --force` que:
1. Borra y recrea la base de datos
2. Aplica todas las migraciones
3. Corre el seed (usuario demo + tareas de ejemplo)

### 5. Modelo de IA (opcional, solo para dividir tareas)

La app funciona sin IA. Para usar "Dividir con IA":

```bash
ollama pull llama3.1:8b
ollama serve
```

Asegúrate de que `OLLAMA_BASE_URL` y `OLLAMA_MODEL` en `.env.local` coinciden
con tu configuración de Ollama.

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:reset` | Reinicia BD + migraciones + seed |
| `npm run db:seed` | Solo ejecuta el seed |

## Comandos Docker

| Comando | Descripción |
|---|---|
| `docker compose up -d` | Iniciar PostgreSQL |
| `docker compose down` | Detener PostgreSQL |
| `docker compose down -v` | Detener y borrar el volumen (datos) |
| `docker compose logs db` | Ver logs de la base de datos |

## Estructura del proyecto

```
tdapp/
├── prisma/
│   ├── schema.prisma          # Modelos: User, Task, SubTask, MoodEntry
│   ├── seed.ts                # Datos de prueba
│   └── migrations/            # Historial de migraciones
├── src/
│   ├── app/                   # Rutas y páginas (Next.js App Router)
│   │   ├── page.tsx           # Página principal (agenda)
│   │   └── api/               # API routes REST
│   │       └── tasks/         # CRUD + split + subtasks
│   ├── components/            # Componentes React reutilizables
│   │   └── agenda/            # TaskCard, MoodTracker, AddTaskModal
│   ├── core/                  # Clean Architecture
│   │   └── application/
│   │       ├── ports/         # Interfaces (ITaskRepository, IAiService)
│   │       └── use-cases/     # Casos de uso (SplitTaskUseCase)
│   ├── infrastructure/        # Adaptadores
│   │   ├── database/prisma/   # PrismaTaskRepository + client singleton
│   │   └── ollama/            # OllamaAiService
│   └── generated/prisma/      # Cliente Prisma generado
├── .opencode/agents/          # Agentes de OpenCode
├── docker-compose.yml         # PostgreSQL para desarrollo
├── .env.example               # Plantilla de variables de entorno
├── prisma.config.ts           # Configuración de Prisma v7
├── next.config.ts             # Configuración de Next.js
└── eslint.config.mjs          # ESLint v9 flat config
```
