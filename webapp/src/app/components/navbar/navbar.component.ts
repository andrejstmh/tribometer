import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  appLogo = require("../../../assets/bearing.png");
  constructor() { }

  ngOnInit() {
  }

}
