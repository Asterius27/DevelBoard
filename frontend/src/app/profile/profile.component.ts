import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { LeaderboardsService } from '../leaderboards.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: {[k: string]: any} = this.auth.getUser();
  public str_percentage = "";
  public str_percentage_tot = "";

  constructor(private router: Router, private auth: AuthenticationService, private l: LeaderboardsService) {}

  ngOnInit(): void {
    this.load_stats();
  }

  load_stats() {
    this.l.getUserStats().subscribe({
      next: (data) => {
        let temp = 100 - Math.round(data.percentage);
        this.str_percentage = Math.round(data.percentage) + "%";
        this.str_percentage_tot = temp + "%";
        // console.log(this.str_percentage_tot);
      }
    });
  }

  edit_profile() {
    this.router.navigate(['/editprofile']);
  }

}
