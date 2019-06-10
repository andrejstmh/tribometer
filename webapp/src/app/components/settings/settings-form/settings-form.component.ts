import { Component, OnInit } from '@angular/core';



export class ProgramPoint {
  constructor(
    public duration: number,
    public load: number,
    public RPM: number
  ) { }
}

export class ExperimentSettings {
  constructor(
    public user: string="",
    public bearing: string="",
    public outputFileName: string="results.h5",
    public workingDirectory: string ="/home/pi/tribometer/",
    public logFileName: string="log.txt",
    public totalDuration: number = 72,
    public program: ProgramPoint[]=[]
  ) { }
}


@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css']
})
export class SettingsFormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  powers = ['Really Smart', 'Super Flexible',
    'Super Hot', 'Weather Changer'];

  model = new ExperimentSettings();

  submitted = false;

  onSubmit() { this.submitted = true; }

  newHero() {
    this.model = new ExperimentSettings();
  }
}
