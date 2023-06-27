import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepper, MatStepperModule, StepperOrientation } from '@angular/material/stepper';
import { Observable, Subscription, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DefineVocabulariesComponent } from './define-vocabularies/define-vocabularies.component';
import { VerifyMappingsComponent } from './verify-mappings/verify-mappings.component';
import { ActivatedRoute } from '@angular/router';

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
export class VocabulariesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper

  chooseVocabulariesFormGroup: FormGroup = new FormGroup({})
  verifyMapping: FormGroup = new FormGroup({})
  customizeVocabulary: string|null = null

  constructor(
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
  ){}
  
  stepperOrientation: Observable<StepperOrientation> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));

  subscriptions: Subscription[] = [
  ]

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(
        ps => {
          setTimeout(() => {
            const s = ps.get('step')
            if (s) {
              if (s === 'Customize Mappings') {
                this.stepper!.selectedIndex = 1
              }
            }
          })
        }
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
  
}
