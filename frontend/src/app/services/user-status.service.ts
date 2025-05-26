import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { StandardResponse } from '../models/response.type';
import { environment } from '../../../configs/environment';

@Injectable({
  providedIn: 'root',
})
export class UserStatusService {
  private userStatusSubject = new BehaviorSubject<boolean>(false);
  userStatus$ = this.userStatusSubject.asObservable();

  private apiUrl = `${environment.API_GATEWAY}/user/status`;

  constructor(private http: HttpClient) {
    // Call checkUserStatus every 5 seconds
    interval(5000)
      .pipe(
        switchMap(() => this.checkUserStatus())
      )
      .subscribe(
        (status) => this.userStatusSubject.next(status),
        (error) => {
          // console.error('Error fetching user status', error);
          this.userStatusSubject.next(false); // or handle error as needed
        }
      );
  }

  private checkUserStatus() {
    return this.http.get<StandardResponse>(this.apiUrl, { withCredentials: true }).pipe(
      switchMap(response => {
        return new BehaviorSubject(response.status);
      })
    );
  }

  setUserStatus(status: boolean): void {
    this.userStatusSubject.next(status);
  }

  getCurrentStatus(): boolean {
    return this.userStatusSubject.value;
  }
}
