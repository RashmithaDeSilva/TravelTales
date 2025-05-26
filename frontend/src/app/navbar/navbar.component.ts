import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { UserStatusService } from '../services/user-status.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CsrfTokenService } from '../services/csrf-token.service';
import { environment } from '../../../configs/environment';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userOnline = false;
  private statusSub?: Subscription;

  private userStatusService = inject(UserStatusService);
  private csrfService = inject(CsrfTokenService);
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.statusSub = this.userStatusService.userStatus$.subscribe(status => {
      this.userOnline = status;
    });
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
  }

  logout() {
    console.log('Logout clicked');

    this.csrfService.getCstfToken().subscribe({
      next: (res) => {
        const csrfToken = res.data?.CSRF_Token;
        if (!csrfToken) {
          console.error('CSRF token missing in response');
          return;
        }

        this.http.post(`${environment.API_GATEWAY}/auth/logout`, {
          _csrf: csrfToken
        }, {
          withCredentials: true
        }).subscribe({
          next: () => {
            this.userStatusService.setUserStatus(false); // Optional method if defined
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Logout failed:', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to get CSRF token:', err);
      }
    });
  }

}
