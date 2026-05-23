import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TaskService } from './task.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 md:p-12 pb-24 max-w-4xl mx-auto flex flex-col items-center">

      <!-- Encabezado -->
      <div class="mb-10 w-full">
        <h1 class="text-4xl font-bold text-on-surface mb-2 tracking-tight">Crear Tarea</h1>
        <p class="text-on-surface-variant text-lg">Añade una nueva actividad a tu lista para mantener la serenidad.</p>
      </div>

      <!-- Formulario -->
      <div class="w-full bg-surface-container-lowest rounded-xl shadow-surface p-8 md:p-12 border border-surface-container">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-8" id="form-crear-tarea">

          <!-- Título -->
          <div class="flex flex-col gap-2">
            <label for="create-title" class="text-sm font-bold text-tertiary">
              Título de la Tarea <span class="text-error">*</span>
            </label>
            <input
              id="create-title"
              type="text"
              formControlName="title"
              placeholder="Ej: Preparar presentación trimestral"
              class="w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all"
              [class.border-outline-variant]="!titleInvalid()"
              [class.border-error]="titleInvalid()"
              [class.focus:border-primary]="!titleInvalid()"
              [class.focus:ring-primary]="!titleInvalid()"
              [class.focus:border-error]="titleInvalid()"
              [class.focus:ring-error]="titleInvalid()">
            @if (titleInvalid()) {
              <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                El título es obligatorio.
              </p>
            }
          </div>

          <!-- Descripción -->
          <div class="flex flex-col gap-2">
            <label for="create-description" class="text-sm font-bold text-tertiary">Descripción</label>
            <textarea
              id="create-description"
              formControlName="description"
              rows="4"
              placeholder="Detalles de la tarea..."
              class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none">
            </textarea>
          </div>

          <!-- Fecha de vencimiento y prioridad -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div class="flex flex-col gap-2">
              <label for="create-dueDate" class="text-sm font-bold text-tertiary">Fecha de Vencimiento</label>
              <input
                id="create-dueDate"
                type="date"
                formControlName="dueDate"
                class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-text">
            </div>

            <div class="flex flex-col gap-2">
              <label for="create-priority" class="text-sm font-bold text-tertiary">Prioridad</label>
              <div class="relative">
                <select
                  id="create-priority"
                  formControlName="priority"
                  class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-4 pr-10 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer">
                  <option value="baja">Baja — Sin prisa</option>
                  <option value="media">Media — Importante</option>
                  <option value="alta">Alta — Urgente</option>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span class="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones del formulario -->
          <div class="flex flex-col sm:flex-row justify-end gap-4 mt-4 pt-8 border-t border-surface-variant">
            <a
              id="btn-cancelar-crear"
              routerLink="/tasks"
              class="px-8 py-3 bg-surface-container rounded-lg font-semibold text-on-surface hover:bg-surface-container-highest transition-all text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Cancelar
            </a>
            <button
              id="btn-guardar-crear"
              type="submit"
              [disabled]="form.invalid"
              class="px-8 py-3 bg-primary rounded-lg font-semibold text-on-primary hover:bg-primary-container hover:-translate-y-0.5 shadow-surface transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              Añadir Tarea
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- Modal de éxito al crear -->
    @if (showSuccessModal()) {
      <app-modal
        type="success"
        title="¡Tarea creada!"
        message="Tu nueva tarea se ha guardado correctamente y está lista en tu lista."
        confirmLabel="Ver mis tareas"
        [showCancel]="false"
        (confirmed)="navigateToList()"
        (closed)="navigateToList()">
      </app-modal>
    }
  `
})
export class TaskCreateComponent {
  taskService = inject(TaskService);
  router = inject(Router);

  showSuccessModal = signal(false);

  form = new FormGroup({
    title:       new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl(''),
    dueDate:     new FormControl(''),
    priority:    new FormControl<'baja' | 'media' | 'alta'>('media')
  });

  // Determina si el título tiene errores visibles (sólo tras tocar el campo)
  titleInvalid(): boolean {
    const ctrl = this.form.get('title');
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    if (this.form.valid) {
      this.taskService.addTask(this.form.value as any);
      this.showSuccessModal.set(true);
    } else {
      // Marca todos los campos como tocados para mostrar errores
      this.form.markAllAsTouched();
    }
  }

  navigateToList() {
    this.router.navigate(['/tasks']);
  }
}
