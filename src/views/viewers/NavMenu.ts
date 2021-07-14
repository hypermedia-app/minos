import { Viewer } from '@hydrofoil/roadshow'
import { html } from 'lit-element'
import { findNodes } from 'clownface-shacl-path'
import { dash, sh } from '@tpluscode/rdf-ns-builders'
import type { PropertyShape } from '@rdfine/shacl'
import type { GraphPointer } from 'clownface'
import { minos } from '../../ns'
import '@vaadin/vaadin-tabs/vaadin-tabs.js'
import '@vaadin/vaadin-tabs/vaadin-tab.js'
import '../../components/term-view'
import { store } from '../../store'

export const MenuLink: Viewer = {
  viewer: dash.HyperlinkViewer,
  match({ resource }) {
    return resource.term?.termType === 'NamedNode' ? 1 : 0
  },
  render(_, resource) {
    return html`<vaadin-tab @click="${() => store.dispatch.minos.mainResource(resource)}"><term-view .term="${resource}"></term-view></vaadin-tab>`
  },
}

export const NavMenu: Viewer = {
  match({ shape }) {
    return shape?.types.has(minos.NavMenuShape) ? 50 : 0
  },
  render({ show }, resource, shape) {
    const children = shape?.property
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .flatMap(property => {
        return findNodes(resource, property.pointer.out(sh.path)).map<[GraphPointer, PropertyShape]>(value => [value, property])
      })

    return html`<vaadin-tabs orientation="vertical">
      ${(children || []).map(([child, { node }]) => {
    return html`${show({ resource: child, shape: node })}`
  })}
    </vaadin-tabs>`
  },
}
