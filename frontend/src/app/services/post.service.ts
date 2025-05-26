import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../configs/environment';
import { StandardResponse } from '../models/response.type';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  http = inject(HttpClient);

  getPost(page: number, size: number) {
    const url = `${environment.API_GATEWAY}/post/?page=${page}&size=${size}`;
    return this.http.get<StandardResponse>(url);
  }
}
