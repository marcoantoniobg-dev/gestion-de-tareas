import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService } from './profile.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 md:p-12 pb-24 flex justify-center w-full">
      <div class="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-surface p-8 md:p-12 border border-surface-container hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">

        <!-- Encabezado -->
        <div class="text-center mb-10">
          <h1 class="text-4xl font-bold text-primary mb-3 tracking-tight">Tu Perfil</h1>
          <p class="text-on-surface-variant text-lg">Actualiza tu información personal para mantener tu espacio al día.</p>
        </div>

        <!-- Sección de avatar -->
        <div class="flex flex-col items-center gap-6 mb-10">

          <!-- Previsualización del avatar -->
          <div
            class="w-32 h-32 rounded-full border-2 border-primary overflow-hidden relative group cursor-pointer bg-surface-container"
            (click)="triggerFileInput()"
            title="Haz clic para cambiar la foto">
            <img
              [src]="previewUrl()"
              alt="Avatar de perfil"
              class="w-full h-full object-cover group-hover:opacity-70 transition-opacity">
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
              <span class="material-symbols-outlined text-white text-3xl">photo_camera</span>
            </div>
          </div>

          <!-- Nombre del usuario bajo el avatar -->
          @if (currentFullName()) {
            <p class="text-base font-bold text-on-surface tracking-tight -mt-2">{{ currentFullName() }}</p>
          }

          <!-- Input oculto para selección de archivo -->
          <input
            #fileInput
            id="profile-file-input"
            type="file"
            accept="image/png,image/jpeg"
            class="hidden"
            (change)="onFileSelected($event)">

          <!-- Botón "Seleccionar imagen" -->
          <div class="text-center">
            <p class="text-sm font-semibold text-on-surface-variant mb-3">Solo se permiten imágenes JPG y PNG</p>
            <button
              id="btn-seleccionar-imagen"
              type="button"
              (click)="triggerFileInput()"
              class="bg-primary-container text-on-primary-container font-semibold py-2 px-6 rounded-full hover:bg-primary-fixed-dim hover:text-on-primary-fixed-variant transition-all flex items-center gap-2 border border-primary-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span class="material-symbols-outlined text-[18px]">upload</span>
              Seleccionar imagen
            </button>
          </div>

          <!-- Mensaje de error si el formato no es válido -->
          @if (fileError()) {
            <div class="flex items-center gap-2 text-error text-sm font-medium bg-error-container px-4 py-2.5 rounded-lg w-full justify-center">
              <span class="material-symbols-outlined text-[18px]">error</span>
              {{ fileError() }}
            </div>
          }
        </div>

        <!-- Campos de nombre y apellidos -->
        <form [formGroup]="form" (ngSubmit)="onSave()" id="form-perfil">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

            <div class="flex flex-col gap-2">
              <label for="profile-nombre" class="text-sm font-bold text-tertiary">
                Nombre <span class="text-error">*</span>
              </label>
              <input
                id="profile-nombre"
                type="text"
                formControlName="firstName"
                placeholder="Ej: Ana"
                class="w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all"
                [class.border-outline-variant]="!isInvalid('firstName')"
                [class.border-error]="isInvalid('firstName')"
                [class.focus:border-primary]="!isInvalid('firstName')"
                [class.focus:ring-primary]="!isInvalid('firstName')"
                [class.focus:border-error]="isInvalid('firstName')"
                [class.focus:ring-error]="isInvalid('firstName')">
              @if (isInvalid('firstName')) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span>
                  El nombre es obligatorio.
                </p>
              }
            </div>

            <div class="flex flex-col gap-2">
              <label for="profile-apellidos" class="text-sm font-bold text-tertiary">
                Apellidos <span class="text-error">*</span>
              </label>
              <input
                id="profile-apellidos"
                type="text"
                formControlName="lastName"
                placeholder="Ej: García"
                class="w-full bg-surface-container-lowest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 transition-all"
                [class.border-outline-variant]="!isInvalid('lastName')"
                [class.border-error]="isInvalid('lastName')"
                [class.focus:border-primary]="!isInvalid('lastName')"
                [class.focus:ring-primary]="!isInvalid('lastName')"
                [class.focus:border-error]="isInvalid('lastName')"
                [class.focus:ring-error]="isInvalid('lastName')">
              @if (isInvalid('lastName')) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span>
                  Los apellidos son obligatorios.
                </p>
              }
            </div>
          </div>

          <!-- Acciones del formulario -->
          <div class="pt-8 border-t border-surface-variant flex justify-end gap-4">
            <button
              id="btn-cancelar-perfil"
              type="button"
              (click)="onCancel()"
              class="px-8 py-3 bg-surface-container rounded-full font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Cancelar
            </button>
            <button
              id="btn-guardar-perfil"
              type="submit"
              [disabled]="form.invalid"
              class="px-8 py-3 bg-primary rounded-full font-semibold text-on-primary hover:bg-primary-container hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">save</span>
              Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- Modal de éxito al guardar el perfil -->
    @if (showSuccessModal()) {
      <app-modal
        type="success"
        title="¡Perfil actualizado!"
        message="Tu información de perfil se ha guardado correctamente."
        confirmLabel="Aceptar"
        [showCancel]="false"
        (confirmed)="closeSuccessModal()"
        (closed)="closeSuccessModal()">
      </app-modal>
    }
  `
})
export class ProfileComponent {
  profileService = inject(ProfileService);

  showSuccessModal = signal(false);
  fileError = signal('');

  // URL de previsualización: usa la imagen nueva seleccionada o la del perfil guardado
  previewUrl = signal(this.profileService.profile().avatarUrl);

  // Nombre completo actual del perfil guardado (para mostrarlo bajo el avatar)
  currentFullName = computed(() => {
    const p = this.profileService.profile();
    return [p.firstName, p.lastName].filter(Boolean).join(' ');
  });

  // Formulario pre-rellenado con los datos del perfil guardado
  form = new FormGroup({
    firstName: new FormControl(this.profileService.profile().firstName, [Validators.required]),
    lastName:  new FormControl(this.profileService.profile().lastName,  [Validators.required])
  });

  // Abre el input de archivo oculto
  triggerFileInput(): void {
    const input = document.getElementById('profile-file-input') as HTMLInputElement;
    input?.click();
  }

  // Gestiona la selección de archivo: valida tipo y genera previsualización
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError.set('');

    if (!file) return;

    // Validamos que sea PNG o JPG/JPEG
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError.set('Solo se permiten imágenes en formato JPG o PNG.');
      // Limpiamos el input para permitir volver a seleccionar
      input.value = '';
      return;
    }

    // Leemos el archivo como Data URL para previsualización inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.previewUrl.set(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  // Guarda los cambios en el ProfileService (y localStorage automáticamente)
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.profileService.updateProfile({
      firstName: this.form.value.firstName ?? '',
      lastName:  this.form.value.lastName  ?? '',
      avatarUrl: this.previewUrl()
    });

    this.showSuccessModal.set(true);
  }

  // Restaura el formulario y la previsualización al estado guardado
  onCancel(): void {
    const p = this.profileService.profile();
    this.form.patchValue({ firstName: p.firstName, lastName: p.lastName });
    this.previewUrl.set(p.avatarUrl);
    this.fileError.set('');
    this.form.markAsPristine();
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
  }

  // Determina si un campo tiene errores visibles (sólo tras tocarlo)
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
