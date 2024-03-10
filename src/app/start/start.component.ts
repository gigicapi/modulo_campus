import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  selectPeople: boolean = false;
  selectOnePeople: boolean = false;
  alreadySigned: boolean = false;
  numeroPersone: number = 3;
  numeroPersoneIscritte: number = 0;
  numeroPersoneGara: number = 0;

  constructor(private router: Router, private shared: SharedService) { }

  ngOnInit(): void {
  }

  goToClassicReservation() {
    this.shared.setNReservation(1);
    this.shared.setNSigned(0);
    this.shared.setIsGara(false);
    this.router.navigate(['home']);
  }

  goToSingleReservation() {
    this.shared.setNReservation(this.alreadySigned ? 0 : 1);
    this.shared.setNSigned(this.alreadySigned ? 1 : 0);
    this.shared.setIsGara(true);
    this.router.navigate(['home']);
  }

  goToReservation() {
    this.shared.setNReservation(this.numeroPersone - this.numeroPersoneIscritte);
    //this.shared.setNSigned(this.numeroPersoneIscritte);
    //this.shared.setNForGara(this.numeroPersoneGara);
    this.shared.setIsGara(true);
    this.router.navigate(['reservations']);
  }

  goToUpdateDocuments() {
    this.router.navigate(['upload-docs']);
  }

}
