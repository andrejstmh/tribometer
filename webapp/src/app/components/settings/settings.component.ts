import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from './../../services/validators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

//  "workingDirectory": "",
//  "outputFileName": 'temp.h5',
//  "user": "",
//  "bearing": "",
//  "emailTo": [],
//  #[N]
//  "loadRegualtionAccuracy": 1,
//  # rotation per minute
//  "RPMRegualtionAccuracy": 1,
//  "frictionForceCalibrationCurveFile": 'FrictionForceCalibration.csv',
//  "loadCalibrationCurveFile": 'LoadCalibration.csv',
//  #[N]
//  "frictionForceTreshold": 10,
//  "temperatureTreshold": 100,
//  # seconds
//  "recordingInterval": 1,
//  # seconds
//  "visualisationInterval": 5,
//  # hours
//  "totalDuration": 72,

//	"programme": [{ "duration": 0.25, "load": 5, "RPM": 600 }, { "duration": 0.25, "load": 4, "RPM": 600 }],
//# optional field
//"readme": "UNITS: intervals[second]; duration[hour]; treshold,load[N]"

  profileForm = this.fb.group({
    user: ['', Validators.required],
    bearing: ['', Validators.required],
    address: this.fb.group({
      outputFileName: [''],
      workingDirectory: [''],
      logFileName: [''],
      
    }),
    totalDuration: [''],
    programme: this.fb.array([
      this.fb.group({
        duration: ['', Validators.required],
        RPM: ['', Validators.required],
        Load: ['', Validators.required]})
    ])
  });

  get programme() {
    return this.profileForm.get('programme') as FormArray;
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

  }

  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }

  addAlias() {
    this.programme.push(this.fb.control(''));
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
}
