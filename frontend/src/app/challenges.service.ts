import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChallengesService {

  constructor(private http: HttpClient) {}

  public getChallenge(title: string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/challenges/title/' + title,
      { responseType: 'json' }
    );
  }

  public getChallenges(params = {}): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/challenges',
      { 
        responseType: 'json', 
        params: new HttpParams({fromObject: params}) 
      }
    );
  }

  public getAllChallenges(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/challenges/all',
      { responseType: 'json' }
    );
  }

  public submitCode(code: string, language: string, title: string): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/evaluate',
      {
        code: code,
        language: language,
        title: title
      },
      { responseType: 'json' }
    );
  }

  public createChallenge(title: string, description: string, language: string, testCases: string, resultCases: string, expireDate: any): Observable<any> {
    return this.http.post(
      environment.apiUrl + '/challenges',
      {
        title: title,
        description: description,
        language: language,
        testCases: testCases,
        resultCases: resultCases,
        expireDate: expireDate
      },
      { responseType: 'text' }
    );
  }
}
