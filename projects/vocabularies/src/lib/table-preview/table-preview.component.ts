import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule, MatSelectionList } from '@angular/material/list'; 
import { ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { DocsService, DocsDelegateTableDataSource, DocsTableDataSource, TableData, DocsQueryWhere } from '@commonshcs-angular';
import { Inject } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { BehaviorSubject, switchMap, of, Observable, concat, combineLatest, map, filter } from 'rxjs';
import { ConceptMapping } from '../concept-mapping.service';
import { OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VocabularyMapping } from '../vocabulary-mapping.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-table-preview',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatListModule,
    CommonModule
  ],
  templateUrl: './table-preview.component.html',
  styleUrls: ['./table-preview.component.css']
})
export class TablePreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild('tables') tables!: MatSelectionList;
  
  conceptMapping = new BehaviorSubject<ConceptMapping|null>(null)
  vocabularyMappings = this.conceptMapping.pipe(
    map(c => {
      return c?.vocabularyMappings
    })
  )
  dataSource!: DocsTableDataSource
  selected = new BehaviorSubject<{
    database: string,
    table: string,
    conceptCode: string|null,
    conceptName: string|null,
  }|null>(null)
  path = this.selected.pipe(
    filter(s => !!s),
    map(s => `${s!.database}-${s!.table}`)
  )
  where = combineLatest([
    this.selected.pipe(filter(s => !!s)),
    this.conceptMapping.pipe(filter(c => !!c))
  ]).pipe(
    map(([s, m]) => {
      if (s!.conceptCode) {
        return [[s!.conceptCode, '==', m!.sourceCode]] as DocsQueryWhere[]
      } else {
        return [[s!.conceptName, 'in', m!.sourceName]] as DocsQueryWhere[]
      }
    })
  )
  count = combineLatest([
    this.path,
    this.where
  ]).pipe(
    switchMap(([path, where]) => {
      return this.docsService.count({
        path,
        where
      })
    })
  )
  columns = ['id', 'obj']

  constructor(
    @Inject('DocsService') private docsService: DocsService
  ){}

  ngAfterViewInit(): void {
    this.dataSource = new DocsTableDataSource(
      this.docsService,
      this.path,
      this.where
    )
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  subscriptions = [
    this.vocabularyMappings.subscribe(vs => {
      if (vs && vs[0]) {
        this.selected.next(vs[0])
      } else {
        this.selected.next(null)
      }
    }),
  ]

  formValue(v: any) {
    return `${v['database']}.${v['table']}`
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  formatRow(o: any) {
    return Object.entries(o).map(([key, value]) => {
      const selectedValue = this.selected.value
      return {
        key,
        value,
        mapped: selectedValue?.conceptCode === key || selectedValue?.conceptName === key
      }
    })
  }
}
