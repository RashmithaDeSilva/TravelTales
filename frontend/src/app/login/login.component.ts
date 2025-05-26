import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../configs/environment';
import { StandardResponse } from '../models/response.type';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.loading = true;
    this.errorMessage = null;

    const url = `${environment.API_GATEWAY}/login`;
    const body = { email: this.email, password: this.password };

    this.http.post<StandardResponse>(url, body, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.status) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.message || 'Login failed.';
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        this.loading = false;
      }
    });
  }
}
