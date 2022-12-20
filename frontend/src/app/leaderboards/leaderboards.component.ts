import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LeaderboardsService } from '../leaderboards.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {

  public generalLeaderboard:{username: string, percentage: number}[] = [];
  public leaderboard:{username: string, percentage: number}[] = [];
  public math = Math;
  public tabs = 1;

  // TODO add input field to show leaderboard of a single selected challenge
  constructor(private l: LeaderboardsService, private renderer: Renderer2, @Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    this.load_leaderboards();
  }

  load_leaderboards() {
    this.l.getGeneralLeaderboard().subscribe({
      next: (data) => {
        // console.log(data);
        this.generalLeaderboard = data;
      }
    });

    this.l.getLeaderboard().subscribe({
      next: (data) => {
        // console.log(data);
        this.leaderboard = data;
      }
    });
  }

  setTabs(value:number, event:any) {
    let prev = this.doc.getElementsByClassName("previous-tab");
    this.renderer.removeClass(prev[0], "active");
    this.renderer.removeClass(prev[0], "previous-tab");
    this.renderer.addClass(event.target, "active");
    this.renderer.addClass(event.target, "previous-tab");
    this.tabs = value;
    event.preventDefault();
  }

  openProfile(user:any) {
    console.log(user);
    // TODO load user profile and show it
  }

}
