import React from 'react'
import { storiesOf } from '@storybook/react'
import 'modern-normalize/modern-normalize.css'

import SampleCaller from './SampleCaller'
import DraggableList from './DraggableList'

const stories = storiesOf('SortableList', module)


const heights = [50, 50, 20, 50]

const items = [
  { id: '1' },
  { id: '2' },
  { id: '3', isStatic: true },
  { id: '4' }
]

const Renderer = ({ item }) => {
  return (
    <div
      style={{
        background: 'lightblue',
        height: '80%',
        margin: '5%',
        border: '6px solid black',
        borderRadius: '6px'
      }}
    >
      {item.isStatic ? 'static' : item.id}
    </div>
  )
}

stories.add('DraggableList', () => {
  return <DraggableList items={items} heights={heights} Renderer={Renderer} />
})


stories.add('SampleCaller', () => {
  return (
    <div style={{ padding: '3em' }}>
      <SampleCaller />
    </div>
  )
})
