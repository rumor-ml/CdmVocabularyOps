import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, Table } from '../../profile.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { TableDataSource } from '@commonshcs/docs';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { VocabulariesService, Vocabulary } from '../vocabularies.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Mapping, MappingService, compositeId } from '../mapping.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewVocabularyComponent } from './new-vocabulary/new-vocabulary.component';
import * as Plot from "@observablehq/plot";
import * as d3 from 'd3'
import { StylesService } from '../../styles.service';
import { VocabularyQualityCheckService } from '../vocabulary-quality-check.service';

@Component({
  selector: 'app-define-vocabularies',
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
  templateUrl: './define-vocabularies.component.html',
  styleUrls: ['./define-vocabularies.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DefineVocabulariesComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Mapping>;
  @ViewChild(MatExpansionPanel) preview!: MatExpansionPanel;
  @ViewChild('previewPlot', {read: ElementRef}) previewPlot!: ElementRef

  vocabularyIds = new BehaviorSubject<string[]>([])
  profiles = this.profileService.valueChanges()
  databaseControl = new FormControl('', Validators.required)
  tableControl = new FormControl('', Validators.required)
  columnControl = new FormControl('', Validators.required)
  vocabularyControl = new FormControl('', [Validators.required, this.validVocabulary()])
  conceptCodeControl = new FormControl(true)
  newMappingFormGroup = new FormGroup({
    'database': this.databaseControl,
    'table': this.tableControl,
    'column': this.columnControl,
    'vocabulary': this.vocabularyControl,
    'conceptId': this.conceptCodeControl,
  })
  databases = this.profileService.valueChanges().pipe(
    map(ps => (ps ?? []).map(p => p.database))
  )
  tables = combineLatest([
    this.profiles,
    this.databaseControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([ps, d]) => {
      if (!d || d === '') {
        setTimeout(() => this.databaseControl.setValue((ps ?? [])[0]?.database), 0)
        return [] as Table[]
      }
      return (ps ?? []).filter(p => p.database === d )[0].tables
    })
  )
  columns = combineLatest([
    this.tables,
    this.tableControl.valueChanges
  ]).pipe(
    map(([ts, v]) => ts.filter(t => t.name === v )[0]?.columns.map(c => c.name)),
  )
  vocabularies = combineLatest([
    this.vocabulariesService.valueChanges(),
    this.vocabularyControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([vs, s]) => this.searchVocabularies(vs, s!))
  )
  count = this.mappingService.count()
  dataSource!: TableDataSource<Mapping>
  expanded: Mapping | null = null
  displayedColumns: string[] = [
    'columnName',
    'vocabulary',
    'isConceptCode'
  ]
  MATCH = '100% Match'
  quality: string|null = null
  formInProgress = false


  constructor(
    private profileService: ProfileService,
    private vocabulariesService: VocabulariesService,
    private mappingService: MappingService,
    private dialog: MatDialog,
    private stylesService: StylesService,
    private vocabularyQualityCheckService: VocabularyQualityCheckService,
  ){}

  subscriptions = [

    this.databaseControl.valueChanges.subscribe(
      _ => this.tableControl.reset()
    ),

    this.tableControl.valueChanges.subscribe(
      _ => this.columnControl.reset()
    ),

    this.vocabulariesService.valueChanges().pipe(
      map(vs => (vs ?? []).map(v => v.id!))
    ).subscribe(this.vocabularyIds),

    this.newMappingFormGroup.valueChanges.subscribe(
      _ => this.quality = null
    )

  ]

  ngAfterViewInit(): void {
    this.dataSource = new TableDataSource(
      this.mappingService,
    )
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    this.subscriptions.push(
      combineLatest([
        this.profileService.valueChanges(),
        this.columnControl.valueChanges
      ]).subscribe(
        ([ps, _]) => {
          if (!this.preview) {
            return
          }
          if (this.columnControl.valid) {
            const fs = (ps ?? [])
              .filter(p => p.database === this.databaseControl.value)
              .map(d => d.tables)[0]
              .filter(t => t.name === this.tableControl.value)
              .map(t => t.columns)[0]
              .filter(c => c.name === this.columnControl.value)
              .map(c => c.frequencies)[0]
            this.renderPreviewPlot(fs)
            this.preview.expanded = true
          } else (
            this.preview.expanded = false
          )
        }
      )
    )
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(s => s.unsubscribe())
  }

  get columnsToDisplayWithExpand() {
    return ['expand', ...this.displayedColumns]
  }

  toggleRow(row: Mapping) {
    if (this.expanded?.id === row.id) {
      this.expanded = null
    } else {
      this.expanded = row
    }
  }

  vocabularyString(vocabulary: Vocabulary) {
    const nameString = vocabulary.name ? ` - ${vocabulary.name}` : ''
    const versionString =  vocabulary.version ? ` - ${vocabulary.version}` : ''
    return `${vocabulary.id}${nameString}${versionString}`
  }

  searchVocabularies(vs: Vocabulary[] | null, s: string | null) {
    if (!vs || s === null) {
      return []
    }
    const sl = s.toLowerCase()
    return vs.filter(v => this.vocabularyString(v).toLowerCase().includes(sl))
  }

  validVocabulary(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.vocabularyIds?.value.includes(control.value) ? null : {invalidId: {value: control.value}}
    };
  }

  saveMapping() {
    this.formInProgress = true
    const mapping: Mapping = this._toMapping()
    this.newMappingFormGroup.disable()
    this.mappingService.replaceById({
      id: compositeId(mapping),
      doc: mapping,
    }).subscribe(
      _ => {
        this.newMappingFormGroup.reset()
        this.quality = null
        this.newMappingFormGroup.enable()
        this.formInProgress = false
      }
    )
    
  }

  _toMapping() {
    return {
      databaseName: this.databaseControl.value!,
      tableName: this.tableControl.value!,
      columnName: this.columnControl.value!,
      vocabularyId: this.vocabularyControl.value!,
      isConceptCode: this.conceptCodeControl.value!,
    }
  }

  deleteMapping(id: string) {
    this.mappingService.deleteById({id}).subscribe()
  }

  validateMappingQuality() {
    this.formInProgress = true
    const f = this.newMappingFormGroup.value
    const m = this._toMapping()
    this.newMappingFormGroup.disable()
    this.quality = null
    this.vocabularyQualityCheckService.checkMapping(m).subscribe(
      s => {
        this.newMappingFormGroup.enable()
        this.newMappingFormGroup.patchValue(f)
        this.quality = `${Math.round(s * 100)}% Match`
        this.formInProgress = false
      }
    )
  }

  newVocabularyDialog() {
    const dialogRef = this.dialog.open(NewVocabularyComponent)
    dialogRef.afterClosed().subscribe(vocabularyId => {
      this.vocabularyControl.setValue(vocabularyId)
    })
  }

  renderPreviewPlot(d: {value: any, frequency: number}[]) {
    const charWidth = 9
    const maxStrLen = d3.max(d.map(f => f.value.toString().length))
    const b = Plot.barX(d, {x: "frequency", y: "value", fill: this.stylesService.primary})
    const p = Plot.plot({
      marginLeft: maxStrLen * charWidth,
      marginTop: 0,
      y: {
        type: 'band',
        domain: d.map(f => f.value)
      },
      marks: [b]
    })
    this.previewPlot.nativeElement.replaceChildren(p)
  }

}
