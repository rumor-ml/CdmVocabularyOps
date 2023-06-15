import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, StepperOrientation } from '@angular/material/stepper';
import { Observable, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DefineVocabulariesComponent } from './define-vocabularies/define-vocabularies.component';
import { VerifyMappingsComponent } from './verify-mappings/verify-mappings.component';

@Component({
  selector: 'app-vocabularies',
  standalone: true,
  imports: [
    DefineVocabulariesComponent,
    VerifyMappingsComponent,
    MatStepperModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './vocabularies.component.html',
  styleUrls: ['./vocabularies.component.css']
})
export class VocabulariesComponent {

  chooseVocabulariesFormGroup: FormGroup = new FormGroup({})
  verifyMapping: FormGroup = new FormGroup({})

  constructor(
    private breakpointObserver: BreakpointObserver,
  ){}
  
  stepperOrientation: Observable<StepperOrientation> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));
}
