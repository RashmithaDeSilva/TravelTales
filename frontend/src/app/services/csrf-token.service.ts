import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../configs/environment';
import { StandardResponse } from '../models/response.type';



@Injectable({
  providedIn: 'root'
})
export class CsrfTokenService {
  http = inject(HttpClient);

  getCstfToken() {
    const url = `${environment.API_GATEWAY}/csrf-token`;
    return this.http.get<StandardResponse>(url);
  }
}
