import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './start/start.component';
import { HomeComponent } from './home/home.component';
import { MultipleReservationComponent } from './multiple-reservation/multiple-reservation.component';
import { UpdateDocumentsComponent } from './update-documents/update-documents.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  /*{
    path: '**',
    redirectTo: 'start',
    pathMatch: 'full',
  },*/
  {
    path: 'start',
    component: StartComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'reservations',
    component: MultipleReservationComponent
  },
  {
    path: 'upload-docs',
    component: UpdateDocumentsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
