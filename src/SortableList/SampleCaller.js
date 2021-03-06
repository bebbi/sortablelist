import React, { useState } from 'react'
import SortableList from '.'
import styled from 'styled-components'

const data = [
  { label: 'Separator', id: 0, isStatic: true },
  { name: 'steve.blank', id: 1 },
  { label: 'Separator', id: 2, isStatic: true },
  { name: 'james.brown', id: 3 },
  { name: 'raumgleiter', id: 4 },
  { label: 'Separator', firstUnsortable: true, id: 5, isStatic: true },
  { name: 'martha.argerich', id: 6 }
]

const ItemDiv = styled.div`
  width: 320px;
  height: 100px;
  overflow: visible;
  border-radius: 5px;
  color: white;
  line-height: 90px;
  padding-left: 32px;
  font-size: 14.5px;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
`

const SeparatorDiv = styled(ItemDiv)`
  height: 50px;
  background: linear-gradient(135deg, #555 0%, #777 100%);
  line-height: 50px;
`

const ItemRenderer = ({ item }) => {
  const Wrapper = item.label === 'Separator' ? SeparatorDiv : ItemDiv
  return <Wrapper>{item.name || item.label}</Wrapper>
}

export default () => {
  const [items, setItems] = useState(data)

  return (
    <SortableList items={items} setItems={setItems} Renderer={ItemRenderer} />
  )
}
