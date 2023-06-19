import { ErrorHandler, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeAll, reduce, catchError, of, combineLatest } from 'rxjs';
import { CollectionPaths } from '../../../../../commonshcs-angular/projects/docs/src/lib/indexedDb-docs';
import { Table } from './profile.service';
import * as d3 from 'd3'
import { Vocabulary } from './vocabularies/vocabularies.service';
import { Concept } from './vocabularies/concept.service';
import { TableData } from '@commonshcs-angular';
import * as _conceptIds from '../../../../fixtures/vocabulary/conceptIds.json'
const conceptIds = (_conceptIds as any).default 

// http://localhost:4200/?step=Customize%20Mappings&customizeVocabulary=MySiteEncounterVocabulary&conceptMappingId=MySiteEncounterVocabulary-wellness

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

  loadVocabulariesFromCsv() {
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

  loadConceptsFromCsv() {
    combineLatest([
      from(d3.tsv('/assets/vocabulary/CONCEPT.csv')),
      this._syntheaConcepts()
    ]).pipe(
      map(([rs, ss]) => {
        const rst = rs as {[key: string]: any}[]
        return rst
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
          .map(r => ({
            id: r['concept_id'],
            name: r['concept_name'],
            domainId: r['domain_id'],
            vocabularyId: r['vocabulary_id'],
            conceptClassId: r['concept_class_id'],
            standardConcept: r['standard_concept'],
            code: r['concept_code'],
          } as Concept))
          .reduce((m, r) => {m[r.id!] = r; return m}, {} as {[key: string]: Concept})
      }),
      catchError(r => {
        this.errorHandler.handleError(r)
        return of({} as {})
      }),
    ).subscribe(
      cs => {
        if (!this.fixtures) {
          throw 'fixtures not defined'
        }
        this.fixtures.next({
          ...this.fixtures.getValue(),
          concept: cs
        })
        console.log('done')
      }
    )
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
