import { ErrorHandler, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeAll, reduce, catchError, of } from 'rxjs';
import { CollectionPaths } from '../../../../../commonshcs-angular/projects/docs/src/lib/indexedDb-docs';
import { Table } from './profile.service';
import * as d3 from 'd3'
import { Vocabulary } from './vocabularies/vocabularies.service';
import { Concept } from './concept.service';

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
  
    from([
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
          ...this.fixtures.getValue(),
          profile: ps
        })
      }
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
    from(d3.tsv('/assets/CONCEPT.csv')).pipe(
      map((rs) => {
        const rst = rs as {[key: string]: any}[]
        return rst
          .map(r => ({
            id: r['concept_id'], 
            name: r['concept_name'],
            vocabularyId: r['vocabulary_id']
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
      }
    )
  }
  
}
