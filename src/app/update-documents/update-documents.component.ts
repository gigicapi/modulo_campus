import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../shared.service';
import { EmailService, FileObject, MailRequest } from '../email.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-documents',
  templateUrl: './update-documents.component.html',
  styleUrls: ['./update-documents.component.scss']
})
export class UpdateDocumentsComponent implements OnInit {

  intestatario!: FormGroup;

  sendingMail: boolean = false;
  mailSentWithoutError: boolean = false;
  mailSent: { [index: number]: boolean } = {};
  mailError: { [index: number]: boolean } = {};

  totalMails: number = 0;

  attachmentsDict: { [key: string]: any[] } = {};

  constructor(private _formBuilder: FormBuilder, private shared: SharedService, private emailService: EmailService, private http: HttpClient) {
    this.intestatario = this._formBuilder.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      campus: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  get intestatarioFormControl() {
    return this.intestatario.controls;
  }

  atLeastOneDoc() {
    return Object.keys(this.attachmentsDict).length > 0;
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
        };
        reader.readAsDataURL(file);
      }

    } else {
      delete this.attachmentsDict[key];
    }
  }

  sendMail() {
    const subject = "AGGIORNAMENTO documento per: " + this.intestatario.value['nome'] + " " + this.intestatario.value['cognome'];

    const mailRequests: MailRequest[] = Object.keys(this.attachmentsDict).map(fileName => {
      const fo: FileObject = {
        filename: fileName + "." + this.attachmentsDict[fileName][1],
        data: this.attachmentsDict[fileName][0],
        contentType: this.attachmentsDict[fileName][5]
      }

      const mailReq: MailRequest = {
        subject: subject,
        recipients: ['fortesting.lc@gmail.com', 'campusscherma@gmail.com'],
        mailText: `
        ${`L'utente che ha inviato questa mail (${this.intestatario.value['nome']} ${this.intestatario.value['cognome']}), ha richiesto l'aggiornamento dei documenti.`}
        ${`${this.intestatario.value['nome']} ${this.intestatario.value['cognome']} ha dichiarato di essersi iscritto al campus di ${this.intestatario.value['campus']}.`}
        ${`Questa mail è stata inviata dalla mail: ${this.intestatario.value['email']}.`}
        ${`Questa mail è stata generata automaticamente. Si prega di non rispondere.`}`,
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
