import { DndContext, closestCenter, DragOverlay, DragEndEvent, DragStartEvent, MouseSensor, PointerSensor, TouchSensor, UniqueIdentifier, useSensor } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Group, Modal, Text } from "@mantine/core";
import { useState } from "react";
import DragItemGroupInner, { JustDragItemGroupInner } from "./DragItemGroup";

interface DragGroupProps {
  name: string;
  id: number;
}

const DragGroup = ({ name, id }: DragGroupProps) => {
    const [opened, setOpened] = useState(false);
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
      const [itemst, setItemst] = useState({
        A: ["a1","a2","a3","a4"],
        B: ["b1","b2","b3","b4"],
        C: ["c1","c2"],
        D: ["d1","d2","d3","d4","d5","d6"],
      });
      const [containers, setContainers] = useState(
        Object.keys(itemst) as UniqueIdentifier[]
      );
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
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "90vw",
    margin: "10px",
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        padding:10
      })}
    >
        <button {...listeners} {...attributes}>
          Drag handle
        </button>
      <Text>{name}</Text>
      <Group position="center">
        <Button onClick={() => setOpened(true)}>Open Modal</Button>
      </Group>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Introduce yourself!"
      >
        {/* Modal content */}
      </Modal>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          {items.map((item) => (
            <DragItemGroupInner {...item} key={item.id} />
          ))}
        </SortableContext>
          <DragOverlay>
            {activeId ? (
                <JustDragItemGroupInner 
                  name={items[items.findIndex((item)=>item.id===activeId)].name}
                  id={items[items.findIndex((item)=>item.id===activeId)].id}
                />
            ) : null}
          </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default DragGroup;

export const JustDragGroup = ({ name, id }: DragGroupProps) => {
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
  const style = {
    width: "90vw",
    margin: "10px",
  };
  return <Box sx={(theme) => ({
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding:10
    })} style={style}><button>
    Drag handle
  </button><Text>{name}</Text><Group position="center">
    <Button>Open Modal</Button>
    
  </Group>{items.map((item) => (
        <DragItemGroupInner {...item} key={item.id} />
    ))}</Box>;
};
