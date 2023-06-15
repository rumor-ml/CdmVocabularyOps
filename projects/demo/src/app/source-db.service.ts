import { Inject, Injectable } from '@angular/core';
import { Docs } from '@commonshcs/docs';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SourceDbService {

  constructor(
    @Inject('DocsToken') private docs: Docs,
  ) {}

  selectDistinct(params: {
    database: string,
    table: string,
    column: string,
  }){
    return this.docs.valueChanges({
      idField: 'id',
      path: `${params.database}-${params.table}`
    }).pipe(
      map(rs => rs.map(r => r[params.column]))
    )
  }

}
