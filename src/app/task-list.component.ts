import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService, Task } from './task.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterLink, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 md:p-12 pb-24 max-w-7xl mx-auto">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 class="text-4xl font-bold text-on-surface mb-2 tracking-tight">Mis Tareas</h1>
          <p class="text-on-surface-variant text-lg">Encuentra la serenidad completando un paso a la vez.</p>
        </div>
        <a
          id="btn-crear-tarea"
          routerLink="/tasks/new"
          class="bg-primary text-on-primary px-8 py-3 rounded-full flex items-center gap-2 font-semibold hover:bg-primary-container hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary shadow-surface">
          <span class="material-symbols-outlined">add_task</span>
          Crear Tarea
        </a>
      </div>

      <!-- Contadores de resumen -->
      <div class="grid grid-cols-3 gap-4 mb-10">
        <div class="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant text-center hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300 cursor-pointer">
          <div class="text-3xl font-bold text-primary">{{ totalTasks() }}</div>
          <div class="text-xs font-semibold text-on-surface-variant mt-1 uppercase tracking-wide">Total</div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant text-center hover:shadow-md hover:-translate-y-0.5 hover:border-secondary/30 transition-all duration-300 cursor-pointer">
          <div class="text-3xl font-bold text-secondary">{{ pendingTasks() }}</div>
          <div class="text-xs font-semibold text-on-surface-variant mt-1 uppercase tracking-wide">Pendientes</div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant text-center hover:shadow-md hover:-translate-y-0.5 hover:border-outline/30 transition-all duration-300 cursor-pointer">
          <div class="text-3xl font-bold text-on-surface-variant">{{ completedTasks() }}</div>
          <div class="text-xs font-semibold text-on-surface-variant mt-1 uppercase tracking-wide">Completadas</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-10">
        <button
          id="filter-all"
          (click)="filter.set('all')"
          [class]="filter() === 'all' ? 'bg-secondary-container text-on-secondary-container shadow-sm hover:bg-secondary-fixed hover:-translate-y-0.5' : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant hover:text-primary'"
          class="px-6 py-2 rounded-full font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Todas
        </button>
        <button
          id="filter-pending"
          (click)="filter.set('pending')"
          [class]="filter() === 'pending' ? 'bg-secondary-container text-on-secondary-container shadow-sm hover:bg-secondary-fixed hover:-translate-y-0.5' : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant hover:text-primary'"
          class="px-6 py-2 rounded-full font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Pendientes
        </button>
        <button
          id="filter-completed"
          (click)="filter.set('completed')"
          [class]="filter() === 'completed' ? 'bg-secondary-container text-on-secondary-container shadow-sm hover:bg-secondary-fixed hover:-translate-y-0.5' : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant hover:text-primary'"
          class="px-6 py-2 rounded-full font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Completadas
        </button>
      </div>

      <!-- Estado vacío -->
      @if (filteredTasks().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-[40px] text-on-surface-variant">task_alt</span>
          </div>
          <h3 class="text-xl font-bold text-on-surface mb-2">Sin tareas</h3>
          <p class="text-on-surface-variant max-w-xs">
            @if (filter() === 'all') {
              Aún no has creado ninguna tarea. ¡Empieza añadiendo una!
            } @else if (filter() === 'pending') {
              No tienes tareas pendientes. ¡Buen trabajo!
            } @else {
              Aún no has completado ninguna tarea.
            }
          </p>
        </div>
      }

      <!-- Grid de tareas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (task of filteredTasks(); track task.id) {
          <div
            class="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4 shadow-surface hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 border border-surface-variant relative overflow-hidden group"
            [class.opacity-70]="task.status === 'completed'">

            <!-- Barra de prioridad (sólo en pendientes) -->
            @if (task.priority === 'alta' && task.status === 'pending') {
              <div class="absolute top-0 left-0 w-full h-1 bg-primary rounded-t-xl"></div>
            } @else if (task.priority === 'media' && task.status === 'pending') {
              <div class="absolute top-0 left-0 w-full h-1 bg-secondary rounded-t-xl"></div>
            }

            <!-- Contenido principal -->
            <div class="flex items-start gap-4 mt-1 flex-1">
              <input
                type="checkbox"
                [id]="'task-check-' + task.id"
                [checked]="task.status === 'completed'"
                (change)="toggle(task.id)"
                class="task-checkbox mt-1 w-5 h-5 rounded border border-outline bg-surface cursor-pointer appearance-none shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim">
              <div class="flex-1 min-w-0">
                <h3
                  class="text-xl font-bold group-hover:text-primary transition-colors mb-2 leading-snug"
                  [class.line-through]="task.status === 'completed'"
                  [class.text-on-surface]="task.status !== 'completed'"
                  [class.text-on-surface-variant]="task.status === 'completed'">
                  {{ task.title }}
                </h3>
                @if (task.description) {
                  <p class="text-on-surface-variant line-clamp-2 text-sm">{{ task.description }}</p>
                }
                <!-- Badge de prioridad -->
                <div class="mt-3">
                  <span [class]="priorityBadgeClass(task.priority)" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full" [class]="priorityDotClass(task.priority)"></span>
                    {{ priorityLabel(task.priority) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer con fecha y acciones -->
            <div class="mt-2 pt-4 border-t border-surface-variant flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                @if (task.status === 'completed') {
                  <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  <span>Completada {{ task.completedAt ? formatDateTime(task.completedAt) : '' }}</span>
                } @else if (task.dueDate) {
                  <span class="material-symbols-outlined text-[18px]">event</span>
                  <span>{{ formatDate(task.dueDate) }}</span>
                } @else {
                  <span class="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Sin fecha</span>
                }
              </div>

              <!-- Botones de acción (visibles al hacer hover) -->
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                @if (task.status === 'pending') {
                  <a
                    [id]="'btn-edit-' + task.id"
                    [routerLink]="['/tasks/edit', task.id]"
                    class="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-primary-fixed transition-colors"
                    title="Editar tarea">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </a>
                }
                <button
                  [id]="'btn-delete-' + task.id"
                  (click)="requestDelete(task)"
                  class="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:text-error hover:bg-error-container transition-colors"
                  title="Eliminar tarea">
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    @if (showDeleteModal()) {
      <app-modal
        type="confirm-delete"
        title="Eliminar tarea"
        [message]="'¿Seguro que quieres eliminar «' + (taskToDelete()?.title ?? '') + '»? Esta acción no se puede deshacer.'"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        [showCancel]="true"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()"
        (closed)="closeDeleteModal()">
      </app-modal>
    }

    <!-- Toast de éxito al completar una acción -->
    @if (showSuccessToast()) {
      <div class="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-on-surface text-surface px-6 py-4 rounded-xl shadow-elevated animate-toast-in">
        <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1; color: #a8d5a2;">check_circle</span>
        <span class="font-semibold text-sm">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-toast-in { animation: toast-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `]
})
export class TaskListComponent {
  taskService = inject(TaskService);
  filter = signal<'all' | 'pending' | 'completed'>('all');

  // Modales y toasts
  showDeleteModal = signal(false);
  taskToDelete = signal<Task | null>(null);
  showSuccessToast = signal(false);
  toastMessage = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Tareas filtradas según el filtro activo
  filteredTasks = computed(() => {
    const tasks = this.taskService.tasks();
    const f = this.filter();
    if (f === 'all') return tasks;
    return tasks.filter(t => t.status === f);
  });

  // Contadores para el resumen
  totalTasks = computed(() => this.taskService.tasks().length);
  pendingTasks = computed(() => this.taskService.tasks().filter(t => t.status === 'pending').length);
  completedTasks = computed(() => this.taskService.tasks().filter(t => t.status === 'completed').length);

  // Alterna el estado de una tarea y muestra toast
  toggle(id: string) {
    this.taskService.toggleStatus(id);
    const task = this.taskService.tasks().find(t => t.id === id);
    if (task?.status === 'completed') {
      this.showToast('¡Tarea completada! 🎉');
    }
  }

  // Solicita confirmación antes de eliminar
  requestDelete(task: Task) {
    this.taskToDelete.set(task);
    this.showDeleteModal.set(true);
  }

  // Ejecuta la eliminación tras confirmación
  confirmDelete() {
    const task = this.taskToDelete();
    if (task) {
      this.taskService.deleteTask(task.id);
      this.showToast('Tarea eliminada correctamente.');
    }
    this.closeDeleteModal();
  }

  // Cierra el modal sin eliminar
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.taskToDelete.set(null);
  }

  // Muestra un toast temporal durante 3 segundos
  showToast(message: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.showSuccessToast.set(true);
    this.toastTimer = setTimeout(() => this.showSuccessToast.set(false), 3000);
  }

  // Formatea una fecha ISO a formato legible en español (solo fecha)
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // Formatea una fecha ISO a formato legible con fecha y hora
  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  // Clases del badge de prioridad
  priorityBadgeClass(priority: 'baja' | 'media' | 'alta'): string {
    switch (priority) {
      case 'alta':  return 'bg-error-container text-error';
      case 'media': return 'bg-secondary-container text-on-surface';
      case 'baja':  return 'bg-surface-container-high text-on-surface-variant';
    }
  }

  // Clase del punto de color del badge
  priorityDotClass(priority: 'baja' | 'media' | 'alta'): string {
    switch (priority) {
      case 'alta':  return 'bg-error';
      case 'media': return 'bg-secondary';
      case 'baja':  return 'bg-on-surface-variant';
    }
  }

  // Etiqueta de prioridad en español
  priorityLabel(priority: 'baja' | 'media' | 'alta'): string {
    switch (priority) {
      case 'alta':  return 'Alta';
      case 'media': return 'Media';
      case 'baja':  return 'Baja';
    }
  }
}
