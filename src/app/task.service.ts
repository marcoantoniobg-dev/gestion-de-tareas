import { Injectable, signal, effect } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

// Tareas de ejemplo para el primer arranque (vaciado para que inicie limpio)
const SAMPLE_TASKS: Task[] = [];

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
    this.tasks.update(ts => ts.map(t => {
      if (t.id === id) {
        const isPending = t.status === 'pending';
        return { 
          ...t, 
          status: isPending ? 'completed' : 'pending',
          completedAt: isPending ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
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
