import { Component, Inject, Input, OnInit, OnChanges} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'app-chart-settings-dialog',
    templateUrl: './chart-settings-dialog.component.html',
    styleUrls: ['./chart-settings-dialog.component.css']
})
export class ChartSettingsDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ChartSettingsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onCancelClick(): void {
        this.dialogRef.close();
    }
}
