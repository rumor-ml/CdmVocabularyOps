import { Injectable } from "@angular/core"
import { Router } from "@angular/router"
import { DebugService as DebugServiceBase } from "@commonshcs-angular"

@Injectable({
  providedIn: 'root',
})
export class DebugService extends DebugServiceBase {

  constructor(
    router: Router
  ) {
    super([
        // http://localhost:4200/?step=Customize%20Mappings&customizeVocabulary=MySiteEncounterVocabulary&conceptMappingId=MySiteEncounterVocabulary-wellness&search=true&filter=true
        {
          id: 'demo',
          path: [],
          queryParams: {},
          docs: {}
        },
        {
          id: 'Customize Mapping > Smart Search',
          path: [],
          queryParams: {
            step: 'Customize Mappings',
            customizeVocabulary: 'MySiteEncounterVocabulary',
            smartSearch: "true",
          },
          docs: {}
        },
        {
          id: 'Customize Mapping > Smart Search > Guess Concept',
          path: [],
          queryParams: {
            step: 'Customize Mappings',
            customizeVocabulary: 'MySiteEncounterVocabulary',
            smartSearch: "true",
            strategy: "Guess Concept"
          },
          docs: {}
        },
        {
          id: 'Customize Mapping > Concept Search',
          path: [],
          queryParams: {
            step: 'Customize Mappings',
            customizeVocabulary: 'MySiteEncounterVocabulary',
            conceptMappingId: 'MySiteEncounterVocabulary-wellness',
            search: 'true',
            filter: 'true'
          },
          docs: {}
        }
      ],
      router
    )
  }
  
}
