// Seed script para TDApp — pobla la base de datos con datos de prueba
// Ejecutar: npx prisma db seed

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de TDApp...\n');

  // ─── 1. Usuario demo ─────────────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'alex@tdapp.com',
      name: 'Alex',
      role: 'STUDENT',
    },
  });
  console.log(`✅ Usuario demo creado/actualizado: ${demoUser.name} (${demoUser.email})`);

  // ─── 2. Tareas ───────────────────────────────────────────────────────────
  // Limpiamos subtareas y tareas previas del usuario demo para idempotencia
  await prisma.subTask.deleteMany({
    where: { task: { userId: 'demo-user' } },
  });
  await prisma.task.deleteMany({
    where: { userId: 'demo-user' },
  });

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        id: 'task-tesis',
        title: 'Escribir marco teórico de la tesis',
        description: 'Redactar la sección de marco teórico para el proyecto de grado',
        status: 'PENDING',
        priority: 'HIGH',
        taskType: 'GOAL',
        userId: 'demo-user',
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-viveres',
        title: 'Comprar víveres de la semana',
        description: 'Frutas, verduras, proteínas y snacks saludables',
        status: 'PENDING',
        priority: 'MEDIUM',
        taskType: 'MICRO_TASK',
        userId: 'demo-user',
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-medico',
        title: 'Llamar al especialista médico',
        description: 'Agendar cita de seguimiento con el psicólogo',
        status: 'PENDING',
        priority: 'HIGH',
        taskType: 'REMINDER',
        userId: 'demo-user',
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-presentacion',
        title: 'Preparar presentación de la universidad',
        description: 'Slides para la exposición del viernes',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        taskType: 'GOAL',
        userId: 'demo-user',
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-agua',
        title: 'Tomar agua cada 2 horas',
        description: 'Mantenerse hidratado durante el día',
        status: 'PENDING',
        priority: 'LOW',
        taskType: 'REMINDER',
        userId: 'demo-user',
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-repasar',
        title: 'Repasar apuntes de la clase de cálculo',
        description: 'Revisar los temas vistos esta semana',
        status: 'PENDING',
        priority: 'MEDIUM',
        taskType: 'MICRO_TASK',
        userId: 'demo-user',
      },
    }),
  ]);

  console.log(`✅ ${tasks.length} tareas creadas para ${demoUser.name}`);

  // ─── 3. Subtareas para "Escribir marco teórico de la tesis" ──────────────
  const subTasks = await prisma.subTask.createMany({
    data: [
      {
        title: 'Buscar 5 papers académicos en Google Scholar',
        orden: 1,
        difficulty: 'MEDIUM',
        estimatedMinutes: 15,
        taskId: 'task-tesis',
      },
      {
        title: 'Leer abstracts y marcar ideas clave',
        orden: 2,
        difficulty: 'EASY',
        estimatedMinutes: 10,
        taskId: 'task-tesis',
      },
      {
        title: 'Escribir primer borrador de 300 palabras',
        orden: 3,
        difficulty: 'HARD',
        estimatedMinutes: 15,
        taskId: 'task-tesis',
      },
    ],
  });

  console.log(`✅ ${subTasks.count} subtareas creadas para "Escribir marco teórico de la tesis"`);

  // ─── 4. Subtareas para "Preparar presentación de la universidad" ─────────
  const subTasks2 = await prisma.subTask.createMany({
    data: [
      {
        title: 'Revisar el temario y seleccionar los puntos principales',
        orden: 1,
        difficulty: 'EASY',
        estimatedMinutes: 5,
        taskId: 'task-presentacion',
      },
      {
        title: 'Buscar imágenes y gráficos para apoyar los puntos',
        orden: 2,
        difficulty: 'MEDIUM',
        estimatedMinutes: 10,
        taskId: 'task-presentacion',
      },
      {
        title: 'Crear las diapositivas con una idea por slide',
        orden: 3,
        difficulty: 'MEDIUM',
        estimatedMinutes: 15,
        taskId: 'task-presentacion',
      },
      {
        title: 'Practicar la exposición en voz alta 2 veces',
        orden: 4,
        difficulty: 'HARD',
        estimatedMinutes: 10,
        taskId: 'task-presentacion',
      },
    ],
  });

  console.log(`✅ ${subTasks2.count} subtareas creadas para "Preparar presentación de la universidad"`);

  // ─── Resumen ─────────────────────────────────────────────────────────────
  console.log('\n📊 Resumen del seed:');
  console.log(`   Usuarios: 1 (demo-user)`);
  console.log(`   Tareas:   ${tasks.length}`);
  console.log(`   Subtareas: ${subTasks.count + subTasks2.count}`);
  console.log('\n🎉 Seed completado exitosamente.');
}

main()
  .catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
