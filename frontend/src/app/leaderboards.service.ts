import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardsService {

  constructor(private http: HttpClient) {}

  public getLeaderboard(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards/completed',
      { responseType: 'json' }
    );
  }

  public getUserStats(email:string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards/usercompleted/' + email,
      { responseType: 'json' }
    );
  }

  public getGeneralLeaderboard(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards',
      { responseType: 'json' }
    );
  }

  public getGeneralUserStats(email:string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards/user/' + email,
      { responseType: 'json' }
    );
  }

  public getChallengeLeaderboard(title:string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards/challenge/' + title,
      { responseType: 'json' }
    );
  }

}
