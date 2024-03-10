import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { StepperComponent } from './stepper/stepper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MinorenneComponent } from './minorenne/minorenne.component';
import { MaggiorenneComponent } from './maggiorenne/maggiorenne.component';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StartComponent } from './start/start.component';
import { WrapperComponent } from './wrapper/wrapper.component';
import { MultipleReservationComponent } from './multiple-reservation/multiple-reservation.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { UpdateDocumentsComponent } from './update-documents/update-documents.component';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    HomeComponent,
    HeaderComponent,
    StepperComponent,
    MinorenneComponent,
    MaggiorenneComponent,
    WrapperComponent,
    MultipleReservationComponent,
    UpdateDocumentsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    CdkAccordionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
