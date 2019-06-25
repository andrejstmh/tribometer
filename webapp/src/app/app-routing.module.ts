import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './components/settings/settings.component';
import { SettingsFormComponent } from './components/settings/settings-form/settings-form.component';
import { WorkshopComponent } from './components/workshop/workshop.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CalibrCurveComponent } from './components/calibr-curve/calibr-curve.component';
import { TribControlsComponent } from './components/trib-controls/trib-controls.component';
const routes: Routes = [
    { path: "settings1", component: SettingsFormComponent, data: { title: "Settings" } },
    { path: "calibr", component: CalibrCurveComponent, data: { title: "Calibration curves" } },
    { path: "controls", component: TribControlsComponent, data: { title: "Controls" } },
    { path: "settings", component: SettingsComponent, data: { title: "Settings" } },
    { path: "workshop", component: WorkshopComponent, data: { title: "Workshop" } },
    { path: "", redirectTo: "settings", pathMatch: "full" },
    { path: "**", component: NotFoundComponent, data: { title: "Lapa nav atrasta" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
