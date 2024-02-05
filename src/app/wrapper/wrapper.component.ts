import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {
  @Input() upload!: boolean;
  isCompleted: boolean = false;
  currentStep: number = 0;
  numberOfStepper: number = 1;
  isCompletedAlreadySigned: boolean = false;
  currentStepAlreadySigned: number = 0;
  numberOfAlreadySigned: number = 0;

  steps: number[] = [];
  stepsAlreadySigned: number[] = [];

  nomiECognomi: { nome: string, cognome: string }[] = [];

  errors: any;

  constructor(private shared: SharedService) { }

  ngOnInit(): void {
    combineLatest([this.shared.getNReservation$(), this.shared.getNSigned$()])
      .subscribe(
        ([num, numAlreadySigned]) => {
          this.numberOfStepper = num;
          this.numberOfAlreadySigned = numAlreadySigned;
          this.steps = [...Array(this.numberOfStepper).keys()];
          this.stepsAlreadySigned = [...Array(this.numberOfAlreadySigned).keys()];
          this.nomiECognomi = [];
          for (let i = 0; i < this.numberOfAlreadySigned; i++) {
            this.nomiECognomi[i] = {
              nome: "",
              cognome: ""
            }
          };
          if (!this.errors) {
            this.errors = {};
          }
          for (let i = 0; i < this.numberOfStepper; i++) {
            this.errors[i + 1] = false;
          }
        }
      );
  }

  increaseStepCompleted($event: boolean) {
    if (!this.errors) {
      this.errors = {};
    }
    this.errors[this.currentStep + 1] = $event;
    this.currentStep++;
    if (this.currentStep >= this.numberOfStepper) {
      this.isCompleted = true;

      // MANDARE MAIL CON I NOMI DEI GIà ISCRITTI
    } 
  }

  isAllAlreadySignStepCompleted() {
    if(this.numberOfAlreadySigned === 0) return true;
    for (let i = 0; i < this.numberOfAlreadySigned; i++) {
      if(!this.isAlreadySignStepCompleted(i)) {
        return false;
      }
    }
    return true;
  }

  isAlreadySignStepCompleted(n: number) {
    return this.nomiECognomi[n].nome && this.nomiECognomi[n].nome !== '' && this.nomiECognomi[n].cognome && this.nomiECognomi[n].cognome !== '';
  }

  isAllCompleted() {
    return this.isAllAlreadySignStepCompleted() && this.isCompleted;
  }

}
