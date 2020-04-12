import React, { useState } from 'react'
import SortableList from '.'
import styled from 'styled-components'

const data = [
  { label: 'Super favorites', id: 0, isStatic: true },
  { name: 'steve.blank', id: 1 },
  { label: 'Normal favorites', id: 2, isStatic: true },
  { name: 'james.brown', id: 3 },
  { name: 'raumgleiter', id: 4 },
  { label: 'Unsortable', firstUnsortable: true, id: 5, isStatic: true },
  { name: 'martha.argerich', id: 6 },
  { name: 'last.name', id: 7 },

]

const ItemDiv = styled.div`
  width: 320px;
  height: ${props => (props.id + 1) * 15}px;
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
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
  const Wrapper = item.isStatic ? SeparatorDiv : ItemDiv
  return <Wrapper id={item.id}>{item.name || item.label}</Wrapper>
}

export default () => {
  const [items, setItems] = useState(data)

  return (
    <SortableList items={items} setItems={setItems} Renderer={ItemRenderer} />
  )
}
