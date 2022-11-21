import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public challenges_c1:{title: string, language: string, expireDate: {}}[] = [];
  public challenges_c2:{title: string, language: string, expireDate: {}}[] = [];
  public challenges_c3:{title: string, language: string, expireDate: {}}[] = [];

  constructor(public router: Router, private c: ChallengesService) {} // TODO timers for challenges

  ngOnInit(): void {
    this.load_challenges();
  }

  load_challenges() {
    this.c.getChallenges({}).subscribe({ // TODO add filter
      next: (data) => {
        // console.log(data) // title, expireDate, language
        for (let i = 0; i < data.length; i++) {
          if (i % 3 === 0) {
            this.challenges_c1.push(data[i]);
          }
          if (i % 3 === 1) {
            this.challenges_c2.push(data[i]);
          }
          if (i % 3 === 2) {
            this.challenges_c3.push(data[i]);
          }
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

}
