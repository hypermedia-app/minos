import { connect } from '@captaincodeman/rdx'
import { html, property, LitElement } from 'lit-element'
import '@vaadin/vaadin-app-layout/vaadin-app-layout.js'
import { Hydra } from 'alcaeus/web'
import type { GraphPointer } from 'clownface'
import { Resource } from 'alcaeus'
import { store, State } from '../store'
import { navMenu, content } from '../views'

export class MinosApp extends connect(store, LitElement) {
  @property({ type: String })
  api!: string

  @property({ type: Object })
  apiDocumentation!: GraphPointer

  @property({ type: Object })
  mainResource!: Resource

  @property({ type: String })
  token!: string

  @property({ type: Array })
  shapes!: GraphPointer[]

  connectedCallback() {
    super.connectedCallback()
    import('@vaadin/vaadin-app-layout/vaadin-drawer-toggle.js')

    Hydra.defaultHeaders = {
      // Authorization: `System ${this.token}`,
    }
    store.dispatch.minos.init({
      entryPoint: this.api,
    })
  }

  render() {
    return html`<vaadin-app-layout>
      <vaadin-drawer-toggle
        slot="navbar [touch-optimized]"
      ></vaadin-drawer-toggle>

      <nav slot="drawer">
        ${navMenu(this.shapes).show({
    resource: this.apiDocumentation,
  })}
      </nav>

      ${content(this.shapes).show({
    resource: this.mainResource.pointer,
  })}
    </vaadin-app-layout>`
  }

  mapState(state: State) {
    return {
      shapes: state.minos.shapes || [],
      apiDocumentation: state.minos.apiDocumentation || {},
      mainResource: state.minos.mainResource || {},
    }
  }
}
