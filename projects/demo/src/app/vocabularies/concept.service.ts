import { Inject, Injectable } from '@angular/core';
import { Docs, DocsDelegate, TableFieldValue, DocsQueryWhere } from '@commonshcs-angular';
import { map } from 'rxjs';

export interface Concept {
    // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
    [key: string]: TableFieldValue,
    id?: string,
    name: string,
    domainId: string,
    domainName: string,
    vocabularyId: string,
    conceptClassId: string,
    standardConcept: string,
    code: string,
}

@Injectable({
  providedIn: 'root'
})
export class ConceptService extends DocsDelegate<Concept> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'concept', idField: 'id'});
  }

  antiJoin(params: {
    conceptCodes?: Set<string>,
    conceptNames?: Set<string>,
    where: DocsQueryWhere[]
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