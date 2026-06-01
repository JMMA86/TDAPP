# 📋 Requerimientos del MVP — TDApp

Este documento es la **única fuente de verdad** sobre el contexto del problema, las reglas de negocio, el alcance funcional y las especificaciones visuales del MVP de TDApp. Todos los subagentes deben leer este archivo antes de proponer cambios en la base de datos, lógica de negocio o interfaz de usuario.

---

## 🎯 1. Contexto del Problema y Enfoque del Producto

Muchos jóvenes estudiantes universitarios con TDAH (Trastorno por Déficit de Atención e Hiperactividad), ansiedad o alta carga cognitiva luchan diariamente con la organización personal. Las aplicaciones de productividad tradicionales suelen ser demasiado complejas, rígidas y generan frustración, lo que provoca que terminen siendo abandonadas.

**TDApp** combina **organización modular (Agenda)** con **cuidado cognitivo y validación emocional (Bienestar)**, dentro de una comunidad de apoyo. Su valor central es una interfaz limpia de bajo impacto visual, asistida por un **Agente de IA Empático** (Ollama/Llama3 local) que ayuda a fraccionar la carga mental.

**Usuario de referencia:** Alex Rivera, estudiante universitario con TDAH.

---

## 👥 2. Roles de Usuario

1. **STUDENT** — Quien interactúa con la agenda, registra su estado de ánimo y conversa con la IA. Usuario principal del MVP.
2. **PSYCHOLOGIST** — Consulta el progreso del estudiante. Sin flujos complejos en este sprint.
3. **ADMIN** — Gestión global de la plataforma. Sin flujos complejos en este sprint.

---

## 🗺️ 3. Navegación Global

La app usa una **barra de navegación inferior fija** con 5 secciones. Cada ítem tiene icono + etiqueta de texto:

| Icono | Etiqueta | Ruta |
|---|---|---|
| 🏠 Casa | Inicio | `/` |
| 📅 Calendario | Agenda | `/agenda` |
| 🧘 Bienestar | Bienestar | `/bienestar` |
| 💬 Burbuja | Comunidad | `/comunidad` |
| 👤 Persona | Perfil | `/perfil` |

La sección activa se resalta con color violeta (`violet-600`). Las inactivas en gris (`gray-400`).

---

## 🛠️ 4. Módulos y Pantallas del MVP

---

### Módulo 1 — Inicio (Dashboard)

**Ruta:** `/`
**Header:** `¡Hola, [Nombre]!` con subtítulo `¿Cómo te sientes hoy?` y botón de configuración (⚙️) en esquina superior derecha.

#### Secciones en orden vertical:

**1.1 Card de Estado de Ánimo**
- Fondo degradado violeta (`violet-300` → `violet-400`)
- Título: `Estado de ánimo` con ícono de corazón en la esquina
- 5 emojis seleccionables en fila: 😊 😐 😔 😰 😴
- Subtítulo debajo: `Toca para registrar cómo te sientes ahora`

**1.2 Dos tarjetas de acción rápida (grid 2 columnas)**
- **Card "Respira":** Fondo azul claro (`sky-300`), ícono de viento, texto `Respira`, subtítulo `2 min`. Navega a la sección de Respiración en Bienestar.
- **Card "Micro-tarea":** Fondo verde (`emerald-400`), ícono de diana/objetivo, texto `Micro-tarea`, subtítulo `Fácil`. Navega a crear una micro-tarea.

**1.3 Card "Progreso de hoy"**
- Header de card con badge verde: `3/5 completadas`
- Lista de tareas del día con:
  - Ícono de check circular (verde si completada, gris si pendiente)
  - Nombre de tarea + hora entre paréntesis, ej. `Tomar agua (8am)`
  - Badge de estado: `Completada` (fondo gris claro) o `Pendiente` (fondo blanco, borde)
- Barra de progreso lineal al final + porcentaje, ej. `Progreso diario 60%`

---

### Módulo 2 — Agenda

**Ruta:** `/agenda`
**Header:** `Agenda` con subtítulo `Organiza tu día`, botón de filtro (embudo) y botón `+` (violeta) para agregar tarea.

#### Secciones en orden vertical:

**2.1 Card de resumen diario**
- Fondo degradado violeta
- Título: `Hoy, [Día de la semana] [número]`, ej. `Hoy, Miércoles 4`
- Ícono de calendario en esquina superior derecha
- 3 estadísticas en columnas: `Total`, `Completadas`, `Pendientes` con número grande arriba y etiqueta abajo

**2.2 Tabs de tipo de tarea (3 tabs con icono + texto)**
- ⚡ `Micro-tarea`
- 🕐 `Recordatorio`
- 🎯 `Meta`
- El tab activo tiene fondo blanco con sombra; los inactivos son transparentes con texto gris

**2.3 Lista de TaskCards**
Cada `TaskCard` expande los pasos generados por la IA y muestra:
- Ícono de diana + título de tarea + subtítulo `Dividido en micro-tareas manejables`
- **Card de progreso interno** (fondo violeta claro): texto `Progreso general`, fracción `2/4`, barra de progreso, mensaje motivacional como `¡Vas muy bien! Ya completaste 2 pasos.`
- **Lista de subtareas** con:
  - Ícono de check circular (verde + tachado si completada)
  - Título del paso
  - Badges: dificultad (`easy` en verde, `medium` en amarillo, `hard` en rojo) y tiempo estimado (`⏱ 2min`)

**2.4 Botón flotante de agregar (FAB)**
- Botón `+` circular violeta en esquina inferior derecha como alternativa al del header

---

### Módulo 3 — Bienestar

**Ruta:** `/bienestar`
**Header:** `Bienestar` con subtítulo `Cuida tu salud mental`, flecha de retroceso izquierda.

#### Secciones en orden vertical:

**3.1 Card "¿Cómo te sientes?"**
- Fondo degradado violeta
- Ícono de corazón en esquina superior derecha
- 5 botones de estado de ánimo con emoji + etiqueta de texto:
  - 😁 `Genial`
  - 😊 `Bien` ← estado activo (resaltado con fondo blanco/sombra)
  - 😐 `Normal`
  - 😔 `Bajo`
  - 😰 `Ansioso`

**3.2 Card "Respiración 4-4-6"**
- Fondo degradado azul claro (`sky-300` → `sky-400`)
- Ícono de viento + título `Respiración 4-4-6`
- **Círculo central grande** (fondo blanco translúcido) que muestra el contador numérico (`4`, `4`, `6` según la fase)
- Texto de instrucción debajo: `Inhala suavemente`, `Mantén`, `Exhala lentamente`
- Subtítulo de progreso: `Ciclo 1 - Fase inhale`
- Barra de progreso lineal delgada
- Dos botones en fila: `▷ Comenzar` y `↺ Reiniciar` (ambos con fondo blanco translúcido, esquinas redondeadas)

**Lógica de la respiración:**
- Fase inhale: 4 segundos
- Fase hold: 4 segundos
- Fase exhale: 6 segundos
- El contador hace countdown dentro del círculo
- El mensaje de instrucción cambia por fase
- `Comenzar` inicia/pausa el ciclo; `Reiniciar` lo resetea al inicio

---

### Módulo 4 — Comunidad

**Ruta:** `/comunidad`
**Header:** `Comunidad` con subtítulo `Conecta y aprende junto a otros`, flecha de retroceso y botón `+`.

#### Secciones en orden vertical:

**4.1 Card de estadísticas personales de comunidad**
- Fondo degradado violeta
- Título: `Tu comunidad`, ícono de grupo en esquina
- 3 estadísticas en columnas: `Grupos`, `Conexiones`, `Conversaciones` con número grande arriba

**4.2 Sección "Grupos de apoyo"**
- Header de sección con botón `+ Explorar` (texto violeta con ícono de persona+)
- Lista de `GroupCards`, cada una con:
  - **Nombre del grupo** en negrita, ej. `TDAH Jóvenes Adultos`
  - Descripción breve, ej. `Espacio seguro para compartir experiencias y estrategias`
  - Metadatos: número de miembros + actividad reciente, ej. `1247 miembros · Actividad: Hace 2h`
  - Badge de estado: `Miembro` (verde, si ya pertenece) o ninguno
  - Botón de acción: `Unido` (fondo blanco, borde gris, si ya es miembro) o `Unirse` (fondo violeta sólido)

**Grupos de apoyo del seed inicial:**
1. TDAH Jóvenes Adultos — `Espacio seguro para compartir experiencias y estrategias`
2. Estrategias de Organización — `Tips y trucos para mantenerse organizado`
3. Padres de Niños Neurodivergentes — `Apoyo para familias...`

---

### Módulo 5 — Perfil

**Ruta:** `/perfil`
**Header:** `Mi Perfil` con subtítulo `Personaliza tu experiencia`, flecha de retroceso y botón de configuración (⚙️).

#### Secciones en orden vertical:

**5.1 Card de identidad del usuario**
- Fondo degradado violeta
- Avatar circular con inicial del nombre (ej. `A` para Alex)
- Nombre completo en negrita: `Alex Rivera`
- Subtítulo: `Miembro desde [Mes] [Año]`
- Badge de logro: `💚 En crecimiento constante`
- 3 estadísticas en fila: `Tareas`, `Ejercicios`, `Logros` con número grande

**5.2 Card "Progreso semanal"**
- Ícono de diana + título `Progreso semanal`
- 4 barras de progreso lineales con etiqueta izquierda y valor derecho:
  - `Tareas completadas` — `23/30`
  - `Ejercicios bienestar` — `12/15`
  - `Días activos` — `5/7`
  - `Tiempo mindfulness` — `45min/60min`
- Las barras usan `violet-500` para el relleno

**5.3 Sección "Logros"**
- Ícono de trofeo + título `Logros`
- Grid de badges de logros desbloqueados (a definir en implementación)

---

### Módulo 6 — Agente de IA Empático

**Integración transversal** — disponible desde el chat y desde el botón `Dividir con IA` en cada TaskCard.

**Función 1 — Validación Emocional:**
Cuando el usuario registra un estado de ánimo bajo (Bajo/Ansioso) o escribe sobre agobio, el agente responde con frases cortas, empáticas, sin usar lenguaje clínico ni condescendiente.

**Función 2 — Fraccionador de Tareas:**
Al pulsar `Dividir con IA` en una tarea, el agente genera **3–4 micro-tareas accionables** de 2–15 minutos cada una. Cada micro-tarea incluye:
- Título de la acción concreta
- Dificultad estimada: `easy` / `medium` / `hard`
- Tiempo estimado en minutos

El modelo devuelve un array JSON estricto. La app persiste las subtareas en la tabla `sub_tasks` asociadas a la tarea padre.

---

## 🎨 5. Sistema de Diseño y Directrices UI/UX

### 5.1 Principios de diseño (TDAH / baja carga cognitiva)
- **Una acción principal por pantalla.** El CTA más importante tiene el mayor contraste.
- **Sin texto denso.** Máximo 2–3 líneas de texto por bloque sin separación visual.
- **Feedback inmediato.** Cada acción responde visualmente en menos de 200ms.
- **Estados vacíos motivadores.** Nunca mostrar una pantalla vacía sin un mensaje de aliento y una acción sugerida.

### 5.2 Paleta de colores

| Token | Uso | Valor Tailwind |
|---|---|---|
| Primario | Acciones, badges activos, degradados principales | `violet-500` / `violet-600` |
| Wellness | Cards de bienestar y respiración | `sky-300` / `sky-400` |
| Success | Tareas/pasos completados | `emerald-400` / `emerald-500` |
| Quick-action | Card de micro-tarea rápida | `emerald-400` |
| Alerta suave | Prioridad alta, advertencias | `amber-400` |
| Fondo general | Pantalla principal | `gray-50` / `slate-50` |
| Fondo cards | Tarjetas blancas | `white` |
| Texto principal | Títulos y cuerpo | `gray-800` / `slate-800` |
| Texto secundario | Subtítulos, metadatos | `gray-500` / `slate-500` |

**Degradados de cards principales:**
- Violeta: `from-violet-400 to-violet-500` (Estado de ánimo, Agenda resumen, Perfil)
- Azul: `from-sky-300 to-sky-400` (Respiración)

### 5.3 Tipografía

- **Títulos de sección:** `text-xl font-semibold text-gray-800`
- **Subtítulos de header:** `text-sm text-gray-500`
- **Números de estadísticas:** `text-2xl font-bold` (blanco sobre degradado) o `text-2xl font-bold text-violet-600`
- **Etiquetas de stats:** `text-xs text-white/80` (sobre degradado)
- **Cuerpo de texto:** `text-sm font-normal leading-relaxed text-gray-600`
- **Contador de respiración:** `text-5xl font-bold text-gray-700`

### 5.4 Componentes base

**Cards:**
- Fondo blanco: `bg-white rounded-2xl shadow-sm border border-gray-100 p-4`
- Fondo degradado: `rounded-2xl p-5 text-white` + clase de degradado

**Botones primarios:** `bg-violet-500 hover:bg-violet-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors`

**Botones secundarios:** `bg-white border border-gray-200 text-gray-700 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors`

**Badges de estado:**
- Completada: `bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium`
- Pendiente: `bg-white border border-gray-200 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium`
- Miembro: `bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium`
- Easy: `bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium`

**Barras de progreso:** `h-2 rounded-full bg-gray-200` con relleno `bg-violet-500 rounded-full transition-all duration-500`

**Bottom nav:** `fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-2 px-4`

### 5.5 Layout general

- **Mobile-first:** Diseño base para `375px`. Usar `sm:` y `md:` solo para adaptar a tablet.
- **Scroll vertical** en cada sección. Sin scroll horizontal.
- **Header de sección:** altura fija con flecha atrás (izquierda), título + subtítulo (centro), acción (derecha).
- **Espaciado entre secciones:** `space-y-4` entre cards dentro de una pantalla.
- **Padding general de pantalla:** `px-4 py-4`

---

## 🗄️ 6. Modelo de Datos (PostgreSQL vía Prisma)

Todos los nombres de tabla y columna en `snake_case` mediante `@map` / `@@map`.

```
users         id, email, name, password_hash, role (Enum: STUDENT/PSYCHOLOGIST/ADMIN), created_at, updated_at
tasks         id, user_id→users, title, description, status (Enum), priority (Enum), due_date, created_at, updated_at
sub_tasks     id, task_id→tasks, title, is_completed, orden (Int), created_at
mood_entries  id, user_id→users, score (Int 1–5), note (opcional), created_at
```

**Enums:**
- `TaskStatus`: `PENDING` | `IN_PROGRESS` | `COMPLETED` | `ABANDONED`
- `Priority`: `LOW` | `MEDIUM` | `HIGH`
- `Role`: `STUDENT` | `PSYCHOLOGIST` | `ADMIN`

**Reglas de negocio sobre estados:**
- Al marcar una `Task` como `COMPLETED` → todas sus `SubTask` se marcan `is_completed = true`.
- Al desmarcar una `Task` (COMPLETED → PENDING) → todas sus `SubTask` se desmarcan.
- Al marcar todas las `SubTask` de una `Task` como completadas → la `Task` se marca `COMPLETED` automáticamente.
- Al desmarcar cualquier `SubTask` cuya `Task` padre sea `COMPLETED` → la `Task` vuelve a `PENDING`.

---

## 🚫 7. Fuera de Alcance (MVP)

- Autenticación real (se usa `demo-user` como userId fijo en este sprint).
- Módulo de Comunidad con backend real (la pantalla se implementa como UI estática con datos de seed).
- Pasarelas de pago.
- Notificaciones push.
- Arquitecturas multi-región o multi-tenant.
- Módulo de Logros con lógica de desbloqueo (la sección de Perfil muestra datos estáticos o de seed).

---

*Nota: Este software se construye bajo una mentalidad de MVP de entrega rápida semanal. Las pantallas de referencia visual se encuentran en `/demo-images/`.*
