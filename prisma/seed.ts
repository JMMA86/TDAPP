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
        taskId: 'task-tesis',
      },
      {
        title: 'Leer abstracts y marcar ideas clave',
        orden: 2,
        taskId: 'task-tesis',
      },
      {
        title: 'Escribir primer borrador de 300 palabras',
        orden: 3,
        taskId: 'task-tesis',
      },
    ],
  });

  console.log(`✅ ${subTasks.count} subtareas creadas para "Escribir marco teórico de la tesis"`);

  // ─── Resumen ─────────────────────────────────────────────────────────────
  console.log('\n📊 Resumen del seed:');
  console.log(`   Usuarios: 1 (demo-user)`);
  console.log(`   Tareas:   ${tasks.length}`);
  console.log(`   Subtareas: ${subTasks.count}`);
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
