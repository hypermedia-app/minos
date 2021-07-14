import roadshow from '@hydrofoil/roadshow'
import type { AnyPointer } from 'clownface'
import * as NavMenuViewers from './viewers/NavMenu'
import * as ContentViewers from './viewers/Content'

export const navMenu = (shapes: AnyPointer[]) => roadshow({
  viewers: Object.values(NavMenuViewers),
  shapes,
})

export const content = (shapes: AnyPointer[]) => roadshow({
  viewers: Object.values(ContentViewers),
  shapes,
})
