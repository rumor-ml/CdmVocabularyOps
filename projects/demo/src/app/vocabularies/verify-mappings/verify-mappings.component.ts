import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConceptMapping, ConceptMappingService } from '../concept-mapping.service';
import { TableDataSource } from '@commonshcs/docs';
import { VocabulariesService, Vocabulary } from '../vocabularies.service';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-verify-mappings',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './verify-mappings.component.html',
  styleUrls: ['./verify-mappings.component.css']
})
export class VerifyMappingsComponent implements OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ConceptMapping>;

  vocabularyControl = new FormControl('', [Validators.required, this.validVocabulary()])
  formGroup = new FormGroup({
    'vocabulary': this.vocabularyControl
  })
  formInProgress = false
  expanded: ConceptMapping | null = null
  displayedColumns: string[] = [
    'search',
    'conceptFrequency',
    'sourceCode',
    'sourceName',
    'similarityScore',
    'athenaConceptName',
    'athenaVocabularyId'
  ]
  get columnsToDisplayWithExpand() {
    return ['expand', ...this.displayedColumns]
  }
  count = this.conceptMappingService.count()
  dataSource!: TableDataSource<ConceptMapping>
  vocabularies = this.vocabulariesService.valueChanges({
    where: [['isSource', '==', true]]
  })
  vocabularyIds = new BehaviorSubject<string[]>([])
  
  constructor(
    private conceptMappingService: ConceptMappingService,
    private vocabulariesService: VocabulariesService,
  ){}

  subscriptions = [
    this.vocabularies.pipe(
      map(vs => (vs ?? []).map(v => v.id!))
    ).subscribe(this.vocabularyIds),
  ]

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  loadConcepts() {}

  searchConcepts(row: ConceptMapping) {}

  vocabularyString(vocabulary: Vocabulary) {
    const nameString = vocabulary.name ? ` - ${vocabulary.name}` : ''
    const versionString =  vocabulary.version ? ` - ${vocabulary.version}` : ''
    return `${vocabulary.id}${nameString}${versionString}`
  }

  toggleRow(row: ConceptMapping) {
    if (this.expanded?.id === row.id) {
      this.expanded = null
    } else {
      this.expanded = row
    }
  }

  validVocabulary(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.vocabularyIds?.value.includes(control.value) ? null : {invalidId: {value: control.value}}
    };
  }
}
