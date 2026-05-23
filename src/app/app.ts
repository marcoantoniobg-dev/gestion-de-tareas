import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ModalComponent } from './modal.component';
import { ProfileService } from './profile.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModalComponent],
  templateUrl: './app.html',
})
export class App {
  // Servicio de perfil — reactivo en toda la app
  profileService = inject(ProfileService);

  // Visibilidad del modal de ajustes
  showSettingsModal = signal(false);

  // Visibilidad del dropdown de perfil en el navbar
  showProfileDropdown = signal(false);

  openSettings() {
    this.showProfileDropdown.set(false);
    this.showSettingsModal.set(true);
  }

  closeSettings() {
    this.showSettingsModal.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(v => !v);
  }

  closeProfileDropdown() {
    this.showProfileDropdown.set(false);
  }

  // Cierra el dropdown al hacer clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Cerramos si el clic no fue dentro del contenedor del dropdown
    if (!target.closest('#profile-dropdown-container')) {
      this.showProfileDropdown.set(false);
    }
  }
}
