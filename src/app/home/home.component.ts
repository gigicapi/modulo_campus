import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  stepStart: boolean = false;
  onlyUpload: boolean = false;

  isGara: boolean = false;

  constructor(private shared: SharedService) { }

  ngOnInit(): void {
    this.shared.getIsGara$().subscribe(
      (isGara) => {
        this.isGara = isGara;
      }
    )
  }

}
