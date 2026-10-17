import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';
import { DatePickerComponent } from '../../form/date-picker/date-picker.component';
import { TimePickerComponent } from '../../form/time-picker/time-picker.component';

export type EventStatus = 'Planned' | 'Live' | 'Completed' | 'Draft';

export interface EventRecord {
  id: number;
  name: string;
  status: EventStatus;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  description: string;
}

@Component({
  selector: 'app-event-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, DatePickerComponent, TimePickerComponent],
  templateUrl: './event-manager.component.html',
})
export class EventManagerComponent {
  private readonly storageKey = 'smart-event-management-events';

  statusFilters = ['All', 'Planned', 'Live', 'Completed', 'Draft'] as const;
  selectedFilter: 'All' | 'Planned' | 'Live' | 'Completed' | 'Draft' = 'All';
  searchTerm = '';
  isFormOpen = false;
  formMode: 'create' | 'update' = 'create';
  selectedEventId: number | null = null;
  validationMessage = '';

  eventDraft: Omit<EventRecord, 'id'> = {
    name: '',
    status: 'Planned',
    date: '',
    time: '',
    location: '',
    category: 'Conference',
    attendees: 0,
    maxAttendees: 120,
    description: '',
  };

  events: EventRecord[] = this.loadEvents();

  private loadEvents(): EventRecord[] {
    const fallback: EventRecord[] = [
      {
        id: 1,
        name: 'Product Launch Night',
        status: 'Live',
        date: '2026-10-28',
        time: '18:30',
        location: 'Skyline Hall, Downtown',
        category: 'Conference',
        attendees: 82,
        maxAttendees: 120,
        description: 'A citywide launch event with demos, investor Q&A, and networking.',
      },
      {
        id: 2,
        name: 'Leadership Summit',
        status: 'Planned',
        date: '2026-11-03',
        time: '09:00',
        location: 'Harbor Center',
        category: 'Workshop',
        attendees: 64,
        maxAttendees: 90,
        description: 'Strategic planning workshop for executive teams and partner leads.',
      },
      {
        id: 3,
        name: 'Community Wellness Expo',
        status: 'Completed',
        date: '2026-09-17',
        time: '10:00',
        location: 'Riverside Pavilion',
        category: 'Expo',
        attendees: 220,
        maxAttendees: 260,
        description: 'A full-day wellness showcase with sponsors, live workshops, and local partners.',
      },
      {
        id: 4,
        name: 'Brand Story Session',
        status: 'Draft',
        date: '2026-11-18',
        time: '15:00',
        location: 'North Studio',
        category: 'Workshop',
        attendees: 18,
        maxAttendees: 40,
        description: 'A customer storytelling session featuring guest speakers and innovation demos.',
      },
    ];

    if (typeof localStorage === 'undefined') {
      return fallback;
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        localStorage.setItem(this.storageKey, JSON.stringify(fallback));
        return fallback;
      }

      const parsed = JSON.parse(raw) as EventRecord[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      localStorage.setItem(this.storageKey, JSON.stringify(fallback));
      return fallback;
    }
  }

  private persistEvents(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    }
  }

  get filteredEvents(): EventRecord[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.events.filter((event) => {
      const matchesFilter =
        this.selectedFilter === 'All' || event.status === this.selectedFilter;
      const matchesQuery =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }

  get totalEvents(): number {
    return this.events.length;
  }

  get plannedCount(): number {
    return this.events.filter((event) => event.status === 'Planned').length;
  }

  get liveCount(): number {
    return this.events.filter((event) => event.status === 'Live').length;
  }

  openCreateEvent(): void {
    this.formMode = 'create';
    this.selectedEventId = null;
    this.eventDraft = {
      name: '',
      status: 'Planned',
      date: '',
      time: '',
      location: '',
      category: 'Conference',
      attendees: 0,
      maxAttendees: 120,
      description: '',
    };
    this.isFormOpen = true;
  }

  openUpdateEvent(event: EventRecord): void {
    this.formMode = 'update';
    this.selectedEventId = event.id;
    this.eventDraft = {
      name: event.name,
      status: event.status,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      description: event.description,
    };
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.formMode = 'create';
    this.selectedEventId = null;
  }

  onEventDateChange(event: { dateStr: string }): void {
    this.eventDraft.date = event.dateStr;
    this.validationMessage = '';
  }

  onEventTimeChange(time: string): void {
    this.eventDraft.time = time;
    this.validationMessage = '';
  }

  saveEvent(): void {
    const missingFields: string[] = [];
    if (!this.eventDraft.name.trim()) missingFields.push('Event name');
    if (!this.eventDraft.status) missingFields.push('Status');
    if (!this.eventDraft.date) missingFields.push('Event date');
    if (!this.eventDraft.time) missingFields.push('Event time');
    if (!this.eventDraft.location.trim()) missingFields.push('Location');
    if (!this.eventDraft.category.trim()) missingFields.push('Category');
    if (!Number(this.eventDraft.maxAttendees) || Number(this.eventDraft.maxAttendees) < 1) {
      missingFields.push('Max attendees');
    }
    if (!this.eventDraft.description.trim()) missingFields.push('Description');

    if (missingFields.length > 0) {
      this.validationMessage = `${missingFields.join(', ')} ${missingFields.length === 1 ? 'is' : 'are'} required.`;
      return;
    }

    this.validationMessage = '';
    const normalizedDraft = {
      ...this.eventDraft,
      attendees: Number(this.eventDraft.attendees) || 0,
      maxAttendees: Number(this.eventDraft.maxAttendees) || 1,
    };

    if (this.formMode === 'update' && this.selectedEventId !== null) {
      this.events = this.events.map((event) =>
        event.id === this.selectedEventId
          ? {
              ...event,
              ...normalizedDraft,
              id: event.id,
            }
          : event,
      );
    } else {
      const nextEvent: EventRecord = {
        id: Date.now(),
        ...normalizedDraft,
      };
      this.events = [nextEvent, ...this.events];
    }

    this.persistEvents();
    this.closeForm();
  }

  deleteEvent(id: number): void {
    this.events = this.events.filter((event) => event.id !== id);
    this.persistEvents();
  }

  getStatusClasses(status: EventStatus): string {
    switch (status) {
      case 'Live':
        return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
      case 'Planned':
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400';
      case 'Completed':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
    }
  }
}
