import { Injectable } from '@angular/core';
import { CollectionPaths, IndexedDbDocs, TableData } from '@commonshcs/docs';
import { BehaviorSubject } from 'rxjs'
import { DebugService } from './debug.service';
import * as demoProfile from '../../../../fixtures/demo/profile.json'
import * as demoVocabularyMappings from '../../../../fixtures/demo/vocabularyMappings.json'
import * as demoVocabulary from '../../../../fixtures/demo/vocabulary.json'
import * as demoConcept from '../../../../fixtures/demo/concept.json'
import * as demoSytheaAllergies from '../../../../fixtures/demo/synthea-allergies.json'
import * as demoSytheaEncounters from '../../../../fixtures/demo/synthea-encounters.json'
import * as mappingsCreatedVocabulary from '../../../../fixtures/mappingsCreated/vocabulary.json'
import * as mappingsCreatedVocabularyMappings from '../../../../fixtures/mappingsCreated/vocabularyMappings.json'

const demo = {
  profile: (demoProfile as any).default,
  vocabularyMappings: (demoVocabularyMappings as any).default,
  vocabulary: (demoVocabulary as any).default,
  concept: (demoConcept as any).default,
  'synthea-allergies': (demoSytheaAllergies as any).default,
  'synthea-encounters': (demoSytheaEncounters as any).default,
  conceptMapping: {}
}

const mappingsCreated = {
  ...demo,
  vocabulary: (mappingsCreatedVocabulary as any).default,
  vocabularyMappings: (mappingsCreatedVocabularyMappings as any).default
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