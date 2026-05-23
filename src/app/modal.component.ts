import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

// Tipos de modal disponibles
export type ModalType = 'confirm-delete' | 'success' | 'settings' | 'info';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay con animación de fade -->
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'modal-title-' + type"
      (click)="onOverlayClick($event)">

      <!-- Fondo oscuro semitransparente -->
      <div class="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"></div>

      <!-- Contenido del modal -->
      <div
        class="relative bg-surface-container-lowest rounded-2xl shadow-elevated border border-surface-variant w-full max-w-md animate-scale-in"
        (click)="$event.stopPropagation()">

        <!-- Cabecera con icono según el tipo -->
        <div class="flex items-start gap-4 p-6 pb-4">
          <div [class]="iconContainerClass">
            <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">{{ icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 [id]="'modal-title-' + type" class="text-xl font-bold text-on-surface leading-snug">{{ title }}</h2>
            @if (message) {
              <p class="text-on-surface-variant text-sm mt-1 leading-relaxed">{{ message }}</p>
            }
            <!-- Slot para contenido extra (settings) -->
            <ng-content></ng-content>
          </div>
          <!-- Botón de cierre -->
          <button
            (click)="closed.emit()"
            class="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0 -mt-1 -mr-1"
            aria-label="Cerrar diálogo">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Separador -->
        <div class="border-t border-surface-variant mx-6"></div>

        <!-- Botones de acción -->
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 p-6 pt-4">
          @if (showCancel) {
            <button
              id="modal-cancel-btn"
              (click)="cancelled.emit()"
              class="px-6 py-2.5 bg-surface-container rounded-lg font-semibold text-on-surface hover:bg-surface-container-highest transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              {{ cancelLabel }}
            </button>
          }
          <button
            id="modal-confirm-btn"
            (click)="confirmed.emit()"
            [class]="confirmButtonClass"
            class="px-6 py-2.5 rounded-lg font-semibold transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-surface">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">{{ confirmIcon }}</span>
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.92) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.18s ease-out; }
    .animate-scale-in { animation: scale-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `]
})
export class ModalComponent {
  @Input() type: ModalType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = 'Aceptar';
  @Input() cancelLabel = 'Cancelar';
  @Input() showCancel = true;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  // Icono del encabezado según tipo de modal
  get icon(): string {
    switch (this.type) {
      case 'confirm-delete': return 'delete_forever';
      case 'success':        return 'check_circle';
      case 'settings':       return 'settings';
      default:               return 'info';
    }
  }

  // Icono del botón de confirmación
  get confirmIcon(): string {
    switch (this.type) {
      case 'confirm-delete': return 'delete';
      case 'success':        return 'arrow_forward';
      case 'settings':       return 'save';
      default:               return 'check';
    }
  }

  // Clases del contenedor de icono según tipo
  get iconContainerClass(): string {
    const base = 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0';
    switch (this.type) {
      case 'confirm-delete': return `${base} bg-error-container text-error`;
      case 'success':        return `${base} bg-secondary-container text-on-surface`;
      case 'settings':       return `${base} bg-primary-fixed text-primary`;
      default:               return `${base} bg-surface-container-high text-on-surface-variant`;
    }
  }

  // Clases del botón de confirmación según tipo
  get confirmButtonClass(): string {
    switch (this.type) {
      case 'confirm-delete': return 'bg-error text-white hover:opacity-90 focus:ring-error';
      case 'success':        return 'bg-primary text-on-primary hover:bg-primary-container hover:-translate-y-0.5 focus:ring-primary';
      case 'settings':       return 'bg-primary text-on-primary hover:bg-primary-container hover:-translate-y-0.5 focus:ring-primary';
      default:               return 'bg-primary text-on-primary hover:bg-primary-container focus:ring-primary';
    }
  }

  // Cierra el modal al hacer click en el overlay (fondo)
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
