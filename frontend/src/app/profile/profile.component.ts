import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { LeaderboardsService } from '../leaderboards.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: {[k: string]: any} = this.auth.getUser();
  public str_percentage = "";
  public str_percentage_tot = "";
  public str_general_percentage = "";
  public str_general_percentage_tot = "";
  public hideEditBtn = false;

  constructor(private router: Router, private auth: AuthenticationService, private l: LeaderboardsService, private u: UsersService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    let email = this.route.snapshot.paramMap.get('email');
    if (email !== null && email !== "") {
      this.hideEditBtn = true;
      this.u.getUser(email).subscribe({
        next: (data) => {
          this.user = data;
          this.load_stats();
        }
      })
    } else {
      this.hideEditBtn = false;
      this.load_stats();
    }
    this.route.params.subscribe(params => {
      let email = params['email'];
      if (email && email !== null && email !== "") {
        this.hideEditBtn = true;
        this.u.getUser(email).subscribe({
          next: (data) => {
            this.user = data;
            this.load_stats();
          }
        })
      } else {
        this.hideEditBtn = false;
        this.user = this.auth.getUser();
        this.load_stats();
      }
    })
  }

  load_stats() {
    this.l.getUserStats(this.user['email']).subscribe({
      next: (data) => {
        if (data.percentage) {
          let temp = 100 - Math.round(data.percentage);
          this.str_percentage = Math.round(data.percentage) + "%";
          this.str_percentage_tot = temp + "%";
        } else {
          this.str_percentage = "0%";
          this.str_percentage_tot = "100%";
        }
      }
    });

    this.l.getGeneralUserStats(this.user['email']).subscribe({
      next: (data) => {
        if (data.percentage) {
          let temp = 100 - Math.round(data.percentage);
          this.str_general_percentage = Math.round(data.percentage) + "%";
          this.str_general_percentage_tot = temp + "%";
        } else {
          this.str_general_percentage = "0%";
          this.str_general_percentage_tot = "100%";
        }
      }
    })
  }

  edit_profile() {
    this.router.navigate(['/editprofile']);
  }

}
