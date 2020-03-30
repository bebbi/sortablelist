import { useRef } from 'react'
import { useSprings } from 'react-spring'

import times from 'lodash/times'

const noOp = () => {}

export const usePrevDepsDifferent = deps => {
  const prevDeps = useRef([])

  const prevDepsDifferent = deps.some((dep, i) => prevDeps.current[i] !== dep)

  // And set same again
  deps.forEach((dep, i) => {
    prevDeps.current[i] = dep
  })

  return prevDepsDifferent
}

export default (length, fnParams, deps) => {
  const prevDepsDifferent = usePrevDepsDifferent(deps)

  const springParams = prevDepsDifferent ? times(length, fnParams) : fnParams

  const springState = useSprings(length, springParams)

  const [springs, setSprings] = prevDepsDifferent
    ? [springState, noOp]
    : springState

  return [springs, setSprings]
}
