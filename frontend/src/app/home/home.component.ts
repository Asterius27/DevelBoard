import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public challenges = [];

  constructor(public router: Router, private c: ChallengesService) {} // TODO timers for challenges

  ngOnInit(): void {
    this.load_challenges();
  }

  load_challenges() {
    this.c.getChallenges({}).subscribe({ // TODO add filter
      next: (data) => {
        console.log(data) // title, expireDate language
        this.challenges = data; // TODO divide data in three columns
      }
    });
  }

  load_editor(challenge:any, event:any) {
    event.preventDefault();
    // console.log(challenge['title']);
    this.router.navigate(['/editor', {title: challenge['title']}]);
  }

}
