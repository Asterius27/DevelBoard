import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChallengesService {

  constructor(private http: HttpClient) {}

  public getChallenge(id: string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/requestChallenge/' + id, // TODO change it
      { responseType: 'text' }
    );
  }

  public getChallenges(params = {}): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/requestChallenge/filter', // TODO change it
      { 
        responseType: 'text', 
        params: new HttpParams({fromObject: params}) 
      }
    );
  }

  public submitCode(code: string, language: string): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/sendCode', // TODO change it
      {
        code: code,
        language: language
      },
      { responseType: 'text' }
    );
  }

  public createChallenge(description: string, language: string, testCases: string, expireDate: string): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/createChallenge', // TODO change it
      {
        description: description,
        language: language,
        testCases: testCases,
        expireDate: expireDate
      },
      { responseType: 'text' }
    );
  }
}
