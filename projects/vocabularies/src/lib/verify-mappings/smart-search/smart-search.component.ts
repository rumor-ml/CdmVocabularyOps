import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';  

@Component({
  selector: 'app-smart-search',
  standalone: true,
  imports: [
    MatRadioModule,
    CommonModule
  ],
  templateUrl: './smart-search.component.html',
  styleUrls: ['./smart-search.component.css']
})
export class SmartSearchComponent {

}
