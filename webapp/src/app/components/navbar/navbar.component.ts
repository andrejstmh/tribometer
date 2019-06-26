import { Component, OnInit } from '@angular/core';
import { SignalsService, CalibrationCurve, trTotalState } from './../../services/signals.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  appLogo = require("../../../assets/bearing.png");
    constructor(public signalsService: SignalsService) { }

  ngOnInit() {
  }

}
