// comment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../configs/environment';
import { Comment } from '../models/comment.type';
import { StandardResponse } from '../models/response.type';

@Injectable({ providedIn: 'root' })
export class CommentService {
  http = inject(HttpClient);

  getComments(postId: number, page: number, size: number) {
    const url = `${environment.API_GATEWAY}/comment?postId=${postId}&page=${page}&size=${size}`;
    return this.http.get<StandardResponse>(url);
  }
}
