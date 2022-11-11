import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './profile/profile.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SignupComponent } from './signup/signup.component';
import { TokenInterceptor } from './token.interceptor';
import { AuthenticationService } from './authentication.service';
import { ChallengesService } from './challenges.service';
import { LeaderboardsService } from './leaderboards.service';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    NavbarComponent,
    ProfileComponent,
    LeaderboardsComponent,
    EditProfileComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: AuthenticationService, useClass: AuthenticationService},
    {provide: ChallengesService, useClass: ChallengesService},
    {provide: LeaderboardsService, useClass: LeaderboardsService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
