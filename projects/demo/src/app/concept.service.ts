import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableFieldValue } from '@commonshcs/docs';

export interface Concept {
    // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
    [key: string]: TableFieldValue,
    id?: string,
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

}