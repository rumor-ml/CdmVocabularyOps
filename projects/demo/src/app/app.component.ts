import { Component } from '@angular/core';
import { DebugService } from './debug/debug.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private debugService: DebugService
  ) {}
}
