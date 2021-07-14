import { NamedNode } from 'rdf-js'
import { customElement, html, LitElement, property, PropertyValues } from 'lit-element'
import type { GraphPointer } from 'clownface'

function lastSegment(term: NamedNode) {
  const url = new URL(term.value)

  return url.hash || url.pathname.substr(url.pathname.lastIndexOf('/') + 1)
}

@customElement('term-view')
export class TermView extends LitElement {
  @property({ type: Object })
  term?: GraphPointer

  updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties)

    if (_changedProperties.has('term') && this.term) {
      this.setAttribute('title', this.term.value)
    }
  }

  render() {
    if (this.term?.term.termType === 'NamedNode') {
      return html`${lastSegment(this.term.term)}`
    }

    return html`${this.term?.value}`
  }
}
