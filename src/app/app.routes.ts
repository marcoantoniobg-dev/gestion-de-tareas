import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'tasks',
    loadComponent: () => import('./task-list.component').then(m => m.TaskListComponent)
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./task-create.component').then(m => m.TaskCreateComponent)
  },
  {
    // Ruta de edición: recibe el id de la tarea como parámetro
    path: 'tasks/edit/:id',
    loadComponent: () => import('./task-edit.component').then(m => m.TaskEditComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'planner',
    loadComponent: () => import('./planner.component').then(m => m.PlannerComponent)
  },
];
