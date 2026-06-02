# TDApp — Agenda inteligente para TDAH

Aplicación web de productividad y bienestar emocional para jóvenes universitarios con TDAH, ansiedad o alta carga cognitiva. Combina gestión de tareas, registro de estado de ánimo, ejercicios de respiración y un asistente de IA empático que fracciona tareas abrumadoras en pasos accionables.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Estilos | Tailwind CSS v4 |
| ORM | Prisma v7 + PostgreSQL 17 |
| Auth | JWT httpOnly cookies (`jose` + `bcryptjs`) |
| IA local | Ollama con `ai-sdk-ollama` |
| IA nube | Groq con `@ai-sdk/groq` |
| Arquitectura | Clean Architecture (`/src/core` + `/src/infrastructure`) |

---

## Módulos de la aplicación

| Módulo | Ruta | Descripción |
|---|---|---|
| Inicio | `/` | Dashboard con resumen de tareas, estado de ánimo del día y tip diario |
| Agenda | `/agenda` | CRUD de tareas con subtareas, filtros y botón "Dividir con IA" |
| Bienestar | `/bienestar` | Selector de ánimo, temporizador de respiración 4-4-6 e historial semanal |
| Comunidad | `/comunidad` | Grupos de apoyo con join/leave interactivo |
| Perfil | `/perfil` | Datos reales del usuario, progreso, logros derivados y logout |
| Login | `/login` | Autenticación por email + contraseña |
| Registro | `/register` | Creación de cuenta con validaciones |

---

## Requisitos previos

| Herramienta | Mínimo | Verificar |
|---|---|---|
| Node.js | 20 + | `node -v` |
| npm | 10 + | `npm -v` |
| Docker | 24 + | `docker --version` |
| Ollama *(opcional)* | ≥ 0.3.0 | `ollama --version` |

---

## Primer arranque

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url> tdapp
cd tdapp
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores. Las variables más importantes:

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://tdapp_user:tdapp_dev_pass@localhost:5432/tdapp_dev` | Conexión PostgreSQL |
| `JWT_SECRET` | *(requerida en producción)* | Secreto para firmar tokens JWT |
| `AI_PROVIDER` | `ollama` | Proveedor de IA: `ollama` o `groq` |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL del servidor Ollama local |
| `OLLAMA_MODEL` | `llama3.1:8b` | Modelo Ollama a usar |
| `GROQ_API_KEY` | — | API key de Groq *(solo si `AI_PROVIDER=groq`)* |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Modelo Groq a usar |

> **Nota:** `.env` (sin `.local`) solo lo usa Prisma CLI e incluye únicamente `DATABASE_URL`. No lo modifiques.

### 3. Base de datos

```bash
docker compose up -d          # Levanta PostgreSQL 17
npm run db:reset               # Migraciones + seed
```

El seed crea un usuario demo (`demo@tdapp.com` / `demo1234`) con tareas de ejemplo.

### 4. Servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Proveedor de IA

La aplicación soporta dos proveedores intercambiables con la variable `AI_PROVIDER`.

### Ollama (local, por defecto)

No requiere conexión a internet ni API key. Necesita Ollama instalado y corriendo.

```bash
ollama pull llama3.1:8b
ollama serve
```

En `.env.local`:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

### Groq (nube, sin GPU local)

Más rápido que Ollama en hardware de gama media. Requiere API key gratuita.

1. Crea una cuenta en [console.groq.com](https://console.groq.com) y genera una API key.
2. En `.env.local`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-8b-instant
```

**Modelos Groq recomendados:**

| Modelo | Velocidad | Calidad | Uso recomendado |
|---|---|---|---|
| `llama-3.1-8b-instant` | ⚡ Muy rápido | Buena | Desarrollo y uso general |
| `llama-3.3-70b-versatile` | Moderada | Excelente | Producción |
| `mixtral-8x7b-32768` | Rápida | Buena | Alternativa |

> La IA es **opcional**. Sin ella, la app funciona completamente; solo el botón "Dividir con IA" no estará disponible.

---

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
| `docker compose down -v` | Detener y borrar volumen (datos) |
| `docker compose logs db` | Ver logs de la base de datos |

---

## Estructura del proyecto

```
tdapp/
├── prisma/
│   ├── schema.prisma              # Modelos: User, Task, SubTask, MoodEntry
│   ├── seed.ts                    # Datos de prueba
│   └── migrations/
├── src/
│   ├── app/                       # Rutas y páginas (Next.js App Router)
│   │   ├── page.tsx               # Dashboard (Inicio)
│   │   ├── agenda/page.tsx        # Gestión de tareas
│   │   ├── bienestar/page.tsx     # Bienestar y respiración
│   │   ├── comunidad/page.tsx     # Grupos de apoyo
│   │   ├── perfil/page.tsx        # Perfil de usuario
│   │   ├── login/page.tsx         # Autenticación
│   │   ├── register/page.tsx      # Registro
│   │   └── api/
│   │       ├── auth/              # login · logout · register · me
│   │       ├── tasks/             # CRUD + split + subtasks
│   │       ├── mood/              # GET + POST estado de ánimo
│   │       └── chat/              # Streaming de chat IA (Ollama o Groq)
│   ├── components/
│   │   ├── agenda/                # TaskCard, MoodTracker, AddTaskModal
│   │   ├── bienestar/             # BreathingTimer
│   │   ├── navigation/            # NavigationBar, AppShell
│   │   └── theme-toggle.tsx       # Toggle claro/oscuro
│   ├── core/                      # Clean Architecture — sin dependencias externas
│   │   └── application/
│   │       ├── ports/             # IAiService, ITaskRepository
│   │       └── use-cases/         # SplitTaskUseCase
│   ├── infrastructure/            # Adaptadores concretos
│   │   ├── ai/
│   │   │   ├── prompts.ts         # Prompts compartidos entre proveedores
│   │   │   └── ai-provider-factory.ts  # Selecciona Ollama o Groq según AI_PROVIDER
│   │   ├── ollama/                # OllamaAiService
│   │   ├── groq/                  # GroqAiService
│   │   ├── auth/                  # JwtAuthService, getCurrentUserId
│   │   ├── database/prisma/       # PrismaTaskRepository + client
│   │   └── lib/auth-secret.ts     # JWT secret compartido (Edge-safe)
│   └── generated/prisma/          # Cliente Prisma generado
├── middleware.ts                  # Protección de rutas + inyección de sesión
├── .opencode/agents/              # Agentes de OpenCode (@architect, @frontend, @prompt-engineer)
├── docker-compose.yml
├── .env.example                   # Plantilla de variables de entorno
├── .env.local                     # Variables locales (no se sube al repo)
├── .env                           # Solo DATABASE_URL para Prisma CLI
├── prisma.config.ts
├── next.config.ts
└── eslint.config.mjs
```

---

## Arquitectura

El proyecto sigue **Clean Architecture** con tres capas:

```
app/ (presentación)  →  infrastructure/ (adaptadores)  →  core/ (dominio)
```

- **`core/`**: entidades, interfaces de repositorios y servicios, casos de uso. Sin dependencias externas.
- **`infrastructure/`**: implementaciones concretas de Prisma, Ollama, Groq y JWT. Importan de `core/`, no al revés.
- **`app/`**: páginas y route handlers de Next.js. Solo orquestan casos de uso.

---

## Seguridad implementada

- Contraseñas hasheadas con bcrypt (12 rounds, máximo 72 bytes)
- JWT httpOnly, `sameSite: lax`, `secure` en producción
- Email normalizado a lowercase en registro y login
- Middleware valida token en todas las rutas protegidas
- Cada ruta API verifica que el recurso pertenece al usuario autenticado
- `/api/auth/logout` es pública para permitir cierre de sesión con token expirado

---

## Agentes de OpenCode

En `.opencode/agents/` hay 3 subagentes configurados:

| Comando | Modelo | Rol |
|---|---|---|
| `@architect` | qwen3.7-max | Esquemas Prisma, rutas API, Clean Architecture |
| `@frontend` | deepseek-v4-flash | Componentes React, Tailwind, diseño para TDAH |
| `@prompt-engineer` | kimi-k2.6 | Refinamiento del system prompt del asistente IA |
