import { Inject, Injectable } from '@angular/core';
import { DocsService, DocsDelegate, TableFieldValue } from '@commonshcs-angular';


export interface Domain {
  // https://stackoverflow.com/questions/70956050/how-do-i-declare-object-value-type-without-declaring-key-type
  [key: string]: TableFieldValue,
  id?: string,
  name: string | null,
}

@Injectable({
  providedIn: 'root'
})
export class DomainService extends DocsDelegate<Domain> {

  constructor(
    @Inject('DocsService') docs: DocsService,
  ) {
    super({docs, path: 'domain', idField: 'id'});
  }
}


