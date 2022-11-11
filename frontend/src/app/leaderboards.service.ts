import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardsService {

  constructor(private http: HttpClient) {}

  public getLeaderboard(id: string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/leaderboard/' + id, // TODO change it
      { responseType: 'text' }
    );
  }
}
