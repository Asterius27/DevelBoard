import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private tokenKey = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  public login(username: string, password: string): Observable<string> {
    return this.http.post(
      environment.apiUrl + '/user/login',
      {
        username: username,
        password: password,
      },
      { responseType: 'text' }
    ).pipe(tap(
      (data:any) => {
        localStorage.setItem(this.tokenKey, data.token);
      }
    ));
  }

  public register(username: string, email: string, password: string): Observable<string> {
    return this.http.post(
      environment.apiUrl + '/user/register',
      {
        username: username,
        email: email,
        password: password,
      },
      { responseType: 'text' }
    ).pipe(tap(
      (data:any) => {
        localStorage.setItem(this.tokenKey, data.token);
      }
    ));
  }

  public logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  public isLoggedIn(): boolean {
    let token = localStorage.getItem(this.tokenKey);
    return token != null && token.length > 0;
  }

  public getToken(): string | null {
    return this.isLoggedIn() ? localStorage.getItem(this.tokenKey) : null;
  }
}
