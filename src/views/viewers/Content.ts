import { Viewer } from '@hydrofoil/roadshow'
import { dash, hydra, rdf, sh } from '@tpluscode/rdf-ns-builders'
import { findNodes } from 'clownface-shacl-path'
import type { GraphPointer } from 'clownface'
import type { PropertyShape } from '@rdfine/shacl'
import { html } from 'lit-element'
import { render } from 'lit-html'
import '@vaadin/vaadin-grid/vaadin-grid.js'
import '@vaadin/vaadin-grid/vaadin-grid-column.js'
import type { GridBodyRenderer, GridHeaderFooterRenderer } from '@vaadin/vaadin-grid/src/interfaces'
import '@rdfjs-elements/rdf-editor/rdf-editor.js'
import '../../components/term-view'
import { store } from '../../store'

export const GenericViewer: Viewer = {
  viewer: dash.DetailsViewer,
  match() {
    return 1
  },
  render({ show }, resource, shape) {
    const children = shape?.property
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .flatMap(property => {
        return findNodes(resource, property.pointer.out(sh.path)).map<[GraphPointer, PropertyShape]>(value => [value, property])
      })

    return html`<dl>
      ${(children || []).map(([child, property]) => html`
        <dt>${property.name || property.path?.id.value}</dt>
        <dd>${show({ resource: child, shape: property.node })}</dd>
      `)}
    </dl>`
  },
}

const idRender: GridBodyRenderer = (node, column, model: any) => {
  render(html`<term-view @click="${() => store.dispatch.minos.mainResource(model?.item)}" .term="${model?.item}"></term-view>`, node)
}

const customPrefixes = {
  code: 'https://code.described.at/',
  auth: 'https://hypermedia.app/auth#',
}

export const RawViewer: Viewer = {
  viewer: dash.DetailsViewer,
  match({ resource }) {
    return resource.term.termType === 'NamedNode' ? 2 : 0
  },
  render(_, resource) {
    const quads = [...resource.dataset.match(null, null, null, resource.term)]
      .filter(({ predicate, object }) => !(predicate.equals(rdf.type) && object.equals(rdf.List)))
    return html`<rdf-editor readonly .customPrefixes="${customPrefixes}" prefixes="acl,hydra,sh" format="text/turtle" .quads="${quads}"></rdf-editor>`
  },
}

export const GridCollectionViewer: Viewer = {
  viewer: dash.DetailsViewer,
  match({ resource }) {
    return resource.has(rdf.type, hydra.Collection).terms.length > 0 ? 10 : 0
  },
  render({ show, findShape }, resource) {
    const members = resource.out(hydra.member).toArray()
    const memberShape = findShape({ resource: members[0] })
    const properties = memberShape.property
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))

    function cellRenderer(property: PropertyShape): GridBodyRenderer {
      return (root, column, model) => {
        const [resource] = findNodes(model?.item as any, property.pointer.out(sh.path)).toArray()

        render(html`${show({ resource, shape: memberShape })}`, root)
      }
    }

    function propertyRenderer(property: PropertyShape): GridHeaderFooterRenderer {
      return (node) => {
        if (property.name) {
          render(html`${property.name}`, node)
        } else {
          render(html`<term-view .term="${property.id}"></term-view>`, node)
        }
      }
    }

    return html`<vaadin-grid .items="${members}">
      <vaadin-grid-column .renderer="${idRender}"></vaadin-grid-column>
      ${(properties || []).map(property => html`
        <vaadin-grid-column .renderer="${cellRenderer(property)}"
            .headerRenderer="${propertyRenderer}"></vaadin-grid-column>
      `)}
    </vaadin-grid>`
  },
}
