import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export const availableFileContent = ["pdf", "tiff", "jpg", "jpeg", "png"];

export const isValidContent = (contentType: string) : boolean => {
  if(!contentType || contentType === '') return false;
  for(let i = 0; i<availableFileContent.length; i++) {
    if(contentType.toLowerCase().includes(availableFileContent[i])) return true;
  }
  return false;
}

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
