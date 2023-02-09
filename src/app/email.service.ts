import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private url = ""
  constructor(private http: HttpClient) { }

  sendEmail(input: any) {
    this.http.post(this.url, input).subscribe(
      (ok) => {
        console.log(ok);
      }
    )
  }
}
