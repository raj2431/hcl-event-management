
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import flatpickr from 'flatpickr';

@Component({
  selector: 'app-time-picker',
  imports: [],
  templateUrl: './time-picker.component.html',
  styles: ``
})
export class TimePickerComponent implements OnChanges {

  @Input() id!: string;
  @Input() label: string = 'Time Select Input';
  @Input() placeholder: string = 'Select time';
  @Input() defaultTime?: string | Date;

  @Output() timeChange = new EventEmitter<string>();

  @ViewChild('timeInput', { static: false }) timeInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['defaultTime'] || !this.flatpickrInstance) {
      return;
    }

    if (this.defaultTime) {
      this.flatpickrInstance.setDate(this.defaultTime, false);
    } else {
      this.flatpickrInstance.clear(false);
    }
  }

  ngAfterViewInit() {
    this.flatpickrInstance = flatpickr(this.timeInput.nativeElement, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',   // time format HH:mm
      time_24hr: false,    // set true for 24hr clock
      minuteIncrement: 1,
      defaultDate: this.defaultTime,
      onChange: (selectedDates, dateStr) => {
        this.timeChange.emit(dateStr); // emit "HH:mm"
      }
    });
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
