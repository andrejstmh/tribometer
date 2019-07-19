import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './components/settings/settings.component';
import { ExperimentComponent } from './components/experiment/experiment.component'; 
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CalibrCurveComponent } from './components/calibr-curve/calibr-curve.component';
import { TribControlsComponent } from './components/trib-controls/trib-controls.component';
const routes: Routes = [
    { path: "calibr", component: CalibrCurveComponent, data: { title: "Calibration curves" } },
    { path: "controls", component: TribControlsComponent, data: { title: "Controls" } },
    { path: "settings", component: SettingsComponent, data: { title: "Settings" } },
    { path: "experiment", component: ExperimentComponent, data: { title: "Workshop" } },
    { path: "", redirectTo: "settings", pathMatch: "full" },
    { path: "**", component: NotFoundComponent, data: { title: "Page not found" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
