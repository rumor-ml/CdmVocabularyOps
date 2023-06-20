import { ErrorHandler, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeAll, reduce, catchError, of, combineLatest, mergeMap, filter } from 'rxjs';
import { CollectionPaths } from '@commonshcs-angular';
import { Table } from '../profile.service';
import * as d3 from 'd3'
import { Vocabulary } from '../vocabularies/vocabularies.service';
import { Concept } from '../vocabularies/concept.service';
import { TableData } from '@commonshcs-angular';
import * as _conceptIds from '../../../../../fixtures/vocabulary/conceptIds.json'
import { Domain } from '../vocabularies/domain.service';
import { ConceptClass } from '../vocabularies/concept-class.service';
const conceptIds = (_conceptIds as any).default 

// http://localhost:4200/?step=Customize%20Mappings&customizeVocabulary=MySiteEncounterVocabulary&conceptMappingId=MySiteEncounterVocabulary-wellness&search=true&filter=true

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  fixtures?: BehaviorSubject<CollectionPaths>

  constructor(
    private errorHandler: ErrorHandler
  ) {
    (window as any).chcsdebug = this
  }

  loadSourceDbFromCsv = () => {
    this._syntheaTables().subscribe(
      ([t, rs]) => {
        if (!(['allergies', 'encounters'].includes(t))) {
          return
        }
        if (!this.fixtures) {
          throw 'fixtures not defined'
        }
        const is = rs.reduce((m, r, i) => {
          m[i.toString()] = r
          return m
        }, {} as {[key: string]: TableData})
        const f = {...this.fixtures.value}
        f[`synthea-${t}`] = is
        this.fixtures.next(f)
      }
    )
  }

  loadProfilesFromCsv = () => {

    function summarizeFrequencies(name: string, rs: {[key: string]: any}[]) {
      const fs: Map<string, number> = d3.rollup(
        rs,
        (v: any[]) => v.length,
        (d: {[key: string]: any}) => d[name]
      )
      const top = [...fs.entries()].sort((a, b) => d3.descending(a[1], b[1])).slice(0, 10)
      const d = top.map(e => ({value: e[0], frequency: e[1]}))
      return d
    }
  
    this._syntheaTables().pipe(
      map(([t, rs]) => ({
        name: t,
        columns: (rs as any).columns.map((name: string) => ({name, frequencies: summarizeFrequencies(name, rs)})),
      })),
      reduce((m, t) => {
        m['synthea'].tables.push(t)
        return m
      }, {
        'synthea': {
          database: 'synthea',
          tables: [] as Table[]
        }
      }),
      catchError(r => {
        this.errorHandler.handleError(r)
        return of({})
      }),
    ).subscribe(
      ps => {
        if (!this.fixtures) {
          throw 'fixtures not defined'
        }
        this.fixtures.next({
          ...this.fixtures.value,
          profile: ps
        })
      }
    )
  }

  _syntheaTables() {
    return from([
      '/assets/synthea/allergies.csv',
      '/assets/synthea/careplans.csv',
      '/assets/synthea/conditions.csv',
      '/assets/synthea/devices.csv',
      '/assets/synthea/encounters.csv',
      '/assets/synthea/imaging_studies.csv',
      '/assets/synthea/immunizations.csv',
      '/assets/synthea/medications.csv',
      '/assets/synthea/observations.csv',
      '/assets/synthea/organizations.csv',
      '/assets/synthea/patients.csv',
      '/assets/synthea/payer_transitions.csv',
      '/assets/synthea/payers.csv',
      '/assets/synthea/procedures.csv',
      '/assets/synthea/providers.csv',
      '/assets/synthea/supplies.csv',
    ]).pipe(
      map(p => {
        const s = p.split('/')
        const l = s[s.length - 1]
        const t = l.split('.')[0]
        return from(d3.csv(p)).pipe(
          map((rs) => [t, rs] as [string, {[key: string]: any}[]])
        )
      }),
      mergeAll(),
    )
  }

  legacyLoadVocabulariesFromCsv() {
    from(d3.tsv('/assets/vocabulary/VOCABULARY.csv')).pipe(
      map((rs) => {
        const rst = rs as {[key: string]: any}[]
        return rst
          .map(r => ({
            id: r['vocabulary_id'], 
            name: r['vocabulary_name'],
            reference: r['vocabulary_reference'],
            version: r['vocabulary_version'],
            conceptId: r['vocabulary_concept_id']
          } as Vocabulary))
          .reduce((m, r) => {m[r.id!] = r; return m}, {} as {[key: string]: Vocabulary})
      }),
      catchError(r => {
        this.errorHandler.handleError(r)
        return of({} as {})
      }),
    ).subscribe(
      vs => {
        if (!this.fixtures) {
          throw 'fixtures not defined'
        }
        this.fixtures.next({
          ...this.fixtures.getValue(),
          vocabulary: vs
        })
      }
    )
  }

  loadVocabularyFromCsv() {
    combineLatest([
      from(d3.tsv('/assets/vocabulary/CONCEPT.csv')),
      this._syntheaConcepts()
    ]).pipe(
      map(([rs, ss]) => {
        const rst = rs as {[key: string]: any}[]
        const ds = new Set<string>()
        const ccs = new Set<string>()
        const cs = rst
          .filter(r => {
            if (r['vocabulary_id'] === 'SNOMED') {
              if (ss.snomedCode.has(r['concept_code'])) {
                return true
              }
            }
            if (conceptIds['ids'].includes(r['concept_id'])) {
              return true
            }
            return false
          })
          .map(r => {
            ds.add(r['domain_id'])
            ccs.add(r['concept_class_id'])
            return {
              id: r['concept_id'],
              name: r['concept_name'],
              domainId: r['domain_id'],
              vocabularyId: r['vocabulary_id'],
              conceptClassId: r['concept_class_id'],
              standardConcept: r['standard_concept'],
              code: r['concept_code'],
            } as Concept
          })
          return [cs, ds, ccs] as [Concept[], Set<string>, Set<string>]
      }),
      mergeMap(([cs, ds, ccs]) => {
        return combineLatest([
          from(d3.tsv('/assets/vocabulary/DOMAIN.csv')),
          from(d3.tsv('/assets/vocabulary/CONCEPT_CLASS.csv'))
        ]).pipe(
          map(([drs, ccrs]) => {
            const drst = drs as {[key: string]: any}[]
            const ccrst = ccrs as {[key: string]: any}[]
            const dsi = drst
              .filter(r => ds.has(r['domain_id']))
              .reduce((m, r) => {
                m[r['domain_id']] = {
                  id: r['domain_id'],
                  name: r['domain_name']
                }
                return m
              }, {} as {[key:string]: any})
            const ccsi = ccrst
              .filter(r => ccs.has(r['concept_class_id']))
              .reduce((m, r) => {
                m[r['concept_class_id']] = {
                  id: r['concept_class_id'],
                  name: r['concept_class_name']
                }
                return m
              }, {} as {[key:string]: ConceptClass})
            return [dsi, ccsi]
          }),
          map(([dsi, ccsi]) => {
            const csHydrated: {[key: string]: Concept} = cs.map(c => {
              c['domainName'] = dsi[c['domainId']]['name']
              c['conceptClassName'] = ccsi[c['conceptClassId']]['name']
              return c
            })
            .reduce((m, r) => {m[r.id!] = r; return m}, {} as {[key: string]: Concept})
            return [csHydrated, dsi, ccsi] as [
              {[key: string]: Concept},
              {[key: string]: Domain},
              {[key: string]: ConceptClass}
            ]
          })
        ) 
      }),
    ).subscribe({
      next: ([cs, ds, ccs]) => {
        if (!this.fixtures) {
          throw 'fixtures not defined'
        }
        this.fixtures.next({
          ...this.fixtures.getValue(),
          concept: cs,
          domain: ds,
          conceptClass: ccs
        })
        console.log('done')
      },
      error: r => this.errorHandler.handleError(r)
    })
  }

  _syntheaConcepts() {
    return this._syntheaTables().pipe(
      map(([t, rs]) => {
        if (t === 'allergies') {
          return {
            snomedCode: new Set(rs.map(r => r['CODE'])),
            // snomedName: new Set(rs.map(r => r['DESCRIPTION'])),
          }
        } else {
          return {}
        }
      }),
      reduce((m, vs) => {
        return {
          snomedCode: new Set([...m.snomedCode ?? [], ...vs.snomedCode ?? []]),
          // snomedName: new Set([...m.snomedName ?? [], vs.snomedName ?? []]),
        }
      }, {
        snomedCode: new Set()
      })
    )
  }
  
}
