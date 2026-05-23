import { Injectable, signal, effect } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'pending' | 'completed';
  createdAt: string;
}

// Tareas de ejemplo para el primer arranque
const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Revisión de Diseño Q3',
    description: 'Finalizar la auditoría de componentes compartidos y actualizar el sistema de diseño según las nuevas pautas orgánicas.',
    dueDate: '2026-06-15',
    priority: 'alta',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Preparar Presentación Cliente',
    description: 'Reunir los slides finales para la demostración del viernes. Asegurar que los colores reflejen el tema Sereno.',
    dueDate: '2026-06-20',
    priority: 'media',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Sincronización de Equipo',
    description: 'Llamada semanal para alinear objetivos de desarrollo.',
    dueDate: '2026-06-10',
    priority: 'media',
    status: 'completed',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Actualizar Dependencias',
    description: 'Revisar y actualizar los paquetes npm al último parche de seguridad.',
    dueDate: '2026-06-12',
    priority: 'baja',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

const STORAGE_KEY = 'tareas-pendientes-v1';

@Injectable({ providedIn: 'root' })
export class TaskService {

  // Cargamos las tareas desde localStorage o usamos las de ejemplo
  tasks = signal<Task[]>(this.loadFromStorage());

  constructor() {
    // Cada vez que cambien las tareas, las guardamos en localStorage automáticamente
    effect(() => {
      this.saveToStorage(this.tasks());
    });
  }

  // Carga las tareas guardadas en localStorage
  private loadFromStorage(): Task[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Task[];
      }
    } catch {
      // Si hay error al parsear, usamos datos de ejemplo
    }
    return SAMPLE_TASKS;
  }

  // Guarda las tareas en localStorage
  private saveToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Silenciar errores de cuota de storage
    }
  }

  // Agrega una nueva tarea
  addTask(task: Omit<Task, 'id' | 'status' | 'createdAt'>) {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.tasks.update(ts => [newTask, ...ts]);
  }

  // Actualiza una tarea existente por id
  updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    this.tasks.update(ts =>
      ts.map(t => t.id === id ? { ...t, ...changes } : t)
    );
  }

  // Alterna el estado entre pendiente y completada
  toggleStatus(id: string) {
    this.tasks.update(ts => ts.map(t =>
      t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
    ));
  }

  // Elimina una tarea por id
  deleteTask(id: string) {
    this.tasks.update(ts => ts.filter(t => t.id !== id));
  }

  // Obtiene una tarea por id
  getTaskById(id: string): Task | undefined {
    return this.tasks().find(t => t.id === id);
  }
}
