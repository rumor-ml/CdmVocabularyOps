import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableFieldValue } from '@commonshcs/docs';

export interface Vocabulary {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  name: string | null,
  reference: string | null,
  version: string | null,
  conceptId: string | null,
  isSource?: boolean,
}

@Injectable({
  providedIn: 'root'
})
export class VocabulariesService extends DocsTableDataService<Vocabulary> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'vocabulary', idField: 'id'});
  }

}
