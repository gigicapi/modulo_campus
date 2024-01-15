import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface FileObject {
  filename: string;
  contentType: string;
  data: any;
}
export interface MailRequest {
  recipients: string[];
  subject: string;
  mailText: string;
  files: FileObject[];
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private url = "https://pythonurl.pythonanywhere.com/sendmail"
  constructor(private http: HttpClient) { }

  sendEmail(input: MailRequest): Observable<any> {
    return this.http.post(this.url, input);
  }
}
