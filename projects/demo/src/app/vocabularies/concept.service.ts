import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableData, TableFieldValue, TableQueryWhere } from '@commonshcs/docs';
import { map } from 'rxjs';

export interface Concept {
    // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
    [key: string]: TableFieldValue,
    id?: string,
    code: string,
    name: string,
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
    conceptCodes?: string[],
    conceptNames?: string[],
    where: TableQueryWhere[]
  }){
    return this.valueChanges({
      where: params.where
    }).pipe(
      map(cs => {
        const vs = cs?.map(c => params.conceptCodes ? c.code : c.name) ?? []
        return (params.conceptCodes ?? params.conceptNames)!.filter((c: string) => !(vs.includes(c)))
      })
    )
  }

}