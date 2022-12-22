import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  public errmessage = "";
  public user = {username: '', name: '', surname: '', email: '', password: ''};
  constructor(private u: UsersService, private auth: AuthenticationService) {}

  ngOnInit(): void {}

  post_user() {
    this.u.editUser(this.user.email, this.user.password, this.user.name, this.user.username, this.user.surname).subscribe({
      next: (data) => {
        this.auth.logout();
      }
    })
  }

}
