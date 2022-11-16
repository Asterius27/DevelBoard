import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, private auth: AuthenticationService) {}

  ngOnInit(): void {}

  logout() {
    // TODO lock create challenge (it's only for admin)
    this.auth.logout();
  }

}
