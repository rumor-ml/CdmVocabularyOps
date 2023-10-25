import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Auth {
  'uid': string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth = new BehaviorSubject<Auth>({'uid': 'John Smith'})

  constructor() { }
}

