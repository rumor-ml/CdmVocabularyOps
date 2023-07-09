import { Injectable } from '@angular/core';
import { Observable, from, delay, first, mergeMap, of, concat, map } from 'rxjs';
import { ConceptMapping, ConceptMappingService } from './concept-mapping.service';
import { ErrorHandler } from '@angular/core';
import { Filter, SearchService } from '@commonshcs-angular';
import { Inject } from '@angular/core';
import { Concept } from './concept.service';

@Injectable({
  providedIn: 'root'
})
export class SmartSearchService {

  constructor(
    private conceptMappingService: ConceptMappingService,
    @Inject('SearchService') private searchService: SearchService,
    private errorHandler: ErrorHandler
  ) { }

  queueSearch(
    sourceVocabularyId: string, 
    filters: {
      include: Filter[]
      exclude: Filter[]
    }): Observable<string> {
    const conceptStatus = this.conceptMappingService.valueChanges({
      where: [['sourceVocabularyId', '==', sourceVocabularyId]]
    }).pipe(
      first(),
      mergeMap(cs => {
        if (cs === null) {
          this.errorHandler.handleError('Expected concept mappings to always exist.')
          return of()
        }
        return from(cs).pipe(
          mergeMap(c => {
            if (c.athenaVocabularyId && !c.default) {
              return of(`Status: Skipping concept with existing mapping: ${c.id}`)
            }
            return (this.searchService.valueChanges({
              index: 'concept',
              limit: 1,
              query: {
                q: {
                  value: (c.sourceName?.join(' ') ?? c.sourceCode) as string,
                  column: 'name'
                },
                ...filters
              }
            }) as Observable<Concept[]>).pipe(
              first(),
              mergeMap((r) => {
                const top = r[0]
                if (top) {
                  return this.conceptMappingService.updateById({
                    id: c.id!,
                    partial: {
                      default: true,
                      athenaConceptCode: top.code,
                      athenaConceptId: top.id,
                      athenaConceptName: top.name,
                      athenaVocabularyId: top.vocabularyId,
                    }
                  }).pipe(
                    map(_ => `Status: Default updated for: ${c.id}`)
                  )
                } else {
                  return of(`Status: No results for concept: ${c.id}`)
                }
              })
            )
          }),
        )
      })
    )
    return concat(
      of('Status: Queueing smart search.'),
      conceptStatus,
      of('Status: Search complete. Defaults updated.'),
    )
  }
  
}
