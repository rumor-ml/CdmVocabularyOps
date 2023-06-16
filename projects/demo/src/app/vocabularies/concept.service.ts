import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableFieldValue, TableQueryWhere } from '@commonshcs/docs';
import { map } from 'rxjs';

export interface Concept {
    // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
    [key: string]: TableFieldValue,
    id?: string,
    code: TableFieldValue,
    name: TableFieldValue,
    vocabularyId: string,
}

@Injectable({
  providedIn: 'root'
})
export class ConceptService extends DocsTableDataService<Concept> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'concept', idField: 'id'});
  }

  antiJoin(params: {
    conceptCodes?: Set<TableFieldValue>,
    conceptNames?: Set<TableFieldValue>,
    where: TableQueryWhere[]
  }){
    return this.valueChanges({
      where: params.where
    }).pipe(
      map(cs => {
        const vs = cs?.map(c => params.conceptCodes ? c.code : c.name) ?? []
        return new Set([...(params.conceptCodes ?? params.conceptNames)!].filter((c) => !(vs.includes(c))))
      })
    )
  }

}