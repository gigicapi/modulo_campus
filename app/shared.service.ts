import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  nReservationToDo: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  constructor() { }

  setNReservation(n: number) {
    this.nReservationToDo.next(n);
  }

  getNReservation$() {
    return this.nReservationToDo.asObservable();
  }

  
}
