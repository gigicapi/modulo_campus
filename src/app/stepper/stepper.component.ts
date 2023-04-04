import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper/index.js';
import jsPDF from 'jspdf';
declare var require: any;

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { forkJoin } from 'rxjs';
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import '../../assets/smtp.js';
import { EmailService, FileObject, MailRequest } from '../email.service';
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
  mailSent: { [index: number]: boolean } = {};
  mailError: { [index: number]: boolean } = {};

  totalMails: number = 0;
  mailAlreadySent: number = 0;
  mailInError: number = 0;

  logoBase64!: string;

  attachments: File[] = [];
  attachmentsDict: { [key: string]: any[] } = {};

  docsToUpload: string[] = [];

  allergie: boolean = false;

  totalSize: number = 0;
  sizeUnit: string = "Bytes";

  nomeAtleta: string = '';
  cognomeAtleta: string = '';
  campusAtleta: string = '';

  errorDescriptions: string[] = [];

  weTransferList: File[] = [];

  constructor(private _formBuilder: FormBuilder, private http: HttpClient, private emailService: EmailService) {
    this.datiAtletaMinorenne = this._formBuilder.group({
      nomeGenitore: ['', Validators.required],
      cognomeGenitore: ['', Validators.required],
      luogoGenitore: ['', Validators.required],
      dataNascitaGenitore: ['', Validators.required],
      residenzaGenitore: ['', Validators.required],
      viaResidenzaGenitore: ['', Validators.required],
      nResidenzaGenitore: ['', Validators.required],
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

  isPizzo() {
    if(this.upload) {
      return this.campusAtleta.toLowerCase().includes("pizzo");
    } else {
      if (this.isMaggiorenne === 0) {
        return this.datiAtletaMinorenne.value['iscrizione'].toLowerCase().includes("pizzo");
      } else {
        return this.datiAtletaMaggiorenne.value['iscrizione'].toLowerCase().includes("pizzo");
      }
    }
  }

  public exportPDF() {
    const pdfTable = document.getElementById("firstPage") as HTMLElement;
    const pdfTable2 = document.getElementById("secondPage") as HTMLElement;
    const pdfTable3 = document.getElementById("thirdPage") as HTMLElement;
    this.generatePDF(pdfTable, true);
    this.generatePDF(pdfTable2, true);
    this.generatePDF(pdfTable3, false);

    const defaultStyle = {
      fontSize: 11,
      alignment: 'justify'
    }
    const documentDefinition: any = { pageOrientation: 'portrait', pageSize: 'A4', content: this.allPDF, defaultStyle };
    pdfMake.createPdf(documentDefinition).download('Modulo Iscrizione.pdf');
  }

  allPDF: any[] = [];

  generatePDF(pdf: HTMLElement, pageBreak: boolean) {
    let html = htmlToPdfmake(pdf.innerHTML);

    html = html.map((element: any) => {
      if (element.nodeName.includes('H')) {
        element.style = {
          alignment: 'center'
        }
      }
      return element;
    });

    if (pageBreak) {
      html[html.length - 1] = {
        ...html[html.length - 1],
        pageBreak: 'after'
      }
    }
    this.allPDF.push(html);
  }

  selectFile(event: any, key: string): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];

      const contentType = file.type;

      if (!file || file.size === 0 || file.size >= 7000000 || !contentType || contentType === '') {
        delete this.attachmentsDict[key];
        alert("File non valido");
        return;
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Use a regex to remove data url part
          let base64String = reader.result as string;
          base64String = base64String.replace('data:', '').replace(/^.+,/, '');
          this.attachmentsDict[key] = [];
          this.attachmentsDict[key].push(base64String);
          this.attachmentsDict[key].push(file.name.split(".").pop() || "");
          this.attachmentsDict[key].push("" + file.size);
          this.attachmentsDict[key].push("" + file.type);
          this.attachmentsDict[key].push(file);
          this.attachmentsDict[key].push(contentType);
          this.getTotalSize();
        };
        reader.readAsDataURL(file);
      }

    } else {
      delete this.attachmentsDict[key];
      this.getTotalSize();
    }
  }

  getTotalSize() {
    if (!this.attachmentsDict) return "0";
    const keys = Object.keys(this.attachmentsDict);
    if (!keys || keys.length === 0) return "0";

    let total = 0;
    keys.forEach(k => {
      total += parseFloat(this.attachmentsDict[k][2]) || 0;
    });
    let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'), i = 0; while (total > 900) { total /= 1024; i++; }
    this.totalSize = (Math.round(total * 100) / 100);
    this.sizeUnit = fSExt[i];
    let exactSize = (Math.round(total * 100) / 100) + ' ' + fSExt[i];
    return exactSize;
  }

  getPartialSize(sizes: number[]) {
    let total = 0;
    sizes.forEach(size => {
      total += size || 0;
    });
    let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'), i = 0; while (total > 900) { total /= 1024; i++; }
    return {
      size: (Math.round(total * 100) / 100),
      unit: fSExt[i]
    };
  }

  isOverPartialSize(size: any, unit: any) {
    switch (unit) {
      case 'GB':
        return true;
      case 'MB':
        if (size >= 8) return true;
        return false;
      default:
        return false;
    }
  }

  isOverSize() {
    switch (this.sizeUnit) {
      case 'GB':
        return true;
      case 'MB':
        if (this.totalSize > 9.5) return true;
        return false;
      default:
        return false;
    }
  }

  isAllLoaded() {
    const keys = Object.keys(this.attachmentsDict);
    const documentiFirmati = keys.includes("MODULO_ISCRIZIONE") && keys.includes("ESONERO_RESPONSABILITA") && keys.includes("LIBERATORIA");
    this.allFilesLoaded = documentiFirmati && keys.includes("CI_FRONTE") && keys.includes("CI_RETRO") && keys.includes("CERTIFICATO_MEDICO") && keys.includes("TESSERA_SANITARIA");
    if(!this.isPizzo()) {
      this.allFilesLoaded = this.allFilesLoaded && keys.includes("VERSAMENTO_CAPARRA");
    }
    let isAllergie = this.upload ? this.allergie : this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['allergie'] : this.datiAtletaMinorenne.value['allergie'];
    if (isAllergie) {
      this.allFilesLoaded = this.allFilesLoaded && keys.includes("ALLERGIE_INTOLLERANZE");
    }
    return this.allFilesLoaded;
  }

  // prepareAndSendMail() {
  //   this.errorDescriptions = [];
  //   if (this.isAllLoaded()) {
  //     const whoIs = this.nomeAtleta && this.nomeAtleta !== '' && this.cognomeAtleta && this.cognomeAtleta !== '';
  //     if (this.upload && !whoIs) {
  //       alert("Inserire nome e cognome atleta");
  //       return;
  //     }
  //     this.mailError = false;
  //     this.mailSent = false;
  //     this.sendingMail = true;
  //     const subject = this.upload ? '' : this.isMaggiorenne ?
  //       this.datiAtletaMaggiorenne.value['nome'] + " " + this.datiAtletaMaggiorenne.value['cognome'] :
  //       this.datiAtletaMinorenne.value['nome'] + " " + this.datiAtletaMinorenne.value['cognome'];

  //     if (this.isOverSize()) {
  //       let differentAttachments = [];
  //       const differentMails = [];
  //       const files = Object.keys(this.attachmentsDict);
  //       let actualSizes = [];
  //       for (let i = 0; i < files.length; i++) {
  //         actualSizes.push(parseFloat(this.attachmentsDict[files[i]][2]));
  //         const { size, unit } = this.getPartialSize(actualSizes);
  //         if (!this.isOverPartialSize(size, unit)) {
  //           differentAttachments.push(
  //             {
  //               name: files[i] + "." + this.attachmentsDict[files[i]][1],
  //               data: this.attachmentsDict[files[i]][0]
  //             }
  //           );
  //         } else {
  //           differentMails.push({ subject, differentAttachments });
  //           differentAttachments = [];
  //           differentAttachments.push(
  //             {
  //               name: files[i] + "." + this.attachmentsDict[files[i]][1],
  //               data: this.attachmentsDict[files[i]][0]
  //             }
  //           );
  //           actualSizes = [];
  //           actualSizes.push(parseFloat(this.attachmentsDict[files[i]][2]));
  //         }
  //       }

  //       if (differentAttachments.length > 0) {
  //         differentMails.push({ subject, differentAttachments });
  //         differentAttachments = [];
  //         actualSizes = [];
  //       }
  //       let nMail = 0;
  //       differentMails.forEach(el => {
  //         this.sendEmail(this.upload ? this.nomeAtleta + " " + this.cognomeAtleta : el.subject, el.differentAttachments, nMail++);
  //       });

  //       setTimeout(() => {
  //         if (!this.mailError) this.mailSent = true;
  //       }, 5000);

  //     } else {
  //       const attachmentsList = Object.keys(this.attachmentsDict).map(fileName => {
  //         return {
  //           name: fileName + "." + this.attachmentsDict[fileName][1],
  //           data: this.attachmentsDict[fileName][0]
  //         }
  //       });
  //       this.sendEmail(this.upload ? this.nomeAtleta + " " + this.cognomeAtleta : subject, attachmentsList);
  //     }

  //   } else {
  //     alert("Caricare tutti i file richiesti");
  //   }
  // }

  // sendEmail(subject: string, attachmentsList: any[], numEmail?: number) {
  //   const mailObject1 = (numEmail && numEmail >= 1) ? '[' + numEmail + ']' : '';
  //   const mailObj = "Modulo Iscrizione Campo Estivo - " + subject + " " + mailObject1;
  //   this.sendingMail = true;
  //   Email.send({
  //     Host: 'smtp.elasticemail.com',
  //     Username: 'moduli-csc@gmail.com',
  //     Password: '89CD18545D382C7A0B120B190A3FEE1B56E4',
  //     To: 'campusscherma@gmail.com',
  //     From: 'luigicapizzano86@gmail.com',
  //     Subject: mailObj,
  //     Body: `
  //     ${this.upload ? `L'utente che ha inviato questa mail (${this.nomeAtleta} ${this.cognomeAtleta}), non ha compilato il modulo, ma ha direttamente caricato i file da inviare.` :
  //         `In allegato i documenti di iscrizione per il campo estivo dell'atleta: <strong>${subject}</strong>.<br/>
  //     Questa mail è stata inviata dalla mail: <strong>${this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['email'] : this.datiAtletaMinorenne.value['email']}</strong>. <br/>`
  //       }
  //     <br/>
  //     <br/>
  //     Questa mail è stata generata automaticamente. Si prega di non rispondere.`,
  //     Attachments: attachmentsList
  //   }).then(
  //     (message: string) => {
  //       this.sendingMail = false;
  //       console.log("sendmail message", message);
  //       if (message.toLowerCase().includes("ok")) {
  //         if (!numEmail || numEmail === 0) this.mailSent = true;
  //         return true;
  //       } else {
  //         this.mailError = true;
  //         return false;
  //       }
  //     },
  //     (error: any) => {
  //       console.log("sendmail error", error);
  //       this.mailError = true;
  //       this.mailSent = false;
  //       this.errorDescriptions.push("Errore durante l'invio della mail (" + numEmail + "): " + error);
  //       return false;
  //     });
  // }

  sendMailWithService() {
    this.errorDescriptions = [];
    this.mailAlreadySent = 0;
    this.mailInError = 0;
    this.mailError = {};
    this.mailSent = {};
    if (this.isAllLoaded()) {
      const whoIs = this.nomeAtleta && this.nomeAtleta !== '' && this.cognomeAtleta && this.cognomeAtleta !== '';
      if (this.upload && !whoIs) {
        alert("Inserire nome e cognome atleta");
        return;
      }

      const getCampus = (data: string) => {
        if (data && data.toLowerCase().includes('pizzo')) return "Pizzo";
        if (data && data.toLowerCase().includes('formia')) return "Formia";
        return "";
      }

      const campus = this.upload ? " - campus: " + this.campusAtleta : ` - campus: ${this.isMaggiorenne ? getCampus(this.datiAtletaMaggiorenne.value['iscrizione']) : getCampus(this.datiAtletaMinorenne.value['iscrizione'])}`;

      const subject = this.upload ? this.cognomeAtleta + " " + this.nomeAtleta : this.isMaggiorenne ?
        this.datiAtletaMaggiorenne.value['cognome'] + " " + this.datiAtletaMaggiorenne.value['nome'] :
        this.datiAtletaMinorenne.value['cognome'] + " " + this.datiAtletaMinorenne.value['nome'];

      const mailRequests: MailRequest[] = Object.keys(this.attachmentsDict).map(fileName => {
        const fo: FileObject = {
          filename: fileName + "." + this.attachmentsDict[fileName][1],
          data: this.attachmentsDict[fileName][0],
          contentType: this.attachmentsDict[fileName][5]
        }

        const mailReq: MailRequest = {
          subject: subject + campus + " - " + fo.filename,
          recipients: ['campusscherma@gmail.com', 'fortesting.lc@gmail.com'], //
          mailText: `
          ${this.upload ? `L'utente che ha inviato questa mail (${this.nomeAtleta} ${this.cognomeAtleta}), non ha compilato il modulo, ma ha direttamente caricato i file da inviare.` :
              `In allegato i documenti di iscrizione per il campo estivo dell'atleta: ${subject}.
              Questa mail è stata inviata dalla mail: ${this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['email'] : this.datiAtletaMinorenne.value['email']}.`
            }
              Questa mail è stata generata automaticamente. Si prega di non rispondere.`,
          files: [fo]
        }

        return mailReq;
      });

      this.totalMails = mailRequests.length;
      for (let i = 0; i < mailRequests.length; i++) {
        this.mailSent[i] = false;
        this.mailError[i] = false;
      }

      this.sendingMail = true;
      mailRequests.forEach((mailRequest, index) => {

        this.emailService.sendEmail(mailRequest).subscribe(
          {
            next: (val: any) => {
              console.log("NEXT", val);
              if (!val.msg) {
                this.errorDescriptions.push(JSON.stringify(val.error));
                this.mailSent[index] = false;
                this.mailError[index] = true;
                this.mailInError++;
              } else {
                this.mailSent[index] = true;
                this.mailAlreadySent++;
                this.mailError[index] = false;
              }
              if(index === mailRequests.length-1) {
                this.sendingMail = false;
              }
            },
            error: (err: any) => {
              console.log("ERROR", err);
              this.errorDescriptions.push(JSON.stringify(err));
              this.mailSent[index] = false;
              this.mailError[index] = true;
              this.mailInError++;
              if(index === mailRequests.length-1) {
                this.sendingMail = false;
              }
            },
            complete: () => {
              console.log("COMPLETE");
              if(index === mailRequests.length-1) {
                this.sendingMail = false;
              }
            }
          }
        )

      });

      // const mailRequest: MailRequest = {
      //   subject,
      //   recipients: ['luigicapizzano86@gmail.com'], //'campusscherma@gmail.com',
      //   mailText: `
      //       ${this.upload ? `L'utente che ha inviato questa mail (${this.nomeAtleta} ${this.cognomeAtleta}), non ha compilato il modulo, ma ha direttamente caricato i file da inviare.` :
      //           `In allegato i documenti di iscrizione per il campo estivo dell'atleta: ${subject}.
      //           Questa mail è stata inviata dalla mail: ${this.isMaggiorenne ? this.datiAtletaMaggiorenne.value['email'] : this.datiAtletaMinorenne.value['email']}.`
      //         }
      //           Questa mail è stata generata automaticamente. Si prega di non rispondere.`,
      //   files: Object.keys(this.attachmentsDict).map(fileName => {
      //     const fo: FileObject = {
      //       filename: fileName + "." + this.attachmentsDict[fileName][1],
      //       data: this.attachmentsDict[fileName][0],
      //       contentType: this.attachmentsDict[fileName][5]
      //     }
      //     return fo;
      //   })

      // }
      // this.emailService.sendEmail(mailRequest).subscribe(
      //   (ok: any) => {
      //     console.log(ok);
      //     this.sendingMail = false;
      //     if(!ok.msg) {
      //       this.errorDescriptions.push(JSON.stringify(ok.error));
      //       this.mailSent = false;
      //       this.mailError = true;
      //     } else {
      //       this.mailSent = true;
      //       this.mailError = false;
      //     }

      //   },
      //   (error) => {
      //     console.log("sendingMail ERROR", error);
      //     this.sendingMail = false;
      //     this.mailError = true;
      //     this.mailSent = false;
      //     this.errorDescriptions.push(JSON.stringify(error));
      //   }
      // )

    } else {
      alert("Caricare tutti i file richiesti");
    }

  }

  getSentOk() {
    const count = Object.values(this.mailSent).filter(x => x).length;
    return count;
  }
  getSentError() {
    const count = Object.values(this.mailError).filter(x => x).length;
    return count;
  }

}
