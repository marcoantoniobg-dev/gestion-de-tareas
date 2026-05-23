import { Injectable, signal, effect } from '@angular/core';

// Datos del perfil del usuario
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

const PROFILE_STORAGE_KEY = 'user-profile-v1';

// Perfil por defecto (primera carga)
const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Ana',
  lastName: 'García',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkakV9WMoIn5l27jkWfYSbxGeWQJ6nxkAJx4YtXw7WT4a3DUcN5qwGcYk_qZTZXfp1DCfH42-H7i8vDRnf9mwmbjBN72XW4GXrXXemPwmFR07Xew8n6GQHgN3kWTOkH69wDj0A7He9nYFP1ALp9rZHCP60PT2Hc1XYEPm1dH40V7E4TGB1RAkC3KUmY-Q6VUUe4fWni1KVVqZaP30oHD8DDmVWJY8J6vmhUympawKk5MBAMcDLtjlS68e5AkjfeSugyhEGNL5mlC8V'
};

@Injectable({ providedIn: 'root' })
export class ProfileService {

  // Signal reactivo con los datos del perfil — compartido entre App y ProfileComponent
  profile = signal<UserProfile>(this.loadFromStorage());

  constructor() {
    // Persiste en localStorage automáticamente cada vez que cambia el perfil
    effect(() => {
      this.saveToStorage(this.profile());
    });
  }

  // Computed: nombre completo concatenado
  get fullName(): string {
    const { firstName, lastName } = this.profile();
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  // Actualiza los datos del perfil
  updateProfile(changes: Partial<UserProfile>): void {
    this.profile.update(p => ({ ...p, ...changes }));
  }

  // Carga el perfil guardado en localStorage
  private loadFromStorage(): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) } as UserProfile;
      }
    } catch {
      // Si hay error de parseo, usamos el perfil por defecto
    }
    return DEFAULT_PROFILE;
  }

  // Guarda el perfil en localStorage
  private saveToStorage(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Silenciar errores de cuota de storage
    }
  }
}
