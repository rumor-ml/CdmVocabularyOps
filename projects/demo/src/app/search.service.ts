import { Inject, Injectable } from '@angular/core';
import { Observable, map, of, reduce } from 'rxjs';
import { Docs, SearchParameters } from '@commonshcs-angular'

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    @Inject('DocsToken') private docs: Docs
  ) { }

  valueChanges<T>(params?: SearchParameters): Observable<T[] | null> {
    return this._matches<T>(params).pipe(
      map(rs => {
        if (!rs) {
          return rs
        }
        let start = 0
        if (params?.startAfter) {
          start = rs.findIndex(r => (r as any)['id'] === (params.startAfter as any)['id'])
        }
        if (params?.startAfter || params?.limit) {
          const end = params.limit ? start + params.limit : undefined
          return rs.slice(start, end)
        } else {
          return rs
        }
      })
    )
  }

  _matches<T>(params?: SearchParameters): Observable<T[] | null> {
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
      }),
    )
  }

  count(params?: SearchParameters): Observable<number> {
    return this._matches<unknown>(params).pipe(
      map(rs => rs?.length ?? 0)
    )
  }

  match(a: string, b: string): boolean {
    return a.includes(b)
  }
}
