import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export default function SortableItem(props: { id: any; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* ... */}
      <button {...listeners} {...arguments} ref={setActivatorNodeRef}>Drag handle</button>
    </li>
  );
}