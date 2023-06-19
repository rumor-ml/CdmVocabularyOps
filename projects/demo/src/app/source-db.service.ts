import { Inject, Injectable } from '@angular/core';
import { Docs, TableFieldValue } from '@commonshcs-angular';
import { Observable, map } from 'rxjs';

export interface SourceConcept {
  sourceCode: TableFieldValue|null,
  sourceName: Set<TableFieldValue>|null,
  frequency: number,
}

@Injectable({
  providedIn: 'root'
})
export class SourceDbService {

  constructor(
    @Inject('DocsToken') private docs: Docs,
  ) {}

  selectDistinct(params: {
    database: string,
    table: string,
    column: string,
  }){
    return this.docs.valueChanges({
      idField: 'id',
      path: `${params.database}-${params.table}`
    }).pipe(
      map(rs => new Set(rs.map(r => r[params.column])))
    )
  }

  loadConcepts(params: {
    database: string,
    table: string,
    conceptCode: string|null,
    conceptName: string|null,
  }): Observable<SourceConcept[]> {
    return this.docs.valueChanges({
      idField: 'id',
      path: `${params.database}-${params.table}`
    }).pipe(
      map(rs => Object.values(rs
        .reduce((m, r) => {
          const k = `${params.conceptCode ? r[params.conceptCode] : null}-${params.conceptName ? r[params.conceptName] : null}`
          if (k in m) {
            m[k].frequency += 1
            if (params.conceptName) {
              m[k].sourceName = new Set([...m[k].sourceName!, r[params.conceptName]])
            }
          } else {
            m[k] = {frequency: 1} as any
            if (params.conceptCode) {
              m[k].sourceCode = r[params.conceptCode]
            }
            if (params.conceptName) {
              m[k].sourceName = new Set([r[params.conceptName]])
            }
          }
          return m
        }, {} as {[key: string]: SourceConcept})) 
      )
    )
  }

}
