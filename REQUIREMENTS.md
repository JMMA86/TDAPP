# 📋 Requerimientos del MVP — TDApp

Este documento contiene la única fuente de verdad sobre el contexto del problema, las reglas de negocio y el alcance del MVP de TDApp para el desarrollo en OpenCode. Todos los subagentes deben leer este archivo antes de proponer cambios en la base de datos o en la interfaz de usuario.

---

## 🎯 1. Contexto del Problema y Enfoque del Producto
Muchos jóvenes estudiantes universitarios con TDAH (Trastorno por Déficit de Atención e Hiperactividad), ansiedad o alta carga cognitiva luchan diariamente con la organización personal. Las aplicaciones de productividad tradicionales suelen ser demasiado complejas, rígidas y generan frustración, lo que provoca que terminen siendo abandonadas.

**TDApp** es una solución que combina la **organización modular (Agenda)** con el **cuidado cognitivo y la validación emocional (Bienestar)**. Su valor central radica en una interfaz limpia, de bajo impacto visual, asistida por un **Agente de IA Empático** que ayuda a fraccionar la carga mental de los usuarios.

---

## 👥 2. Roles de Usuario (Dominio)
El sistema debe diferenciar tres tipos de usuarios en su capa de negocio:
1. **STUDENT (Estudiante / Usuario Principal):** Quien interactúa con la agenda, registra su humor y conversa con la IA (Ej. Alex).
2. **PSYCHOLOGIST (Psicólogo / Acompañante):** Rol pensado para consultar o dar soporte al progreso del estudiante (sin flujos complejos en el MVP).
3. **ADMIN (Administrador):** Gestión global de la plataforma.

---

## 🛠️ 3. Módulos Estructurales del MVP (Alcance de 1 Semana)

### Módulo A: El Agente de IA Empático (Core del Cierre del Curso)
El backend se comunica con un modelo de lenguaje local (**Ollama con Llama3/Mistral**).
- **Función 1: Validación Emocional.** El agente debe procesar estados de ánimo bajos o mensajes de agobio respondiendo de manera clara, con frases cortas y con un tono altamente empático.
- **Función 2: El Fraccionador de Tareas (Efecto WOW).** Cuando el usuario expresa sentirse abrumado por una meta grande (Ej. *"Tengo un examen de 5 páginas"*), el agente debe ser capaz de descomponer ese bloque de estrés en **3 o 4 micro-tareas accionables de 2 minutos** y guardarlas o sugerir su inserción en la agenda.

### Módulo B: Agenda y Gestión de Micro-Tareas
- El usuario gestiona sus metas diarias de manera modular.
- Cada tarea principal (`Task`) puede estar compuesta o dividida en subtareas menores (`SubTask` o micro-tareas) creadas por el usuario o sugeridas por la IA.
- **Prioridades:** `LOW`, `MEDIUM`, `HIGH`.
- **Estados de Tarea:** `PENDING` (Pendiente), `IN_PROGRESS` (En curso), `COMPLETED` (Completada), `ABANDONED` (Abandonada por salud mental, sin penalización cognitiva).

### Módulo C: Bienestar y Check-In Emocional
- **Registro de Humor (`MoodEntry`):** Un selector diario rápido donde el usuario registra cómo se siente usando una escala numérica del 1 al 5 o equivalencia en emojis de satisfacción/ansiedad.
- Incluye una nota de texto opcional para desahogo emocional que la IA puede leer para dar contexto a la conversación.

---

## 🎨 4. Directrices de UI/UX (Baja Carga Cognitiva)
El diseño implementado por el frontend debe respetar rigurosamente los mockups cargados:
- **Layout:** Basado en bloques/tarjetas (`Cards`) independientes con bordes redondeados pronunciados y sombras suaves.
- **Paleta de Colores:** Tonos pastel, violetas y azules relajantes que eviten la sobreestimulación visual.
- **Micro-interacciones:** Elementos circulares para cronómetros de respiración (técnica 4-4-6 de regulación), barras de progreso lineales para ver el avance diario del estudiante y botones limpios para estados de ánimo.

---

## 🗄️ 5. Modelo de Datos Esperado (Entidades de Base de Datos)
El Arquitecto debe mapear a PostgreSQL a través de Prisma las siguientes estructuras con nombres de tablas y campos en `snake_case`:
- **users:** `id`, `email`, `name`, `role` (Enum), `created_at`, `updated_at`.
- **tasks:** `id`, `user_id`, `title`, `description`, `status` (Enum), `priority` (Enum), `due_date`, `created_at`.
- **sub_tasks:** `id`, `task_id`, `title`, `is_completed`, `created_at`.
- **mood_entries:** `id`, `user_id`, `score` (Int/Enum), `note`, `created_at`.

---
*Nota: Este software se construye bajo una mentalidad de MVP de entrega rápida semanal. No requiere pasarelas de pago Stripe activas ni arquitecturas multi-región complejas en este sprint.*