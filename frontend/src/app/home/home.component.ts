import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public router: Router, private c: ChallengesService) {} // TODO timers for challenges

  ngOnInit(): void {
    this.load_challenges();
  }

  load_challenges() {
    this.c.getChallenges({}).subscribe({ // TODO add filter
      next: (data) => {
        // TODO load the challenges
      }
    });
  }

}
