import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { ChartsModule } from 'ng2-charts';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { MatButtonModule, MatCheckboxModule } from '@angular/material';
//import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ExperimentComponent } from './components/experiment/experiment.component';
import { CalibrCurveComponent } from './components/calibr-curve/calibr-curve.component';
import { TribControlsComponent } from './components/trib-controls/trib-controls.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ShowErrorsComponent } from './components/show-errors.component';

//import { SocketService } from './services/socket.service';
import { SignalsService } from './services/signals.service';
import { ChartService } from './services/chart.service';
import { TabulatorTableComponent } from './components/controls/tabulator-table/tabulator-table.component';
import { StatusRowComponent } from './components/controls/status-row/status-row.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SettingsComponent,
    ExperimentComponent,
    CalibrCurveComponent,
    NotFoundComponent,
    ShowErrorsComponent,
    //SettingsFormComponent,
    TabulatorTableComponent,
    StatusRowComponent,
    TribControlsComponent
  ],
    imports: [
        //BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatAutocompleteModule,
        HttpClientModule, BrowserModule, ReactiveFormsModule, FormsModule, ChartsModule,
        AppRoutingModule
  ],
    providers: [SignalsService, ChartService],//SocketService,
  bootstrap: [AppComponent]
})
export class AppModule { }
