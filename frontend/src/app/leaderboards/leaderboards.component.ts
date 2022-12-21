import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LeaderboardsService } from '../leaderboards.service';
import { ChallengesService } from '../challenges.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {

  public generalLeaderboard:{username: string, email:string, percentage: number}[] = [];
  public leaderboard:{username: string, email:string, percentage: number}[] = [];
  public challengeLeaderboard:{username: string, email:string, percentage: number}[] = [];
  public challenges:{expireDate: any, language: string, title: string}[] = [];
  public title:string = "";
  public math = Math;
  public tabs = 1;

  constructor(private l: LeaderboardsService, private c: ChallengesService, private u: UsersService, private renderer: Renderer2, @Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    this.load_leaderboards();
    this.load_challenges();
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

  load_challenges() {
    this.c.getAllChallenges().subscribe({
      next: (data) => {
        this.challenges = data;
      }
    })
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
    this.u.getUser(user.email).subscribe({
      next: (data) => {
        console.log(data)
        // TODO load user profile and show it
      }
    })
  }

  load_challenge_leaderboard(title1: string, title2: string) {
    if (title1 !== "") {
      this.title = title1;
      this.l.getChallengeLeaderboard(this.title).subscribe({
        next: (data) => {
          this.challengeLeaderboard = data;
        }
      })
    } else {
      if (title2 !== "") {
        this.c.getChallenge(title2).subscribe({
          next: (data) => {
            if (data.title !== "no challenge found") {
              this.title = data.title
              this.l.getChallengeLeaderboard(this.title).subscribe({
                next: (data) => {
                  this.challengeLeaderboard = data;
                }
              })
            } else {
              console.log("No challenge found!")
            }
          }
        })
      }
    }
  }

}
