import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { EditorComponent } from './editor/editor.component';
import { HomeComponent } from './home/home.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'}, // TODO modify it
  {path: 'home', component: HomeComponent},
  {path: 'editor', component: EditorComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'leaderboards', component: LeaderboardsComponent},
  {path: 'editprofile', component: EditProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
