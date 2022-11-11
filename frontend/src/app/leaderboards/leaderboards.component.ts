import { Component, OnInit } from '@angular/core';
import { LeaderboardsService } from '../leaderboards.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {

  constructor(private l: LeaderboardsService) {}

  ngOnInit(): void {
    this.load_leaderboard();
  }

  load_leaderboard() {
    this.l.getLeaderboard("id").subscribe({ // TODO change id
      next: (data) => {
        // TODO load the leaderboard
      }
    });
  }

}
