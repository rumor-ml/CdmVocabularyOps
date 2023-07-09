import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';  
import { MatIconModule } from '@angular/material/icon';  
import { MatTooltipModule } from '@angular/material/tooltip';  
import { MatButtonModule } from '@angular/material/button';  
import { MatProgressBarModule } from '@angular/material/progress-bar';  
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Input } from '@angular/core';
import { Vocabulary } from '../../vocabularies.service';
import { SearchFiltersComponent } from '../search-filters/search-filters.component';
import { AfterViewInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewChild } from '@angular/core';
import { SmartSearchService } from '../../smart-search.service';
import { ErrorHandler } from '@angular/core';


@Component({
  selector: 'app-smart-search',
  standalone: true,
  imports: [
    SearchFiltersComponent,
    MatProgressBarModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './smart-search.component.html',
  styleUrls: ['./smart-search.component.css']
})
export class SmartSearchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('guessConceptFilters') guessConceptFilters!: SearchFiltersComponent

  @Input() vocabulary?: Vocabulary|null

  constructor(
    private route: ActivatedRoute,
    private smartSearchService: SmartSearchService,
    private errorHandler: ErrorHandler,
  ) {}

  strategyFormControl = new FormControl('None')
  inProgress = false
  status = new BehaviorSubject('')

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(
        ps => {
          const strategy = ps.get('strategy')
          if (strategy) {
            setTimeout(() => this.strategyFormControl.setValue(strategy))
          }
        }
      )
    )
  }

  subscriptions: Subscription[] = []

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  guessConcepts() {
    if (!this.vocabulary?.id) {
      this.errorHandler.handleError('Expected vocabulary ID to always be defined.')
      return
    }
    this.inProgress = true
    this.guessConceptFilters.disabled.next(true)
    this.smartSearchService.queueSearch(this.vocabulary.id).subscribe({
      next: s => this.status.next(s),
      complete: () => {
        this.inProgress = false
        this.guessConceptFilters.disabled.next(false)
      }
    })
  }
}
