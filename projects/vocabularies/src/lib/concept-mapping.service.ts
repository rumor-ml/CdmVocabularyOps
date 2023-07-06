import { Inject, Injectable } from '@angular/core';
import { DocsService, DocsDelegate, TableFieldValue } from '@commonshcs-angular';

export interface ConceptMapping {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  sourceCode: TableFieldValue|null,
  sourceName: string[]|null,
  vocabularyMappings: {
    database: string,
    table: string,
    conceptCode: string|null,
    conceptName: string|null,
  }[],
  conceptFrequency: number,
  sourceVocabularyId: string,
  athenaConceptId: string|undefined,
  athenaVocabularyId: string|undefined,
  athenaConceptCode: string|undefined,
  athenaConceptName: string|undefined,
  similarityScore: number|undefined,
}

@Injectable({
  providedIn: 'root'
})
export class ConceptMappingService extends DocsDelegate<ConceptMapping> {

  constructor(
    @Inject('DocsService') docs: DocsService,
  ) {
    super({docs, path: 'conceptMapping', idField: 'id'});
  }

  compositeKey(params: {
    vocabularyId: string,
    conceptCodeOrName: string,
  }){
    return `${params.vocabularyId}-${params.conceptCodeOrName}`
  }
}
