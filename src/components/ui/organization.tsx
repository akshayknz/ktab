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
  DragOverEvent,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Grid,
  Group,
  Input,
  createStyles,
  Chip,
  Badge,
  Tooltip,
} from "@mantine/core";
import {
  SetStateAction,
  useCallback,
  useRef,
  useState,
  useEffect,
  useContext,
  MutableRefObject,
} from "react";
import { MdDragIndicator } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { FiEdit3, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import ItemModal from "./ItemModal";
import {
  onSnapshot,
  collection,
  DocumentData,
  where,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
const useStyles = createStyles((theme) => ({
  titleInput: {
    padding: "0px",
    fontWeight: 100,
    margin: "0px",
    paddingInline: 10,
    height: "36px",
    lineHeight: "36px",
    minHeight: "20px",
    fontSize: "20px",
    "& input": {
      fontSize: "20px",
      fontWeight: 100,
      margin: "0px",
      paddingInline: 10,
      height: "36px",
      minHeight: "20px",
    },
  },
  buttonGroup: {
    transition: "all .5s",
    transform: "translatex(0px)",
  },
  buttonGroupDragging: {
    opacity: 0,
    transform: "translatex(100px)",
  },
}));
const defaultInitializer = (index: number) => index;
export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}
interface OrganizationComponentProps {
  organization: OrganizationProps;
}
interface OrganizationProps {
  id?: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
}
interface CollectionProps {
  id: UniqueIdentifier;
  parent: string;
  name: string;
  color: string;
}
interface ItemProps {
  id: UniqueIdentifier;
  orgparent: string;
  parent: string;
  name: string;
  color: string;
  content?: string;
}
interface ItemCollection {
  [key: UniqueIdentifier]: ItemProps[];
}
function Organization({ organization }: OrganizationComponentProps) {
  const user = useContext(AuthContext);
  const [cursor, setCursor] = useState("auto");
  const [currentlyContainer, setCurrentlyContainer] = useState(false);
  const [globalMinifyContainers, setGlobalMinifyContainers] = useState(false);
  /**
   * My states: collections,itemss
   * States from DnD kit: containers, items
   */
  const [collections, setCollections] = useState<CollectionProps[]>([
    { id: "", name: "", color: "", parent: "" },
  ]);
  const [itemss, setItemss] = useState<ItemProps[]>();
  const [allItems, setAllItems] = useState<any>();
  const [items, setItems] = useState<Items>({
    // Loading: createRange(0, (index) => `Loading...${index + 1}`),
  });
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "collections"
        ),
        where("parent", "==", organization.id),
        where("isDeleted", "==", 0),
      ),
      (collectionSnapshot) => {
        const re: CollectionProps[] = collectionSnapshot.docs.map((doc) => {
          return docsToCollections(doc);
        });
        setCollections(re);
      }
    );
    const unsub2 = onSnapshot(
      query(
        collection(db, "ktab-manager", user?.uid ? user.uid : "guest", "items"),
        where("orgparent", "==", organization.id),
        where("isDeleted", "==", 0),
      ),
      (itemSnapshot) => {
        const re2: ItemProps[] = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc);
        });
        setItemss(re2);
      }
    );
  }, []);
  useEffect(() => {
    const getItems = (key: UniqueIdentifier) => {
      return itemss?.filter((e) => e.parent == key)?.map((e) => e.id);
    };
    if (collections && itemss) {
      let cont = collections.map((e) => e.id);
      setContainers(cont);

      let ob = collections.reduce((prev, key) => {
        return Object.assign(prev, { [key.id]: getItems(key.id) });
      }, {});
      setItems(ob);

      const itemsi = Object.assign(
        collections.reduce((prev, curr) => {
          return Object.assign(prev, { [curr.id]: curr });
        }, {}),
        itemss.reduce((prev, curr) => {
          return Object.assign(prev, { [curr.id]: curr });
        }, {})
      );
      setAllItems(itemsi);
    }
  }, [collections, itemss]);
  const docsToCollections = (doc: DocumentData) => {
    return {
      id: doc.id,
      name: doc.data().name,
      color: doc.data().color,
      parent: doc.data().parent,
    };
  };
  const docsToItems = (doc: DocumentData) => {
    return {
      id: doc.id,
      name: doc.data().name,
      color: doc.data().color,
      parent: doc.data().parent,
      orgparent: doc.data().orgparent,
      content: doc.data().content,
    };
  };
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  };
  const activationConstraint = { distance: 6 };
  const sensors = [
    useSensor(PointerSensor, { activationConstraint }),
    useSensor(MouseSensor, { activationConstraint }),
    useSensor(TouchSensor, { activationConstraint }),
  ];
  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.id in items) {
      setCurrentlyContainer(true);
    }
    setActiveId(active.id);
    setCursor("grabbing");
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setCursor("auto");
    if (active.id in items && over?.id) {
      setCurrentlyContainer(false);
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }
    if (over?.id) {
      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over?.id);
      if (overContainer && activeContainer) {
        const activeIndex = items[activeContainer].indexOf(active.id);
        const overIndex = items[overContainer].indexOf(over?.id);
        if (activeIndex !== overIndex) {
          setItems((items) => ({
            ...items,
            [overContainer]: arrayMove(
              items[overContainer],
              activeIndex,
              overIndex
            ),
          }));
        }
      }
    }
  };
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in items) {
      //overId === TRASH_ID ||
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (item) => item !== active.id
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
        };
      });
    }
  };
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        // if (overId === TRASH_ID) {
        //   // If the intersecting droppable is the trash, return early
        //   // Remove this if you're not using trashable functionality in your app
        //   return intersections;
        // }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // // When a draggable item moves to a new container, the layout may shift
      // // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // // to the id of the draggable item that was moved to the new container, otherwise
      // // the previous `overId` will be returned which can cause items to incorrectly shift positions
      // if (recentlyMovedToNewContainer.current) {
      //   lastOverId.current = activeId;
      // }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
      return [
        {
          transform: CSS.Transform.toString({
            ...transform.initial,
          }),
        },
        {
          transform: CSS.Transform.toString({
            ...transform.final,
            scaleX: 1,
            scaleY: 1,
          }),
        },
      ];
    },
    duration: 300,
    sideEffects({ active, dragOverlay, draggableNodes, droppableContainers }) {
      // active.node.style.opacity = ".5";
      dragOverlay.node.animate([{ opacity: "1" }, { opacity: "0.7" }], {
        duration: 50,
        easing: "ease",
        fill: "forwards",
      });
      active.node.animate([{ opacity: ".3" }, { opacity: "1" }], {
        duration: 50,
        easing: "ease",
        fill: "forwards",
      });

      return () => {
        active.node.style.opacity = "0";
      };
    },
  };
  return (
    <Box
      style={{
        background: `linear-gradient(${organization.color} 0px,transparent 400px)`,
        minHeight: "84vh"
      }}
    >
      <Container
        size={"xl"}
        pt={20}
        pb={50}
        px={"5%"}
        style={{
          cursor: cursor,
        }}
      >
        <Title weight={100}>{organization.name}</Title>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
        >
          <SortableContext
            items={containers}
            strategy={verticalListSortingStrategy}
          >
            {containers.map((containerId, index) => (
              <ContainerItem
                name={containerId}
                data={allItems && allItems[containerId]}
                key={containerId}
                globalMinifyContainers={globalMinifyContainers}
                setGlobalMinifyContainers={setGlobalMinifyContainers}
              >
                <SortableContext
                  items={items[containerId]}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="items">
                    {items[containerId].map((value, index) => (
                      <SortableItem
                        name={value}
                        data={allItems && (allItems[value] as ItemProps)}
                        id={index}
                        key={`${index}${value}`}
                      />
                    ))}
                  </div>
                </SortableContext>
              </ContainerItem>
            ))}
          </SortableContext>
          <DragOverlay adjustScale={true} dropAnimation={dropAnimationConfig}>
            {activeId ? (
              <>
                <Overlay currentlyContainer={currentlyContainer} />
              </>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Container>
    </Box>
  );
}

export default Organization;

interface OverlayProps {
  currentlyContainer: boolean;
}
const Overlay = ({ currentlyContainer }: OverlayProps) => {
  const style = {};
  return (
    <>
      {!currentlyContainer && (
        <Box
          className="sort-item"
          style={style}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            padding: 5,
            paddingInline: 20,
          })}
        >
          <span
            style={{
              height: 10,
              width: 10,
              background: "rgb(255 255 255 / 60%)",
              borderRadius: 10,
              display: "inline-block",
              marginRight: 12,
            }}
          ></span>
          <Text style={{ display: "inline-block" }}>{currentlyContainer}</Text>
        </Box>
      )}
    </>
  );
};

const ContainerItem = ({
  name,
  data,
  globalMinifyContainers,
  setGlobalMinifyContainers,
  children,
}: any) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    active,
    over,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: name });
  const { classes, cx } = useStyles();
  const [edit, setEdit] = useState(false);
  const [minimize, setMinimize] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
    overflow: "hidden",
    marginBlock: "10px",
    border: isDragging
      ? "3px solid rgb(255 255 255 / 20%)"
      : "3px solid rgb(255 255 255 / 0%)",
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.3 : 1,
    borderRadius: 8,
  };
  useEffect(() => {
    setGlobalMinifyContainers(isDragging)
  }, [isDragging]);
  useEffect(() => {
    if (edit) inputRef.current?.select()
  }, [edit]);
  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        padding: 4,
        paddingTop: 9,
        paddingInline: 50,
      })}
    >
      <Container sx={{ height: "50px" }}>
        <Grid>
          <Grid.Col span={6}>
            {edit ? (
              <Group>
                <Input
                  ref={inputRef}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key == "Enter") setEdit(false);
                  }}
                  variant={edit ? "unstyled" : "unstyled"}
                  radius="xs"
                  p={0}
                  size="xl"
                  style={{ fontWeight: 100, fontSize: "10px" }}
                  defaultValue={data?.name}
                  className={classes.titleInput}
                />
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => setEdit(false)}
                >
                  Save
                </Button>
              </Group>
            ) : (
              <Group spacing={"xs"}>
                <Text
                  onClick={() => setEdit(true)}
                  className={classes.titleInput}
                >
                  {data?.name}
                </Text>
                <Badge size="xs" radius="md">
                  Modern Javascript
                </Badge>
              </Group>
            )}
          </Grid.Col>
          <Grid.Col span={6}>
            <Group position="right">
              <Group
                className={`${classes.buttonGroup} ${
                  isDragging && classes.buttonGroupDragging
                }`}
              >
                <Tooltip label="Edit title">
                  <Button
                    variant="default"
                    radius="md"
                    size="xs"
                    onClick={() => setEdit(true)}
                  >
                    <FiEdit3 />
                  </Button>
                </Tooltip>
                <Tooltip label="Add new item">
                  <Button variant="default" radius="md" size="xs">
                    <BiMessageAltAdd />
                  </Button>
                </Tooltip>
                <Tooltip label="Delete this collection">
                  <Button variant="default" radius="md" size="xs">
                    <AiOutlineDelete />
                  </Button>
                </Tooltip>
                <Tooltip label="Minimize this collection">
                  <Button
                    variant="default"
                    radius="md"
                    size="xs"
                    onClick={() => setMinimize((prev) => !prev)}
                  >
                    {minimize ? <FiMaximize2 /> : <FiMinimize2 />}
                  </Button>
                </Tooltip>
              </Group>
              <Tooltip label="Reorder collections">
                <Button
                  style={{ cursor: "grab" }}
                  variant="default"
                  radius="md"
                  size="xs"
                  {...listeners}
                  {...attributes}
                >
                  <MdDragIndicator />
                </Button>
              </Tooltip>
            </Group>
          </Grid.Col>
        </Grid>
      </Container>
      {!minimize && !globalMinifyContainers && (
        <div
          style={{
            maxHeight: isDragging ? "0px" : "500px",
            transition: "all .2s",
          }}
        >
          {children}
        </div>
      )}
    </Box>
  );
};

const SortableItem = ({ name, id, data }: any) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: name });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.5 : 1,
  };
  const [itemOpened, setItemOpened] = useState(false);
  const openModal = () => {
    setItemOpened((prev) => !prev);
  };
  return (
    <>
      <Box
        ref={setNodeRef}
        onClick={openModal}
        className={itemOpened ? "sort-item item-opened" : "sort-item"}
        style={style}
        {...listeners}
        {...attributes}
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
          padding: 5,
          paddingInline: 20,
        })}
      >
        <span
          style={{
            height: 10,
            width: 10,
            background: data?.color,
            borderRadius: 10,
            display: "inline-block",
            marginRight: 12,
          }}
        ></span>
        <Text style={{ display: "inline-block" }}>{data?.name}</Text>
      </Box>
      {itemOpened && (
        <ItemModal open={itemOpened} setOpen={setItemOpened} data={data} />
      )}
    </>
  );
};
