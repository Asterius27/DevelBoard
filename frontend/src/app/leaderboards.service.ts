import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardsService {

  constructor(private http: HttpClient) {}

  public getUserStats(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards/mycompleted',
      { responseType: 'json' }
    );
  }

  public getGeneralLeaderboard(): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboards',
      { responseType: 'json' }
    );
  }
}
