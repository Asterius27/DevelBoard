import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public tokenKey = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  public login(email: string, password: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa(email + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };
    return this.http.get(environment.apiUrl + '/login', options).pipe(tap(
      (data:any) => {
        localStorage.setItem(this.tokenKey, data.token);
      }
    ));
  }

  public register(username: string, email: string, password: string, name: string, surname: string, role: string): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/register',
      {
        email: email,
        password: password, 
        name: name,
        role: role,
        username: username,
        surname: surname
      },
      { responseType: 'json' }
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

  public getUser(): any {
    return jwtDecode(this.getToken()!);
  }

  public isAdmin(): Boolean {
    if (this.getUser().role === "ADMIN") {
      return true;
    }
    else {
      return false;
    }
  }
}
