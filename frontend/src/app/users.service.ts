import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {}

  public getUser(email:string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/users/' + email,
      { responseType: 'json' }
    );
  }

  public editUser(email: string, password: string, name: string, username: string, surname: string): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/users/',
      {
        email: email,
        password: password, 
        name: name,
        username: username,
        surname: surname
      },
      { responseType: 'text' }
    );
  }

}
