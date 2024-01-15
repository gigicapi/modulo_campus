import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './start/start.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [

  {
    path: '',
    component: StartComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
