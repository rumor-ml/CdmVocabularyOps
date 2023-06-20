import { Inject, Injectable } from '@angular/core';
import { Docs, DocsDelegate, TableFieldValue } from '@commonshcs-angular';


export interface ConceptClass {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  name: string | null,
}

@Injectable({
  providedIn: 'root'
})
export class ConceptClassService extends DocsDelegate<ConceptClass> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'conceptClass', idField: 'id'});
  }
}


