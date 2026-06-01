import AgendaContainer from '@/components/agenda/agenda-container';
import MoodTracker from '@/components/agenda/mood-tracker';
import TaskCard from '@/components/agenda/task-card';

interface DemoTask {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const demoTasks: DemoTask[] = [
  {
    id: '1',
    title: 'Preparar presentación para la reunión del lunes',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
  },
  {
    id: '2',
    title: 'Comprar leche, huevos, pan integral y fruta para la semana',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: '3',
    title: 'Llamar al médico para agendar cita de revisión anual',
    status: 'PENDING',
    priority: 'LOW',
  },
  {
    id: '4',
    title: 'Revisar y responder los correos pendientes del viernes',
    status: 'COMPLETED',
    priority: 'HIGH',
  },
];

export default function Home() {
  return (
    <AgendaContainer>
      <MoodTracker />

      <section>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Mi Agenda</h1>
        <div className="space-y-3">
          {demoTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>
    </AgendaContainer>
  );
}
