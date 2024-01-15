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
  numeroPersone: number = 3;
  numeroPersoneIscritte: number = 0;

  constructor(private router: Router, private shared: SharedService) { }

  ngOnInit(): void {
  }

  goToReservation() {
    this.shared.setNReservation(this.numeroPersone);
    this.router.navigateByUrl('/home');
  }

}
