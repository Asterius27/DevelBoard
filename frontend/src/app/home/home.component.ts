import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengesService } from '../challenges.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public challenges_c1:{title: string, language: string, expireDate: Date, timerSeconds: string, timerMinutes: string, timerHours: string, timerDays: string}[] = [];
  public challenges_c2:{title: string, language: string, expireDate: Date, timerSeconds: string, timerMinutes: string, timerHours: string, timerDays: string}[] = [];
  public challenges_c3:{title: string, language: string, expireDate: Date, timerSeconds: string, timerMinutes: string, timerHours: string, timerDays: string}[] = [];
  private timers:Subscription[] = [];

  constructor(public router: Router, private c: ChallengesService) {}

  ngOnInit(): void {
    this.load_challenges();
  }

  ngOnDestroy(): void {
    this.timers.forEach(x => x.unsubscribe());
  }

  load_challenges() {
    this.c.getChallenges({}).subscribe({ // TODO add filter
      next: (data) => {
        // console.log(data[0]) // title, expireDate, language
        for (let i = 0; i < data.length; i++) {
          let date = new Date(data[i].expireDate.year, data[i].expireDate.month - 1, data[i].expireDate.day, data[i].expireDate.hour, data[i].expireDate.minute);
          let challenge = {
            title: data[i].title,
            language: data[i].language,
            expireDate: date,
            timerSeconds: "00",
            timerMinutes: "00",
            timerHours: "00",
            timerDays: "00"
          }
          if (i % 3 === 0) {
            this.challenges_c1.push(challenge);
          }
          if (i % 3 === 1) {
            this.challenges_c2.push(challenge);
          }
          if (i % 3 === 2) {
            this.challenges_c3.push(challenge);
          }
          this.timers.push(interval(1000).subscribe(x => {this.timer(challenge)}));
        }
        // console.log(this.challenges_c1[0].expireDate);
        // console.log(this.challenges_c2);
        // console.log(this.challenges_c3);
      }
    });
  }

  load_editor(challenge:any, event:any) {
    event.preventDefault();
    // console.log(challenge['title']);
    this.router.navigate(['/editor', {title: challenge['title']}]);
  }

  private timer(challenge:any) {
    let timeDifference = challenge.expireDate - new Date().getTime();
    let seconds = Math.floor((timeDifference) / (1000) % 60);
    let minutes = Math.floor((timeDifference) / (1000 * 60) % 60);
    let hours = Math.floor((timeDifference) / (1000 * 60 * 60) % 24);
    if (seconds < 10) {
      challenge.timerSeconds = "0" + seconds;
    } else {
      challenge.timerSeconds = "" + seconds;
    }
    if (minutes < 10) {
      challenge.timerMinutes = "0" + minutes;
    } else {
      challenge.timerMinutes = "" + minutes;
    }
    if (hours < 10) {
      challenge.timerHours = "0" + hours;
    } else {
      challenge.timerHours = "" + hours;
    }
    challenge.timerDays = "" + Math.floor((timeDifference) / (1000 * 60 * 60 * 24));
  }

}
