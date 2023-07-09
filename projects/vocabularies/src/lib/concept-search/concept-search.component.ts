import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { Query, SearchTableDataSource } from '@commonshcs-angular';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { SearchService } from '@commonshcs-angular';
import { BehaviorSubject, Subscription, combineLatest, map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchFiltersComponent } from '../verify-mappings/search-filters/search-filters.component';
import { Concept } from '../concept.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-concept-search',
  standalone: true,
  imports: [
    SearchFiltersComponent,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './concept-search.component.html',
  styleUrls: ['./concept-search.component.css']
})
export class ConceptSearchComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Concept>;
  @ViewChild('filtersPanel') filtersPanel!: MatExpansionPanel
  @ViewChild(SearchFiltersComponent) searchFiltersComponent!: SearchFiltersComponent

  dataSource!: SearchTableDataSource<Concept>
  selection = new SelectionModel<Concept>(false, []);
  searchQueryControl = new FormControl('')
  displayedColumns: string[] = ['select', 'name', 'code', 'conceptClassName', 'domainName', 'vocabularyId'];
  count = new BehaviorSubject(0)
  chosenMapping = new BehaviorSubject<Concept|null>(null)

  smallToMedium = this.breakpointObserver.observe([
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(
    map(({matches}) => matches)
  )

  largeToXLarge = this.breakpointObserver.observe([
    Breakpoints.Large,
    Breakpoints.XLarge
  ]).pipe(
    map(({matches}) => matches)
  )

  constructor(
    @Inject('SearchService') private searchService: SearchService,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ){}

  ngAfterViewInit(): void {
    const searchQuery = combineLatest([
      this.searchQueryControl.valueChanges,
      this.searchFiltersComponent.filters
    ]).pipe(
      map(([q, fs]) => {
        return {
          q: {
            column: 'name',
            value: q,
            keyword: false
          },
          ...fs
        } as Query
      })
    )

    this.dataSource = new SearchTableDataSource(
      this.searchService,
      'concept',
      searchQuery
    )
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    this.subscriptions.push(

      this.route.queryParamMap.pipe(
        map(p => {
          const filter = p.get('filter')
          if (filter) {
            setTimeout(() => this.filtersPanel.expanded = true)
          }
        })
      ).subscribe(),

      searchQuery.pipe(
        switchMap(v => this.searchService.count({
          index: 'concept',
          query: v
        }))
      ).subscribe(this.count)
    )
  }

  subscriptions: Subscription[] = [
  ]

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  saveMapping() {
    this.chosenMapping.next(this.selection.selected[0])
  }
}
