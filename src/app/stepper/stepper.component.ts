import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper/index.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
declare var require: any;

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import '../../assets/smtp.js';
declare let Email: any;

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class StepperComponent implements OnInit, OnChanges {
  @ViewChild('stepper')
  stepper!: MatStepper;

  @Input() upload!: boolean;

  isMaggiorenne: number = -1;
  datiAtletaMinorenne: FormGroup;
  datiAtletaMaggiorenne: FormGroup;
  formMaggiorenneComplete: boolean = false;
  formMinorenneComplete: boolean = false;
  allFilesLoaded: boolean = false;
  sendingMail: boolean = false;
  mailSent: boolean = false;
  mailError: boolean = false;

  logoBase64!: string;

  attachments: File[] = [];
  attachmentsDict: { [key: string]: string[] } = {};

  docsToUpload: string[] = [];

  constructor(private _formBuilder: FormBuilder, private http: HttpClient) {
    this.datiAtletaMinorenne = this._formBuilder.group({
      nomeGenitore: ['', Validators.required],
      cognomeGenitore: ['', Validators.required],
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      luogo: ['', Validators.required],
      dataNascita: ['', Validators.required],
      residenza: ['', Validators.required],
      viaResidenza: ['', Validators.required],
      nResidenza: ['', Validators.required],
      societa: ['', Validators.required],
      arma: ['', Validators.required],
      numeroFIS: ['', Validators.required],
      allergie: [''],
      preferenzaCamera: [''],
      telefonoAtleta: [''],
      telefonoPadre: ['', Validators.required],
      telefonoMadre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tShirt: ['', Validators.required],
      pantaloncino: ['', Validators.required],
      iscrizione: ['', Validators.required],
    });
    this.datiAtletaMaggiorenne = this._formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      luogo: ['', Validators.required],
      dataNascita: ['', Validators.required],
      residenza: ['', Validators.required],
      viaResidenza: ['', Validators.required],
      nResidenza: ['', Validators.required],
      societa: ['', Validators.required],
      arma: ['', Validators.required],
      numeroFIS: ['', Validators.required],
      allergie: [''],
      preferenzaCamera: [''],
      telefonoAtleta: ['', Validators.required],
      telefonoPadre: [''],
      telefonoMadre: [''],
      email: ['', [Validators.required, Validators.email]],
      tShirt: ['', Validators.required],
      pantaloncino: ['', Validators.required],
      iscrizione: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.http.get('assets/heraclea.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          this.logoBase64 = event.target.result;
        };

        reader.onerror = (event: any) => {
          console.log("File could not be read: " + event.target.error.code);
        };

      });


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.upload) {
      setTimeout(() => {
        this.stepper.selectedIndex = 3;
      }, 100)

    }
  }

  setIsMaggiorenne($event: any) {
    this.isMaggiorenne = parseInt($event?.value);
  }

  isFormComplete($event: any) {
    if (this.isMaggiorenne === 0) {
      this.formMinorenneComplete = $event;
    } else {
      this.formMaggiorenneComplete = $event;
    }
  }

  public exportPDF() {
    const pdfTable = document.getElementById("firstPage") as HTMLElement;
    const pdfTable2 = document.getElementById("secondPage") as HTMLElement;
    const pdfTable3 = document.getElementById("thirdPage") as HTMLElement;
    this.downloadPDF(pdfTable, "Modulo Iscrizione.pdf");
    this.downloadPDF(pdfTable2, "Esonero Responsabilità.pdf");
    this.downloadPDF(pdfTable3, "Liberatoria.pdf");

  }

  downloadPDF(pdf: HTMLElement, name: string) {
    let html = htmlToPdfmake(pdf.innerHTML);

    const defaultStyle = {
      fontSize: 10,
      alignment: 'justify'
    }

    html = html.map((element:any) => {
      if(element.nodeName.includes('H')) {
        element.style = {
          alignment: 'center'
        }
      }
      return element;
    });

    // html[0].style = {
    //   alignment: 'center'
    // }

    const documentDefinition: any = { pageOrientation: 'portrait', pageSize: 'A4', content: html, defaultStyle };
    console.log("document Definition", documentDefinition)
    pdfMake.createPdf(documentDefinition).download(name);
  }

  selectFile(event: any, key: string): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      //this.attachmentsDict[key] = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        // Use a regex to remove data url part
        let base64String = reader.result as string;
        base64String = base64String.replace('data:', '').replace(/^.+,/, '');
        this.attachmentsDict[key] = [];
        this.attachmentsDict[key].push(base64String);
        this.attachmentsDict[key].push(file.name.split(".").pop() || "");
      };
      reader.readAsDataURL(file);
    }
  }

  isAllLoaded() {
    const keys = Object.keys(this.attachmentsDict);
    const documentiFirmati = keys.includes("MODULO_ISCRIZIONE") && keys.includes("ESONERO_RESPONSABILITA") && keys.includes("LIBERATORIA");
    this.allFilesLoaded = documentiFirmati && (keys.includes("CI_FRONTE") || keys.includes("CI_RETRO")) && keys.includes("TESSERA_SANITARIA") && keys.includes("VERSAMENTO_CAPARRA");
    let allergie = this.upload ? false : this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['allergie'] : this.datiAtletaMinorenne.value['allergie'];
    if (allergie) {
      this.allFilesLoaded = this.allFilesLoaded && keys.includes("ALLERGIE_INTOLLERANZE");
    }
    return this.allFilesLoaded;
  }

  sendMail() {
    if (this.isAllLoaded()) {
      this.mailError = false;
      this.mailSent = false;
      this.sendingMail = true;
      const subject = this.upload ? '' : this.isMaggiorenne ?
        this.datiAtletaMaggiorenne.value['nome'] + " " + this.datiAtletaMaggiorenne.value['cognome'] :
        this.datiAtletaMinorenne.value['nome'] + " " + this.datiAtletaMinorenne.value['cognome'];

      const attachmentsList = Object.keys(this.attachmentsDict).map(fileName => {
        return {
          name: fileName + "." + this.attachmentsDict[fileName][1],
          data: this.attachmentsDict[fileName][0]
        }
      });

      Email.send({
        Host: 'smtp.elasticemail.com',
        Username: 'moduli-csc@gmail.com',
        Password: '89CD18545D382C7A0B120B190A3FEE1B56E4',
        To: 'campusscherma@gmail.com',
        From: 'luigicapizzano86@gmail.com',
        Subject: 'Modulo Iscrizione Campo Estivo - ' + subject,
        Body: `
        ${this.upload ? `L'utente che ha inviato questa mail, non ha compilato il modulo, ma ha direttamente caricato i file da inviare.` :
            `In allegato i documenti di iscrizione per il campo estivo dell'atleta: <strong>${subject}</strong>.<br/>
        Questa mail è stata inviata dalla mail: <strong>${this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['email'] : this.datiAtletaMinorenne.value['email']}</strong>. <br/>`
          }
        <br/>
        <br/>
        Questa mail è stata generata automaticamente. Si prega di non rispondere.`,
        Attachments: attachmentsList
      }).then(
        (message: string) => {
          this.sendingMail = false;
          console.log("sendmail message", message);
          if (message.toLowerCase().includes("ok")) {
            this.mailSent = true;
          } else {
            this.mailError = true;
          }
        },
        (error: any) => {
          console.log("sendmail error", error);
          this.mailError = true;
          this.mailSent = false;
        });
    } else {
      alert("Caricare tutti i file richiesti");
    }
  }

}
