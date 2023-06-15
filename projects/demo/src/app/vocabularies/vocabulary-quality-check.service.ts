import { Injectable } from '@angular/core';
import { Mapping } from './mapping.service';
import { SourceDbService } from '../source-db.service';
import { first, map, mergeMap } from 'rxjs';
import { ConceptService } from './concept.service';

@Injectable({
  providedIn: 'root'
})
export class VocabularyQualityCheckService {

  constructor(
    private sourceDbService: SourceDbService,
    private conceptService: ConceptService,
  ) { }

  checkMapping(m: Mapping) {
    return this.sourceDbService.selectDistinct({
      database: m.databaseName,
      table: m.tableName,
      column: m.columnName
    }).pipe(
      mergeMap(cs => {
        const cst = cs as string[]
        const concepts = m.isConceptCode ? {conceptCodes: cst} : {conceptNames: cst}
        return this.conceptService.antiJoin({
          ...concepts,
          where: [['vocabularyId', '==', m.vocabularyId]]
        }).pipe(map(ms => [cs, ms]))
      }),
      map(([cs, ms]) => {
        return (cs.length - ms.length) / cs.length
      }),
      first(),
    )
  }
}
