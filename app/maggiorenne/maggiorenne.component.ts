import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-maggiorenne',
  templateUrl: './maggiorenne.component.html',
  styleUrls: ['./maggiorenne.component.scss']
})
export class MaggiorenneComponent implements OnInit {
  @Input() datiAtleta!: FormGroup;
  @Output() formCompleteEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _formBuilder: FormBuilder) {
    // this.datiAtleta = this._formBuilder.group({
    //   nome: ['', Validators.required],
    //   cognome: ['', Validators.required],
    //   luogo: ['', Validators.required],
    //   dataNascita: ['', Validators.required],
    //   residenza: ['', Validators.required],
    //   viaResidenza: ['', Validators.required],
    //   nResidenza: ['', Validators.required],
    //   societa: ['', Validators.required],
    //   arma: ['', Validators.required],
    //   numeroFIS: ['', Validators.required],
    //   allergie: [''],
    //   preferenzaCamera: [''],
    //   telefonoAtleta: ['', Validators.required],
    //   telefonoPadre: ['', Validators.required],
    //   telefonoMadre: ['', Validators.required],
    //   tShirt: ['', Validators.required],
    //   pantaloncino: ['', Validators.required],
    //   iscrizione: ['', Validators.required],
    // });
  }

  get formControl() {
    return this.datiAtleta.controls;
  }

  ngOnInit(): void {
    this.datiAtleta.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
      ).subscribe(
        formValues => {
          this.formCompleteEvent.emit(this.datiAtleta.valid);
        }
      );

  }

}
