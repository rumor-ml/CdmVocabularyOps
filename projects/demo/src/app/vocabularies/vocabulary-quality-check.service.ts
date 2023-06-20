import { Injectable } from '@angular/core';
import { VocabularyMapping } from './vocabulary-mapping.service';
import { SourceDbService } from '../source-db.service';
import { combineLatest, first, map, mergeMap, of } from 'rxjs';
import { Concept, ConceptService } from './concept.service';

@Injectable({
  providedIn: 'root'
})
export class VocabularyQualityCheckService {

  constructor(
    private sourceDbService: SourceDbService,
    private conceptService: ConceptService,
  ) { }

  checkMapping(m: VocabularyMapping) {
    return combineLatest([
      this._checkMapping(m.databaseName, m.tableName, m.conceptCode, true, m.vocabularyId,),
      this._checkMapping(m.databaseName, m.tableName, m.conceptName, false, m.vocabularyId,)
    ])
  }

  _checkMapping(
    database: string,
    table: string, 
    column: string|null,
    isCode: boolean,
    vocabularyId: string,
  ) {
    if (!column) {
      return of(null)
    }
    return this.sourceDbService.selectDistinct<string>({
      database,
      table,
      column
    }).pipe(
      mergeMap(cs => {
        const concepts = isCode ? {conceptCodes: cs} : {conceptNames: cs}
        return this.conceptService.antiJoin({
          ...concepts,
          where: [['vocabularyId', '==', vocabularyId]]
        }).pipe(map(ms => [cs, ms]))
      }),
      map(([cs, ms]) => {
        return (cs.size - ms.size) / cs.size
      }),
      first(),
    )
  }
}
