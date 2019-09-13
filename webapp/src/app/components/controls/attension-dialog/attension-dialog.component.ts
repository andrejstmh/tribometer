import { Component, Inject, Input, OnInit, OnChanges} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'app-attension-dialog',
    templateUrl: './attension-dialog.component.html',
    styleUrls: ['./attension-dialog.component.css']
})
export class AttensionDialogComponent {
    data: string = "OK";
    constructor(
        public dialogRef: MatDialogRef<AttensionDialogComponent>//,
        //@Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onCancelClick(): void {
        this.dialogRef.close();
    }
}
