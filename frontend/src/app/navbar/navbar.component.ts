import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public admin:Boolean = this.auth.isAdmin();
  constructor(private router: Router, private auth: AuthenticationService) {}

  ngOnInit(): void {}

  logout() {
    this.auth.logout();
  }

}
