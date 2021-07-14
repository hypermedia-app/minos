import { NamedNode } from 'rdf-js'
import { createModel } from '@captaincodeman/rdx'
import { Collection, HydraResponse, Resource } from 'alcaeus'
import { Hydra } from 'alcaeus/web'
import { hydra } from '@tpluscode/rdf-ns-builders'
import type { GraphPointer } from 'clownface'
import TermMap from '@rdf-esm/term-map'
import type { Store } from '../'
import * as ns from '../../ns'

export interface State {
  entrypoint?: Resource
  apiDocumentation?: GraphPointer
  mainResource?: Resource
  shapes: GraphPointer[]
  resources: Map<NamedNode, Resource>
}

export const minos = createModel({
  state: <State>{
    shapes: [],
    resources: new TermMap(),
  },
  reducers: {
    apiLoaded(state, { entrypoint, apiDocumentation }: { entrypoint: Resource; apiDocumentation: GraphPointer }) {
      return {
        ...state,
        entrypoint,
        apiDocumentation,
        mainResource: entrypoint,
      }
    },
    shapesLoaded(state, shapes: GraphPointer[]) {
      return {
        ...state,
        shapes,
      }
    },
    resourceLoaded(state, { resource, setMain = false }: { resource: any; setMain?: boolean }) {
      let { resources, mainResource } = state
      resources.set(resource.id, resource)

      if (setMain) {
        mainResource = resource
      }

      return {
        ...state,
        resources,
        mainResource,
      }
    },
  },
  effects(store: Store) {
    const dispatch = store.getDispatch()

    return {
      async init(arg: {entryPoint: string}) {
        if (!arg) return

        const { representation } = await Hydra.loadResource(arg.entryPoint)
        const apiDocumentation = Hydra.apiDocumentations[0]?.root

        if (!(representation?.root && apiDocumentation)) {
          return
        }

        dispatch.minos.apiLoaded({
          entrypoint: representation.root,
          apiDocumentation: apiDocumentation.pointer,
        })

        const shapesLink = apiDocumentation.get(ns.minos.shapes)
        if (shapesLink?.load) {
          const { representation } = await shapesLink.load() as HydraResponse<any, Collection<any, any>>
          if (representation?.root) {
            dispatch.minos.shapesLoaded(representation.root.pointer.out(hydra.member).toArray())
          }
        }
      },
      async mainResource(resource: GraphPointer) {
        if (resource.term.termType !== 'NamedNode') {
          return
        }

        const { representation } = await Hydra.loadResource(resource.term)
        if (representation?.root) {
          dispatch.minos.resourceLoaded({
            resource: representation.root,
            setMain: true,
          })
        }
      },
    }
  },
})
