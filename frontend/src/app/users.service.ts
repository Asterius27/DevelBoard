import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {}

  public getLoggedUser(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/users',
      { responseType: 'json' }
    );
  }

  public getLoggedUserStats(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/users/stats',
      { responseType: 'json' }
    );
  }

}
