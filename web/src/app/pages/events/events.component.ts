import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventManagerComponent } from '../../shared/components/ecommerce/event-manager/event-manager.component';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, RouterModule, EventManagerComponent],
  templateUrl: './events.component.html',
})
export class EventsPageComponent {}
