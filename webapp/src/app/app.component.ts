import { Component } from '@angular/core';
import { listener } from '@angular/core/src/render3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appLogo = require("./../assets/bearing.png");
  title = 'Tribometer';

  //getStatus => serverStatusInformation
  //if listenening{
  //  schow currtent values
  //}else{
  //  setting form
  //}

}
