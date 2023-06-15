import { Inject, Injectable } from '@angular/core';
import { Docs, DocsTableDataService, TableFieldValue } from '@commonshcs/docs';

export interface Mapping {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  databaseName: string,
  tableName: string,
  columnName: string,
  vocabularyId: string,
  isConceptCode: boolean
}

const fixture = [
]

@Injectable({
  providedIn: 'root'
})
export class MappingService extends DocsTableDataService<Mapping> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'mappings', idField: 'id'});
  }

}

export function compositeId(mapping: Mapping) {
  return `${mapping.databaseName}-${mapping.tableName}-${mapping.columnName}`
}
