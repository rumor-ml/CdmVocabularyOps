const fs = require('fs/promises');
const { last, concat, combineLatest, from, scan, filter, buffer, map, first, skip, tap, take, reduce, mergeAll, merge, mergeMap } = require('rxjs');

const chunkSize = 1000;
const maxDocs = 8000;

const loadJson = async function (path) {
  return [JSON.parse(await fs.readFile(path))]
}

const loadLines = async function (path, fn) {
  const chunkScan = from(await fs.readFile(path)).pipe(
    scan(({h, n, _, cs}, c) => {
      cs.push(c)
      if (c === 10) {
        n += 1
        if (h && n === chunkSize) {
          return {h, n: 0, chunk:Buffer.from(cs).toString(), cs:[]}
        } else if (!h) {
          return {h:true, n: 0, chunk:Buffer.from(cs).toString(), cs:[]}
        }
      }
      return {h, n, chunk:null, cs}
    }, {
      h: false, 
      n: 0,
      chunk: null,
      cs: []
    }),
  )
  const chunks = concat(
    chunkScan.pipe(
      map(c => c.chunk),
      filter(c => !!c),
    ),
    chunkScan.pipe(
      last(),
      map(({h, n, _, cs}) => Buffer.from(cs).toString())
    )
  )
  return combineLatest([
    chunks.pipe(first()),
    chunks.pipe(skip(1))
  ]).pipe(
    // take(maxDocs/chunkSize),
    map((hCs) => fn(hCs.join('')))
  )

}

const loadLinesFlat = async function (path, fn) {
  return (await loadLines(path, fn)).pipe(
    reduce((m, cs) => {m.push(cs); return m}, []),
    map(cs => cs.flat())
  )
}

const loadTsv = async function (path) {
  const d3 = await import('d3')
  return loadLines(path, d3.tsvParse)
}

const loadTsvFlat = async function (path) {
  const d3 = await import('d3')
  return loadLinesFlat(path, d3.tsvParse)
}

const loadCsv = async function (path) {
  const d3 = await import('d3')
  return loadLines(path, d3.csvParse)
}

const loadCsvFlat = async function (path) {
  const d3 = await import('d3')
  return loadLinesFlat(path, d3.csvParse)
}

async function main() {
  console.log("hello")
  const d3 = await import('d3');

  class TestUtils {
    async loadVocabularyFromCsv() {

      const concepts = await loadTsvFlat('fixtures/vocabulary/CONCEPT.csv')

      combineLatest([
        concepts,
        this._syntheaConcepts(),
        merge(
          this.idsFromSearchResults('fixtures/search-results/ambulatory.json'),
          this.idsFromSearchResults('fixtures/search-results/emergency.json'),
          this.idsFromSearchResults('fixtures/search-results/inpatient.json'),
          this.idsFromSearchResults('fixtures/search-results/outpatient.json'),
          this.idsFromSearchResults('fixtures/search-results/urgent care.json'),
          this.idsFromSearchResults('fixtures/search-results/urgentcare.json'),
          this.idsFromSearchResults('fixtures/search-results/wellness.json'),
        ).pipe(
          reduce((m, is) => {m.push(is); return m}, []),
          map((is: any) => is.flat())
        )
      ]).pipe(
        map(([rs, ss, is]: any) => {
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
              if (is.includes(r['concept_id'])) {
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
              }
            })
            return [cs, ds, ccs] as [any[], Set<string>, Set<string>]
        }),
        mergeMap(([cs, ds, ccs]: any) => {
          return combineLatest([
            from(loadTsvFlat('fixtures/vocabulary/DOMAIN.csv')).pipe(mergeAll()),
            from(loadTsvFlat('fixtures/vocabulary/CONCEPT_CLASS.csv')).pipe(mergeAll())
          ]).pipe(
            map(([drs, ccrs]: any) => {
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
                }, {} as {[key:string]: any})
              return [dsi, ccsi]
            }),
            map(([dsi, ccsi]: any) => {
              const csHydrated: {[key: string]: any} = cs.map(c => {
                if (!dsi[c['domainId']]) {
                  console.log()
                }
                c['domainName'] = dsi[c['domainId']]['name']
                c['conceptClassName'] = ccsi[c['conceptClassId']]['name']
                return c
              })
              .reduce((m, r) => {m[r.id!] = r; return m}, {} as {[key: string]: any})
              return [csHydrated, dsi, ccsi] as [
                {[key: string]: any},
                {[key: string]: any},
                {[key: string]: any}
              ]
            })
          ) 
        }),
      ).subscribe({
        next: async ([cs, ds, ccs]) => {
          try {
            const ws = [
              fs.writeFile('fixtures/demo/concept.json', JSON.stringify(cs, undefined, 2)),
              fs.writeFile('fixtures/demo/domain.json', JSON.stringify(ds, undefined, 2)),
              fs.writeFile('fixtures/demo/conceptClass.json', JSON.stringify(ccs, undefined, 2))
            ]
            await Promise.all(ws)
          } catch (err) {
            console.log(err);
          }
        },
      })
    }
  
    async idsFromSearchResults(path: string) {
      const results = await loadJson(path)
      const ids = [
        ...results[0]['hits']['hits'].map((h: any) => h._id)
      ]
      return ids 
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
  
    _syntheaTables() {
      return from([
        'fixtures/synthea/careplans.csv',
        'fixtures/synthea/allergies.csv',
        'fixtures/synthea/conditions.csv',
        'fixtures/synthea/devices.csv',
        'fixtures/synthea/encounters.csv',
        'fixtures/synthea/imaging_studies.csv',
        'fixtures/synthea/immunizations.csv',
        'fixtures/synthea/medications.csv',
        'fixtures/synthea/observations.csv',
        'fixtures/synthea/organizations.csv',
        'fixtures/synthea/patients.csv',
        'fixtures/synthea/payer_transitions.csv',
        'fixtures/synthea/payers.csv',
        'fixtures/synthea/procedures.csv',
        'fixtures/synthea/providers.csv',
        'fixtures/synthea/supplies.csv',
      ]).pipe(
        map(p => {
          const s = p.split('/')
          const l = s[s.length - 1]
          const t = l.split('.')[0]
          return from(loadCsvFlat(p)).pipe(
            mergeAll(),
            map((rs) => [t, rs] as [string, {[key: string]: any}[]])
          )
        }),
        mergeAll(),
      )
    }
  }

  const t = new TestUtils()
  await t.loadVocabularyFromCsv()
}

main()