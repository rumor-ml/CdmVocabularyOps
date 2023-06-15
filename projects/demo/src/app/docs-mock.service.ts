import { Injectable } from '@angular/core';
import { CollectionPaths, IndexedDbDocs, TableData } from '@commonshcs/docs';
import { BehaviorSubject } from 'rxjs'
import { DebugService } from './debug.service';
import * as demoProfile from '../../../../fixtures/demo/profile.json'
import * as demoMappings from '../../../../fixtures/demo/mappings.json'
import * as demoVocabulary from '../../../../fixtures/demo/vocabulary.json'
import * as mappgingsCreatedVocabulary from '../../../../fixtures/mappingsCreated/vocabulary.json'
import * as mappgingsCreatedMappings from '../../../../fixtures/mappingsCreated/mappings.json'

const demo = {
  profile: (demoProfile as any).default,
  mappings: (demoMappings as any).default,
  vocabulary: (demoVocabulary as any).default,
  concept: {}
}

const mappingsCreated = {
  ...demo,
  vocabulary: (mappgingsCreatedVocabulary as any).default,
  mappings: (mappgingsCreatedMappings as any).default
}

const fixture = mappingsCreated

@Injectable({
  providedIn: 'root'
})
export class DocsMock extends IndexedDbDocs {

  constructor(
    debug: DebugService
  ) {
    const tables = new BehaviorSubject(fixture as CollectionPaths)
    debug.fixtures = tables
    super({tables})
  }

}