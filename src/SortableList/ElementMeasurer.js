import React, { useRef, useEffect } from 'react'
import { useMeasure } from '@softbind/react-hooks'

export default ({ onSize, children }) => {
  const ref = useRef(null)
  const { bounds } = useMeasure(ref, 'bounds')

  useEffect(() => {
    if (bounds && onSize) {
      onSize(bounds)
    }
  }, [bounds, onSize])

  return <div ref={ref}>{children}</div>
}
