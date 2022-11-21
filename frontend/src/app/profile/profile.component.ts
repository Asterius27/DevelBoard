import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: {[k: string]: any} = {}
  public str_percentage = "";
  public str_percentage_tot = "";

  constructor(private router: Router, private u: UsersService) {}

  ngOnInit(): void {
    this.load_user();
    this.load_stats();
  }

  load_user() {
    this.u.getLoggedUser().subscribe({
      next: (data) => {
        this.user = data;
        // console.log(data);
      }
    });
  }

  load_stats() {
    this.u.getLoggedUserStats().subscribe({
      next: (data) => {
        let temp = 100 - data.percentage;
        this.str_percentage = data.percentage + "%";
        this.str_percentage_tot = temp + "%";
        // console.log(this.str_percentage_tot);
      }
    });
  }

  edit_profile() {
    this.router.navigate(['/editprofile']);
  }

}
