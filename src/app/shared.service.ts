import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  nReservationToDo: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  nAlreadySigned: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  nForGara: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  isGara: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  onlyUpload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  setNReservation(n: number) {
    this.nReservationToDo.next(n);
  }

  getNReservation$() {
    return this.nReservationToDo.asObservable();
  }

  setNSigned(n: number) {
    this.nAlreadySigned.next(n);
  }

  getNSigned$() {
    return this.nAlreadySigned.asObservable();
  }

  setIsGara(n: boolean) {
    this.isGara.next(n);
  }

  getIsGara() {
    return this.isGara.getValue();
  }

  getIsGara$() {
    return this.isGara.asObservable();
  }

  getNForGara$() {
    return this.nForGara.asObservable();
  }

  getNForGara() {
    return this.nForGara.getValue();
  }

  setNForGara(n: number) {
    this.nForGara.next(n);
  }

  setOnlyUpload(n: boolean) {
    this.onlyUpload.next(n);
  }

  getOnlyUpload() {
    return this.onlyUpload.getValue();
  }

  getOnlyUpload$() {
    return this.onlyUpload.asObservable();
  }

}
