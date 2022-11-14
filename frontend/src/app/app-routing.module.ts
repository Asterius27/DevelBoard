import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { EditorComponent } from './editor/editor.component';
import { HomeComponent } from './home/home.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { CreateChallengeComponent } from './create-challenge/create-challenge.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'editor', component: EditorComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'leaderboards', component: LeaderboardsComponent, canActivate: [AuthGuard]},
  {path: 'editprofile', component: EditProfileComponent, canActivate: [AuthGuard]},
  {path: 'createchallenge', component: CreateChallengeComponent} // canActivate: [AuthGuard]
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
