import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableData, TableFieldValue } from '@commonshcs/docs';

export interface ConceptMapping {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  sourceCode: string|null,
  sourceName: string|null,
  sourceRows: {
    database: string,
    table: string,
    row: TableData
  },
  sourceVocabularyId: string,
  athenaConceptId: string,
  athenaVocabularyId: string,
  athenaConceptName: string,
  similarityScore: number,
}

@Injectable({
  providedIn: 'root'
})
export class ConceptMappingService extends DocsTableDataService<ConceptMapping> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'conceptMapping', idField: 'id'});
  }
}
