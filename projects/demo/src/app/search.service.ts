import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Docs, SearchParameters } from '@commonshcs-angular'

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    @Inject('DocsToken') private docs: Docs
  ) { }

  valueChanges<T>(params?: SearchParameters): Observable<T[] | null> {
    if (!params?.index) {
      throw new Error('Not Implemented')
    }
    const colVal = params?.query?.split(' : ')
    const cs = this.docs.valueChanges({idField: 'id', path: params.index})
    if (!colVal) {
      return cs as any as Observable<T[]>
    }
    const col = colVal[0]
    const val = colVal[1].toLowerCase()
    return cs.pipe(
      map(rs => {
        return rs?.filter(r => {
          if (!(r[col])) {
            return false
          }
          return this.match(r[col]!.toString(), val)
        }) as T[]
      })
    )
  }

  match(a: string, b: string): {match: boolean, score: number} {
    return {
      match: a.includes(b),
      score: 1.0
    }
  }

  count(params?: SearchParameters): Observable<number> {
    return of(10)
  }
}
