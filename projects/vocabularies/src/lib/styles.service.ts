import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StylesService {

  styles = window.getComputedStyle(document.body)
  primary = this.styles.getPropertyValue('--primary')

  constructor() { }
}
