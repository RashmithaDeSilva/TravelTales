import { Component, inject, OnInit, signal } from '@angular/core';
import { PostService } from '../services/post.service';
import { Post } from '../models/post.type';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.type';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  postService = inject(PostService);
  posts = signal<Array<Post>>([]);
  currentPage = 1;
  pageSize = 25;

  ngOnInit(): void {
    this.postService.getPost(this.currentPage, this.pageSize)
    .pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      })
    ).subscribe((response) => { 
      this.posts.set(response.data);
    });
  }

  // commentService = inject(CommentService);
  // activePostId: number | null = null;
  // comments: { [postId: number]: Comment[] } = {};
  // commentPage: { [postId: number]: number } = {};
  // newComment: { [postId: number]: string } = {};

  // toggleComments(postId: number) {
  //   if (this.activePostId === postId) {
  //     this.activePostId = null;
  //   } else {
  //     this.activePostId = postId;
  //     this.loadComments(postId, 1);
  //   }
  // }

  // loadComments(postId: number, page: number) {
  //   this.commentService.getComments(postId, page, 25).pipe(
  //     catchError((error) => {
  //       console.log(error);
  //       throw error;
  //     })
  //   ).subscribe({
  //     next: (data) => {
  //       if (!this.comments[postId]) this.comments[postId] = [];
  //       this.comments[postId] = [...this.comments[postId], ...data];
  //       this.commentPage[postId] = page;
  //     }
  //   });
  // }

  // onCommentScroll(event: any, postId: number) {
  //   const element = event.target;
  //   if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
  //     const nextPage = (this.commentPage[postId] || 1) + 1;
  //     this.loadComments(postId, nextPage);
  //   }
  // }

  // submitComment(postId: number) {
  //   const content = this.newComment[postId];
  //   if (!content?.trim()) return;
  //   // Implement submit logic (POST to server), then:
  //   this.comments[postId].unshift({
  //     postId,
  //     userId: 0, // set actual userId
  //     userName: 'You',
  //     content,
  //     createdAt: new Date().toISOString(),
  //     id: Math.floor(Math.random() * 1000000)
  //   });
  //   this.newComment[postId] = '';
  // }
}
