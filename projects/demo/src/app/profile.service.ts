import { Inject, Injectable } from '@angular/core';
import { TableFieldValue, DocsDelegate, Docs } from '@commonshcs-angular';

export interface Profile {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  "database": string
  "tables": Table[]
}

export interface Table {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  "name": string
  "columns": Column[]
}

export interface Column {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  "name": string
  "frequencies": {value: any, frequency: number}[]
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends DocsDelegate<Profile> {

  constructor(
    @Inject('DocsToken') docs: Docs,
  ) {
    super({docs, path: 'profile', idField: 'id'});
  }

}

