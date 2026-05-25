import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { TaskService, Task } from './task.service';
import { CommonModule } from '@angular/common'; // we use Date pipe in components sometimes but here we format manually
import { RouterLink } from '@angular/router';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 lg:p-12 pb-24 max-w-[1600px] mx-auto w-full h-full flex flex-col">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 class="text-4xl font-bold text-on-surface mb-2 tracking-tight">Planificador</h1>
          <p class="text-lg text-on-surface-variant">Visualiza tus tareas mensuales.</p>
        </div>
        <div class="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-surface-variant shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <button (click)="previousMonth()" class="w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="text-lg font-bold text-on-surface px-4 min-w-[160px] text-center capitalize truncate">{{ monthName() }}</span>
          <button (click)="nextMonth()" class="w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 flex-1 min-h-[600px]">
        <!-- Calendar Grid -->
        <div class="lg:flex-[2] xl:flex-[3] bg-surface-container-lowest rounded-xl border border-surface-variant shadow-surface overflow-hidden flex flex-col h-full min-h-[400px]">
          
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 border-b border-surface-variant bg-surface-container-low shrink-0">
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Lun</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Mar</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Mié</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Jue</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Vie</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Sáb</div>
             <div class="py-3 text-center text-[11px] md:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Dom</div>
          </div>

          <!-- Calendar Cells -->
          <!-- We use exactly 6 rows to ensure consistent layout (6 weeks cover any month completely) -->
          <div class="grid grid-cols-7 grid-rows-6 flex-1 bg-outline-variant gap-px">
             @for (day of calendarDays(); track day.date.getTime()) {
               <div 
                 (click)="selectDate(day)"
                 class="bg-surface-container-lowest p-1 md:p-2 hover:bg-surface-container-low transition-colors flex flex-col group cursor-pointer relative overflow-hidden h-full"
                 [class.!bg-surface-container-highest]="day.date.getTime() === selectedDate().getTime()"
                 [class.opacity-40]="!day.isCurrentMonth">
                 
                  <!-- Date number -->
                  <div class="flex justify-center md:justify-end mb-1 shrink-0">
                    <span class="text-xs md:text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                          [class.bg-primary]="day.isToday"
                          [class.text-on-primary]="day.isToday"
                          [class.text-on-surface]="!day.isToday && day.isCurrentMonth"
                          [class.text-on-surface-variant]="!day.isToday && !day.isCurrentMonth">
                      {{day.date.getDate()}}
                    </span>
                  </div>

                  <!-- Tasks Container: Desktop (Pills) -->
                  <div class="hidden md:flex flex-col gap-1 overflow-y-auto overflow-x-hidden flex-1 px-1 custom-scrollbar">
                    @for (task of day.tasks; track task.id) {
                       <div class="px-1.5 py-0.5 rounded text-[11px] leading-tight truncate font-medium border border-transparent"
                            [class.opacity-60]="task.status === 'completed'"
                            [class.line-through]="task.status === 'completed'"
                            [class.bg-error-container]="task.priority === 'alta'"
                            [class.text-error]="task.priority === 'alta'"
                            [class.bg-secondary-container]="task.priority === 'media'"
                            [class.text-on-secondary-container]="task.priority === 'media'"
                            [class.bg-surface-container-high]="task.priority === 'baja'"
                            [class.text-on-surface-variant]="task.priority === 'baja'"
                            [class.!border-surface-variant]="task.priority === 'baja'">
                         {{task.title}}
                       </div>
                    }
                  </div>

                  <!-- Tasks Container: Mobile (Dots) -->
                  <div class="flex md:hidden justify-center items-start gap-1 flex-wrap px-0.5 mt-auto mb-1 flex-1 content-start">
                    @for (task of day.tasks.slice(0, 3); track task.id) {
                      <div class="w-2 h-2 rounded-full mt-1"
                           [class.bg-error]="task.priority === 'alta'"
                           [class.bg-secondary]="task.priority === 'media'"
                           [class.bg-on-surface-variant]="task.priority === 'baja'"
                           [class.opacity-40]="task.status === 'completed'">
                      </div>
                    }
                    @if (day.tasks.length > 3) {
                      <span class="text-[10px] font-bold text-on-surface-variant leading-none flex items-end mt-0.5">+</span>
                    }
                  </div>
               </div>
             }
          </div>
        </div>

        <!-- Details Sidebar -->
        <div class="lg:flex-1 flex flex-col gap-6 w-full lg:max-w-md shrink-0 lg:h-full">
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-surface p-6 md:p-8 flex flex-col gap-6 flex-1 overflow-hidden lg:h-full">
            <div class="flex flex-col gap-4 shrink-0">
              <div>
                <h3 class="text-2xl md:text-3xl font-bold text-on-surface mb-1 capitalize">{{ formatDateHeader(selectedDate()) }}</h3>
                <p class="text-on-surface-variant font-medium capitalize">{{ formatDayName(selectedDate()) }}</p>
              </div>
              <a routerLink="/tasks/new" class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full">
                <span class="material-symbols-outlined text-[18px]">add</span>
                Agregar tarea
              </a>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
              @if (selectedDateTasks().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-center py-12 opacity-70">
                  <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">event_available</span>
                  <p class="font-bold text-on-surface text-lg">Día libre</p>
                  <p class="text-on-surface-variant text-sm">No tienes tareas programadas para este día.</p>
                </div>
              } @else {
                <div class="flex flex-col gap-3">
                  @for (task of selectedDateTasks(); track task.id) {
                    <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex items-start gap-4 hover:border-primary-fixed-dim transition-colors group" [class.opacity-70]="task.status === 'completed'">
                      <div class="pt-0.5 shrink-0">
                        <input type="checkbox" [checked]="task.status === 'completed'" (change)="toggleTask(task.id)" class="task-checkbox w-5 h-5 rounded border border-outline bg-surface cursor-pointer appearance-none transition-colors outline-none focus:ring-2 focus:ring-primary-fixed-dim shrink-0">
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1 gap-2">
                          <h4 class="font-bold text-base leading-tight truncate" [class.line-through]="task.status === 'completed'" [class.text-on-surface]="task.status !== 'completed'" [class.text-on-surface-variant]="task.status === 'completed'">
                            {{task.title}}
                          </h4>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0"
                                [class.bg-error-container]="task.priority === 'alta'"
                                [class.text-error]="task.priority === 'alta'"
                                [class.bg-secondary-container]="task.priority === 'media'"
                                [class.text-on-secondary-container]="task.priority === 'media'"
                                [class.bg-surface-container-high]="task.priority === 'baja'"
                                [class.text-on-surface-variant]="task.priority === 'baja'">
                            {{task.priority}}
                          </span>
                        </div>
                        @if (task.description) {
                          <p class="text-xs text-on-surface-variant line-clamp-2">{{task.description}}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlannerComponent {
  taskService = inject(TaskService);
  
  currentDate = signal<Date>(new Date());
  selectedDate = signal<Date>(new Date());
  
  // Calcula los 42 días de la vista mensual (6 semanas completas)
  calendarDays = computed<CalendarDay[]>(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Obtener el día de la semana que empieza el mes (0 = domingo, 1 = lunes)
    // Ajustamos para que la semana empiece en Lunes (0 = Lunes, ..., 6 = Domingo)
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; 
    
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    const allTasks = this.taskService.tasks();
    
    // Días del mes anterior (relleno al principio)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDayOfWeek; i++) {
      const dayDate = new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: this.isSameDate(dayDate, today),
        tasks: this.getTasksForDate(dayDate, allTasks)
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: this.isSameDate(dayDate, today),
        tasks: this.getTasksForDate(dayDate, allTasks)
      });
    }
    
    // Días del mes siguiente (relleno al final, hasta completar 42 celdas)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: this.isSameDate(dayDate, today),
        tasks: this.getTasksForDate(dayDate, allTasks)
      });
    }
    
    return days;
  });
  
  // Tareas para el día seleccionado en el panel lateral
  selectedDateTasks = computed<Task[]>(() => {
    const date = this.selectedDate();
    return this.getTasksForDate(date, this.taskService.tasks());
  });
  
  // Nombre del mes y año en el header
  monthName = computed(() => {
    return this.currentDate().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });
  
  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }
  
  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }
  
  selectDate(day: CalendarDay) {
    this.selectedDate.set(day.date);
    // Si seleccionamos un día de otro mes (los de relleno), navegamos a ese mes
    if (!day.isCurrentMonth) {
      this.currentDate.set(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
  }
  
  toggleTask(id: string) {
    this.taskService.toggleStatus(id);
  }
  
  // Utilidad: Compara si dos fechas son el mismo día exacto
  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  }
  
  // Utilidad: Obtiene las tareas que caen en un día específico (compara strings YYYY-MM-DD)
  private getTasksForDate(date: Date, tasks: Task[]): Task[] {
    // Formatea a YYYY-MM-DD manualmente para evitar problemas de zona horaria con toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return tasks.filter(t => t.dueDate === dateString);
  }
  
  // Formateadores para el panel lateral
  formatDateHeader(date: Date): string {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
  
  formatDayName(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  }
}
