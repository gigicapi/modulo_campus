import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../shared.service';
import { combineLatest } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { EmailService, FileObject, isValidContent, MailRequest } from '../email.service';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Router } from '@angular/router';
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-multiple-reservation',
  templateUrl: './multiple-reservation.component.html',
  styleUrls: ['./multiple-reservation.component.scss']
})
export class MultipleReservationComponent implements OnInit {
  @ViewChild('stepperM')
  stepper!: MatStepper;

  intestatario!: FormGroup;

  totalPeople: number = 0;
  alreadySigned: number = 0;
  forGara: number = 0;

  steps: Array<number> = [];

  nomiECognomi: {
    nome: string,
    cognome: string,
    dataNascita: string,
    gara: boolean,
    tShirt?: string,
    doc?: {
      content: string,
      name: string,
      contentType: string,
      completeFile: File,
      extension: string,
      size?: any,
    },
    doc_1?: {
      content: string,
      name: string,
      contentType: string,
      completeFile: File,
      extension: string,
      size?: any,
    }
  }[] = [];

  docIntestatario!: {
    content: string,
    name: string,
    contentType: string,
    completeFile: File,
    extension: string,
    size?: any,
  };

  docIntestatario_1!: {
    content: string,
    name: string,
    contentType: string,
    completeFile: File,
    extension: string,
    size?: any,
  };

  moduloIscrizione!: {
    content: string,
    name: string,
    contentType: string,
    completeFile: File,
    extension: string,
    size?: any,
  };

  sendingMail: boolean = false;
  mailSentWithoutError: boolean = false;
  mailSent: { [index: number]: boolean } = {};
  mailError: { [index: number]: boolean } = {};

  totalMails: number = 0;

  logoBase64!: string;

  constructor(private _formBuilder: FormBuilder, private shared: SharedService, private emailService: EmailService, private http: HttpClient, private router: Router) {
    this.intestatario = this._formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      luogo: ['', Validators.required],
      dataNascita: ['', Validators.required],
      residenza: ['', Validators.required],
      viaResidenza: ['', Validators.required],
      nResidenza: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gara: [''],
      tShirt: ['']
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
    combineLatest([this.shared.getNReservation$(), this.shared.getNSigned$(), this.shared.getNForGara$()]).subscribe(
      {
        next: ([total, alreadySigned, forGara]) => {
          if(!total || total < 3) {
            this.router.navigate(['start']);
            return;
          }
          this.totalPeople = total;
          this.alreadySigned = alreadySigned;
          this.forGara = forGara;
          this.steps = [...Array(this.totalPeople - 1).keys()];
          this.nomiECognomi = [];
          for (let i = 0; i < this.totalPeople - 1; i++) {
            this.nomiECognomi[i] = {
              nome: "",
              cognome: "",
              dataNascita: "",
              gara: false
            }
          };

        },
        error: (error) => {
          this.router.navigate(['start']);
        }
      }
    )
  }

  get intestatarioFormControl() {
    return this.intestatario.controls;
  }

  isStepCompleted(step: string) {
    switch (step) {
      case "Intestatario prenotazione":
        return this.intestatario.valid;
      case "Altri ospiti":
        return this.isAllSubStepsCompleted();
      case "Carica documenti":
        return this.allFilesUploaded();
      default:
        return true;
    }

  }

  isSubStepCompleted(n: number) {
    const nomeECognome = this.nomiECognomi[n].nome && this.nomiECognomi[n].nome !== '' && this.nomiECognomi[n].cognome && this.nomiECognomi[n].cognome !== '';
    if (this.nomiECognomi[n].gara) {
      return this.nomiECognomi[n].tShirt && nomeECognome;
    }
    return nomeECognome;
  }

  isAllSubStepsCompleted() {
    if (!this.intestatario.valid) return false;
    for (let i = 0; i < this.totalPeople - 1; i++) {
      if (!this.isSubStepCompleted(i)) {
        return false;
      }
    }
    return true;
  }

  allFilesUploaded() {
    const allDocs = this.nomiECognomi.every(nc => nc.doc && nc.doc?.size > 0);
    return this.docIntestatario?.size > 0 && allDocs;
  }

  selectFile(event: any, index: number, retro: boolean = false) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];

      const contentType = file.type;

      if (!file || file.size === 0 || file.size >= 7000000 || !isValidContent(contentType)) {
        this.nomiECognomi[index].doc = undefined;
        alert("File non valido");
        return;
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Use a regex to remove data url part
          let base64String = reader.result as string;
          base64String = base64String.replace('data:', '').replace(/^.+,/, '');

          if (index === -2) {
            this.moduloIscrizione = {
              content: base64String,
              name: file.name,
              extension: file.name.split(".").pop() || "",
              contentType: contentType,
              completeFile: file,
              size: "" + file.size
            }
          } else if (index === -1) {

            if(retro) {
              this.docIntestatario_1 = {
                content: base64String,
                name: file.name,
                extension: file.name.split(".").pop() || "",
                contentType: contentType,
                completeFile: file,
                size: "" + file.size
              }
            } else {
              this.docIntestatario = {
                content: base64String,
                name: file.name,
                extension: file.name.split(".").pop() || "",
                contentType: contentType,
                completeFile: file,
                size: "" + file.size
              }
            }
            
          } else {

            if(retro) {
              this.nomiECognomi[index].doc_1 = {
                content: base64String,
                name: file.name,
                extension: file.name.split(".").pop() || "",
                contentType: contentType,
                completeFile: file,
                size: "" + file.size
              };
            } else {
              this.nomiECognomi[index].doc = {
                content: base64String,
                name: file.name,
                extension: file.name.split(".").pop() || "",
                contentType: contentType,
                completeFile: file,
                size: "" + file.size
              };
            }
            
          }

        };
        reader.readAsDataURL(file);
      }

    } else {
      this.nomiECognomi[index].doc = undefined;
    }
  }

  public exportPDF() {
    const pdfTable = document.getElementById("firstPageMultiple") as HTMLElement;
    const pdfTable2 = document.getElementById("secondPageMultiple") as HTMLElement;
    const pdfTable3 = document.getElementById("thirdPageMultiple") as HTMLElement;
    this.generatePDF(pdfTable, true);
    this.generatePDF(pdfTable2, true);
    this.generatePDF(pdfTable3, false);

    const defaultStyle = {
      fontSize: 11,
      alignment: 'justify'
    }
    const documentDefinition: any = { pageOrientation: 'portrait', pageSize: 'A4', content: this.allPDF, defaultStyle };
    pdfMake.createPdf(documentDefinition).download('Modulo Iscrizione Gara.pdf');
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

  sendMail() {
    const subject = "Iscrizione GARA MULTIPLA compilata da: " + this.intestatario.value['nome'] + " " + this.intestatario.value['cognome'];
    const recipients = ['fortesting.lc@gmail.com', 'campusscherma@gmail.com'];
    const isForGara = (user: any, isIntestatario: boolean) => {
      if (!isIntestatario && user.gara) {
        return ` che parteciperà alla gara. Taglia Maglietta: ${user.tShirt}`
      } else if (isIntestatario && user['gara']) {
        return ` che parteciperà alla gara. Taglia Maglietta: ${user['tShirt']}`
      }
      return "";
    }

    const mailRequests: MailRequest[] = this.nomiECognomi.map(user => {
      const fileName = user.doc?.name;
      const fo: FileObject = {
        filename: fileName + "." + user.doc?.extension,
        data: user.doc?.content,
        contentType: user.doc?.contentType || ""
      }

      const mailReq: MailRequest = {
        subject: subject,
        recipients: recipients,
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'iscrizione alla gara di Pizzo per le persone indicate.`}
        ${`Le persone collegate a questa richiesta, sono: ${this.nomiECognomi.map(u => u.nome + ' ' + u.cognome + ' - ')}.`}
        ${`In allegato il documento di: ${user.nome} ${user.cognome} ${isForGara(user, false)}`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Telefono: ${this.intestatario.value['telefono']}`}.
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
        files: [fo]
      }

      return mailReq;
    });

    const secondFiles: MailRequest[] = this.nomiECognomi.map(user => {
      const fileName = user.doc_1?.name;
      const fo: FileObject = {
        filename: fileName + "." + user.doc_1?.extension,
        data: user.doc_1?.content,
        contentType: user.doc_1?.contentType || ""
      }

      const mailReq: MailRequest = {
        subject: subject,
        recipients: recipients,
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'iscrizione alla gara di Pizzo per le persone indicate.`}
        ${`Le persone collegate a questa richiesta, sono: ${this.nomiECognomi.map(u => u.nome + ' ' + u.cognome + ' - ')}.`}
        ${`In allegato il documento (retro) di: ${user.nome} ${user.cognome} ${isForGara(user, false)}`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Telefono: ${this.intestatario.value['telefono']}`}.
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
        files: [fo]
      }

      return mailReq;
    });

    mailRequests.push(...secondFiles);

    const fileIntestatario: FileObject = {
      filename: this.docIntestatario.name + "." + this.docIntestatario?.extension,
      data: this.docIntestatario?.content,
      contentType: this.docIntestatario?.contentType || ""
    }
    mailRequests.push(
      {
        subject: subject,
        recipients: recipients,
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'iscrizione alla gara di Pizzo per le persone indicate.`}
        ${`Le persone collegate a questa richiesta, sono: ${this.nomiECognomi.map(u => u.nome + ' ' + u.cognome + ' - ')}.`}
        ${`In allegato il documento di: ${this.intestatario.value['nome']} ${this.intestatario.value['cognome']} ${isForGara(this.intestatario.value, false)}`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Telefono: ${this.intestatario.value['telefono']}`}.
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
        files: [fileIntestatario]
      }
    );

    const fileIntestatario_1: FileObject = {
      filename: this.docIntestatario_1.name + "." + this.docIntestatario_1?.extension,
      data: this.docIntestatario_1?.content,
      contentType: this.docIntestatario_1?.contentType || ""
    }
    mailRequests.push(
      {
        subject: subject,
        recipients: recipients,
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'iscrizione alla gara di Pizzo per le persone indicate.`}
        ${`Le persone collegate a questa richiesta, sono: ${this.nomiECognomi.map(u => u.nome + ' ' + u.cognome + ' - ')}.`}
        ${`In allegato il documento (retro) di: ${this.intestatario.value['nome']} ${this.intestatario.value['cognome']} ${isForGara(this.intestatario.value, false)}`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Telefono: ${this.intestatario.value['telefono']}`}.
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
        files: [fileIntestatario_1]
      }
    );

    const fileModuloIscrizione: FileObject = {
      filename: this.moduloIscrizione.name + "." + this.moduloIscrizione?.extension,
      data: this.moduloIscrizione?.content,
      contentType: this.moduloIscrizione?.contentType || ""
    }
    mailRequests.push(
      {
        subject: subject,
        recipients: recipients,
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'iscrizione alla gara di Pizzo per le persone indicate.`}
        ${`Le persone collegate a questa richiesta, sono: ${this.nomiECognomi.map(u => u.nome + ' ' + u.cognome + ' - ')}.`}
        ${`In allegato il modulo di iscrizione.`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Telefono: ${this.intestatario.value['telefono']}`}.
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
        files: [fileModuloIscrizione]
      }
    );

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
              this.mailSent[index] = false;
              this.mailError[index] = true;
            } else {
              this.mailSent[index] = true;
              this.mailError[index] = false;
            }
          },
          error: (err: any) => {
            console.log("ERROR", err);
            this.mailSent[index] = false;
            this.mailError[index] = true;
          },
          complete: () => {
            console.log("COMPLETE");
            if (index === mailRequests.length - 1) {
              this.sendingMail = false;
            }
          }
        }
      )

    });
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
