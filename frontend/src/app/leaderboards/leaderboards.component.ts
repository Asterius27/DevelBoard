import { Component, OnInit } from '@angular/core';
import { LeaderboardsService } from '../leaderboards.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {

  public leaderboard:{username: string, percentage: number}[] = [];

  constructor(private l: LeaderboardsService) {}

  ngOnInit(): void {
    this.load_leaderboard();
  }

  load_leaderboard() {
    this.l.getGeneralLeaderboard().subscribe({
      next: (data) => {
        // console.log(data);
        this.leaderboard = data;
      }
    });
  }

}
