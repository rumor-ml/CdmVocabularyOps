import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { SearchTableDataSource, TableData } from '@commonshcs-angular';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchService } from '../search.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-concept-search',
  standalone: true,
  imports: [
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
export class ConceptSearchComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TableData>;

  dataSource!: SearchTableDataSource<TableData>
  selection = new SelectionModel<TableData>(false, []);
  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  count = this.searchService.count()
  searchQueryControl = new FormControl('')

  constructor(
    private searchService: SearchService,
  ){}

  ngAfterViewInit(): void {
    this.dataSource = new SearchTableDataSource(
      this.searchService,
      'concept',
      this.searchQueryControl.valueChanges.pipe(
        map(v => `name : ${v}`)
      )
    )
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

  }

  search() {}

  saveMapping() {
    this.selection.selected
  }
}
