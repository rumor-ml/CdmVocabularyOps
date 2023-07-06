import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { first, map, mergeMap } from 'rxjs';
import { DocsService } from '@commonshcs-angular';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-fixtures',
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './fixtures.component.html',
  styleUrls: ['./fixtures.component.css']
})
export class FixturesComponent {

  collection = this.route.params.pipe(
    map(p => p['collection']),
    mergeMap(c => this.docs.valueChanges({
      idField: 'id',
      path: c
    }))
  )

  constructor(
    private route: ActivatedRoute,
    @Inject('DocsService') private docs: DocsService
  ){}


  download() {
    this.collection.pipe(first()).subscribe(
      rs => {
        const ri = rs.reduce((m, r) => {
          const id = r['id'] as string
          m[id] = r
          return m
        }, {} as any)
        const blob = new Blob([JSON.stringify(ri, undefined, 2)])
        const url = window.URL.createObjectURL(blob)
        window.open(url)
      }
    )
  }
}
