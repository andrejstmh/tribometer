import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WorkshopComponent } from './components/workshop/workshop.component';
import { CalibrCurveComponent } from './components/calibr-curve/calibr-curve.component';
import { TribControlsComponent } from './components/trib-controls/trib-controls.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ShowErrorsComponent } from './components/show-errors.component';
import { SettingsFormComponent } from './components/settings/settings-form/settings-form.component';

import { SocketService } from './services/socket.service';
import { SygnalsService } from './services/sygnals.service';
import { ChartService } from './services/chart.service';
import { TabulatorTableComponent } from './components/controls/tabulator-table/tabulator-table.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SettingsComponent,
    WorkshopComponent,
    CalibrCurveComponent,
    NotFoundComponent,
    ShowErrorsComponent,
    SettingsFormComponent,
    TabulatorTableComponent,
    TribControlsComponent
  ],
  imports: [
    HttpClientModule, BrowserModule, ReactiveFormsModule, FormsModule, ChartsModule,
    AppRoutingModule
  ],
    providers: [SocketService, SygnalsService, ChartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
