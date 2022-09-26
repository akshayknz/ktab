import {
  Active,
  Over,
  closestCenter,
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Container, Title } from "@mantine/core";
import { SetStateAction, useState } from "react";
import DragGroup, { JustDragGroup } from "./DragGroup";

function Organization() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "manoj",
    },
    {
      id: 2,
      name: "2nd manoj",
    },{
      id: 3,
      name: "3nd manoj",
    },{
      id: 4,
      name: "4nd manoj",
    },
  ]);
  const [itemst, setItemst] = useState([
    {
      id: 12,
      name: "manoj",
    },
    {
      id: 22,
      name: "2nd manoj",
    },
  ]);
  const activationConstraint = {
    distance: 15,
  };
  const sensors = [
    useSensor(PointerSensor, {
      activationConstraint,
    }),
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
  ];
  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id != over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Container size={"xl"} mt={"xl"}>
      <Title weight={100}>Organization One</Title>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <DragGroup {...item} key={item.id} />
          ))}
        </SortableContext>
          <DragOverlay>
            {activeId ? (
                <JustDragGroup 
                  name={items[items.findIndex((item)=>item.id===activeId)].name}
                  id={items[items.findIndex((item)=>item.id===activeId)].id}
                />
            ) : null}
          </DragOverlay>
      </DndContext>
    </Container>
  );
}

export default Organization;
