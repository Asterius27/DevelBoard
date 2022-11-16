import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private tokenKey = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  public login(username: string, password: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa(username + ':' + password),
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
        console.log("The token is: " + data.token)
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
