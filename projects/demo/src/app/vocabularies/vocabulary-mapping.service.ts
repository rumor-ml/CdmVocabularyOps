import { Inject, Injectable } from '@angular/core';
import { Docs, DocsDelegate, TableFieldValue } from '@commonshcs-angular';

export interface VocabularyMapping {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  databaseName: string,
  tableName: string,
  conceptName: string|null,
  conceptCode: string|null,
  vocabularyId: string,
}

@Injectable({
  providedIn: 'root'
})
export class VocabularyMappingService extends DocsDelegate<VocabularyMapping> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'vocabularyMappings', idField: 'id'});
  }

}

export function compositeId(mapping: VocabularyMapping) {
  return `${mapping.databaseName}-${mapping.tableName}-${mapping.conceptCode ?? mapping.conceptName}`
}
