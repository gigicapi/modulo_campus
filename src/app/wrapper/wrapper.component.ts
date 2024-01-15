import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

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

  steps: number[] = [];

  errors: any;

  constructor(private shared: SharedService) { }

  ngOnInit(): void {
    this.shared.getNReservation$().subscribe(
      (num) => {
        this.numberOfStepper = num;
        this.steps = [...Array(this.numberOfStepper).keys()];
        console.log("STEPS", this.steps);
        if(!this.errors) {
          this.errors = {};
        }
        for(let i = 0; i<this.numberOfStepper; i++) {
          this.errors[i+1] = false;
        }
      }
    );
  }

  increaseStepCompleted($event: boolean) {
    console.log("INCREASESTEP", $event);
    if(!this.errors) {
      this.errors = {};
    }
    this.errors[this.currentStep+1] = $event;
    this.currentStep++;
    console.log("this.errors", this.errors);
    console.log("this.currentStep", this.currentStep);
    console.log("this.numberOfStepper", this.numberOfStepper);
    if(this.currentStep >= this.numberOfStepper) {
      this.isCompleted = true;
    } else {

    }
  }

}
