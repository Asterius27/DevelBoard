import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  public errmessage = "";
  public user = {username: '', name: '', surname: '', mail: '', password: ''};
  constructor(private router: Router) {}

  ngOnInit(): void {}

  post_user() {} // TODO

}
