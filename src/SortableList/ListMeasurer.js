import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import DefineWidthContainer from './DefineWidthContainer'
import { produce } from 'immer'
import ElementMeasurer from './ElementMeasurer'

const StaticContainer = styled(DefineWidthContainer)`
  /*position: relative;*/
  visibility: hidden;
`

export default ({ items = [], setBounds, Renderer }) => {
  const [sizes, setSizes] = useState([])

  const onSize = i => bounds => {
    setSizes(
      produce(draft => {
        draft[i] = bounds
      })
    )
  }

  useEffect(() => {
    if (items.length && sizes.length !== items.length) {
      setSizes(items.map(() => null))
      return
    }

    if (sizes.every(size => size != null)) {
      setBounds(sizes)
    }
  }, [items, sizes, setBounds])

  return sizes.length === 0 ? null : (
    <StaticContainer>
      {items.map((item, i) => {
        return (
          <ElementMeasurer onSize={onSize(i)} key={item.id}>
            <Renderer item={item} key={item.id} />
          </ElementMeasurer>
        )
      })}
    </StaticContainer>
  )
}
