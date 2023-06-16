import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VocabulariesService, Vocabulary } from '../../vocabularies.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-new-vocabulary',
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './new-vocabulary.component.html',
  styleUrls: ['./new-vocabulary.component.css']
})
export class NewVocabularyComponent {

  idControl = new FormControl('', Validators.required)
  nameControl = new FormControl('')
  referenceControl = new FormControl('')
  versionControl = new FormControl('')
  formGroup = new FormGroup({
    id: this.idControl,
    name: this.nameControl,
    reference: this.referenceControl,
    version: this.versionControl,
  })
  formInProgress = false

  constructor(
    public dialogRef: MatDialogRef<NewVocabularyComponent>,
    private vocabulariesService: VocabulariesService
  ) {}

  newVocabulary() {
    this.formInProgress = true
    this.formGroup.disable()
    const vocabulary: Vocabulary = {
      name: null,
      reference: null,
      version: null,
      conceptId: null,
      isSource: true,
    }
    if (this.nameControl.value && this.nameControl.value !== '') {
      vocabulary.name = this.nameControl.value
    }
    if (this.referenceControl.value && this.referenceControl.value !== '') {
      vocabulary.reference = this.referenceControl.value
    }
    if (this.versionControl.value && this.versionControl.value !== '') {
      vocabulary.version = this.versionControl.value
    }
    this.vocabulariesService.replaceById({
      id: this.idControl.value!,
      doc: vocabulary
    }).subscribe(
      _ => {
        this.dialogRef.close(this.idControl.value!)
        this.formGroup.reset()
        this.formGroup.enable()
        this.formInProgress = false
      }
    )
  }
  
}
