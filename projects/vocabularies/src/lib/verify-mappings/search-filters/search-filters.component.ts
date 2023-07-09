import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ConceptClassService } from '../../concept-class.service';
import { DomainService } from '../../domain.service';
import { VocabulariesService } from '../../vocabularies.service';
import { BehaviorSubject, Observable, combineLatest, filter, map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips'; 
import { Filter } from '@commonshcs-angular';
import { Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnDestroy {
  @ViewChild('autoConceptClass') autoConceptClass!: MatAutocomplete

  conceptClassOptions = new BehaviorSubject<string[]>([])
  domainOptions = new BehaviorSubject<string[]>([])
  vocabularyOptions = new BehaviorSubject<string[]>([])
  includeControl = new FormControl(true)
  conceptClassControl = new FormControl(
    '', 
  )
  domainControl = new  FormControl(
    '',
  )
  vocabularyControl = new FormControl(
    '',
  )
  form = new FormGroup({
    conceptClassControl: this.conceptClassControl,
    domainControl: this.domainControl,
    vocabularyControl: this.vocabularyControl,
    includeControl: this.includeControl,
  })
  filters = new BehaviorSubject({
    include: [] as Filter[],
    exclude: [] as Filter[],
  })
  operator = this.filters.pipe(
    map(fs => {
      if (fs.include.length > 0 && fs.exclude.length > 0) {
        return 'AND NOT'
      } else if (fs.exclude.length > 0) {
        return 'NOT'
      }
      return ''
    })
  )
  disabled = new BehaviorSubject(false)

  constructor(
    private conceptClassService: ConceptClassService,
    private domainService: DomainService,
    private vocabulariesService: VocabulariesService,
  ){}

  subscriptions = [

    combineLatest([
      this.conceptClassService.valueChanges().pipe(
        map(cs => cs?.filter(c => c.name).map(c => c.name!) ?? [])
      ),
      this.conceptClassControl.valueChanges.pipe(startWith(''), filter(v => v !== null))
    ]).pipe(
      map(([cs, v]) => this.search(cs, v!))
    ).subscribe(this.conceptClassOptions),

    combineLatest([
      this.domainService.valueChanges().pipe(
        map(ds => ds?.filter(d => d.name).map(d => d.name!) ?? [])
      ),
      this.domainControl.valueChanges.pipe(startWith(''), filter(v => v !== null))
    ]).pipe(
      map(([ds, v]) => this.search(ds, v!))
    ).subscribe(this.domainOptions),

    combineLatest([
      this.vocabulariesService.valueChanges().pipe(
        map(vs => vs?.filter(v => v.id).map(v => v.id!) ?? [])
      ),
      this.vocabularyControl.valueChanges.pipe(startWith(''), filter(v => v !== null))
    ]).pipe(
      map(([vs, v]) => this.search(vs, v!))
    ).subscribe(this.vocabularyOptions),

    this.disabled.subscribe(
      d => {
        if (d) {
          this.form.disable()
        } else {
          this.form.enable()
        }
      }
    )
  ]

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  search(options: string[], query: string) {
    const q = query.toLowerCase()
    return options.filter(o => o.toLowerCase().includes(q))  
  }

  addFilter(field: string, control: FormControl) {
    const f  = {
      column: field,
      value: control.value,
      keyword: true,
    }
    control.setValue('')
    const filters = this.filters.value
    if (this.includeControl.value) {
      if (this.filterIndex(filters.include, f) === -1) {
        filters.include.push(f)
      }
    } else {
      if (this.filterIndex(filters.exclude, f) === -1) {
        filters.exclude.push(f)
      }
    }
    this.filters.next(filters)
  }

  remove(k: 'include'|'exclude', v: Filter) {
    const fs = this.filters.value[k]
    const i = this.filterIndex(fs, v)
    fs.splice(i, 1)
    this.filters.value[k] = fs
    this.filters.next(this.filters.value)
  }

  filterIndex(fs: Filter[], v: Filter) {
    return fs.findIndex(f => f.column === v.column && f.value === v.value)
  }

  validOption(c: AbstractControl, options: BehaviorSubject<string[]>): Observable<boolean> {
    return options.pipe(
      map(os => os.includes(c.value))
    )
  }

  formatChip(f: Filter) {
    const m = {
      domainName: 'Domain',
      conceptClassName: 'Concept Class',
      vocabularyId: 'Vocabulary'
    } as any
    return `${m[f.column!]} : ${f.value}`
  }

}

