import { createStore, ModelStore, StoreDispatch, StoreState } from '@captaincodeman/rdx'
import * as models from './models'

interface Config {
  models: typeof models
}

export type State = StoreState<Config>
export type Dispatch = StoreDispatch<Config>
export type Store = ModelStore<Dispatch, State>

export const store = createStore({
  models,
})
