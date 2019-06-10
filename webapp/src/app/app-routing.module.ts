import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './components/settings/settings.component';
import { SettingsFormComponent } from './components/settings/settings-form/settings-form.component';
import { WorkshopComponent } from './components/workshop/workshop.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CalibrCurveComponent } from './components/calibr-curve/calibr-curve.component';

const routes: Routes = [
  //{ path: "", component: SettingsComponent, data: { title: "Settings" } },
  { path: "", component: SettingsFormComponent, data: { title: "Settings" } },
  { path: "calibr", component: CalibrCurveComponent, data: { title: "Calibration curves" } },
  { path: "settings", component: SettingsComponent, data: { title: "Settings" } },
  { path: "workshop", component: WorkshopComponent, data: { title: "Workshop" } },
  { path: "home", redirectTo: "/", pathMatch: "full" },
  { path: "**", component: NotFoundComponent, data: { title: "Lapa nav atrasta" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
