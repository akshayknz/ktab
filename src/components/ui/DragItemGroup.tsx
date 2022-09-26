import { DndContext, closestCenter, DragOverlay, DragEndEvent, DragStartEvent, MouseSensor, PointerSensor, TouchSensor, UniqueIdentifier, useSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Group, Modal, Text } from "@mantine/core";
import { useState } from "react";

interface DragItemGroupProps {
  name: string;
  id: number;
}

const DragItemGroupInner = ({ name, id }: DragItemGroupProps) => {
    const [opened, setOpened] = useState(false);
    
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
    width: "100px",
    height: "100px",
    display:"inline-block",
    margin: "10px",
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        padding:10
      })}
    >
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
    </Box>
  );
};

export default DragItemGroupInner;

export const JustDragItemGroupInner = ({ name, id }: DragItemGroupProps) => {
  const style = {
    width: "100px",
    height: "100px",
    display:"inline-block",
    margin: "10px",
  };
  return <Box sx={(theme) => ({
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding:10
    })} style={style}>{name}<Group position="center">
    <Button>Open Modal</Button>
  </Group></Box>;
};
