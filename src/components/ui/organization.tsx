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
} from "react";
import { MdDragIndicator } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { FiEdit3, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import ItemModal from "./ItemModal";
import { onSnapshot, collection, DocumentData, where, query, orderBy, limit } from "firebase/firestore";
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
  organization: string;
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
}
interface ItemCollection {
  [key: UniqueIdentifier] : ItemProps[];
}
function Organization({
  organization
}: OrganizationComponentProps) {
  const user = useContext(AuthContext);
  const [cursor, setCursor] = useState("auto");
  const [currentlyContainer, setCurrentlyContainer] = useState(false);
  const [globalMinifyContainers, setGlobalMinifyContainers] = useState(false);
  const [items, setItems] = useState<ItemCollection>({"empty":[]});
  const [collections, setCollections] = useState<CollectionProps[]>([{id:"",name:"",color:"",parent:""}]);
  const [itemss, setItemss] = useState<ItemProps[]>();
  useEffect(()=>{
    const unsub1 = onSnapshot(
      query(collection(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "collections"
      ), where("parent", "==", organization)),
      (collectionSnapshot) => {
        const re: CollectionProps[] = collectionSnapshot.docs.map((doc) => {
          return docsToCollections(doc);
        });
        setCollections(re);
      }
    );
    const unsub2 = onSnapshot(
      query(collection(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "items"
      ), where("orgparent", "==", organization)),
      (itemSnapshot) => {
        const re2: ItemProps[] = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc);
        });
        setItemss(re2);
      }
    );
  },[])
  useEffect(()=>{
    const getItems = (key:UniqueIdentifier) => {
      return itemss?.filter(e=>e.parent == key);
    }
    if(collections&&itemss){
      let ob = collections.reduce((prev,key)=>{
        return Object.assign(prev,{[key.id]: getItems(key.id)})
      },{})
      console.log('ob ',ob);
      // setContainers(collections)
      setItems(ob)
    }
    
  },[collections,itemss])
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
    };
  };
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }
    console.log("find container: ", id);
    
    // return Object.keys(items).find((key) => items[key].includes(id));
    return "99zK8ZclVj3ghs1OaCjf";
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
    console.log(active,over);
    
    if (active.id in items && over?.id) {
      setCurrentlyContainer(false);
      setCollections((containers) => {
        const activeIndex = containers.findIndex(e=> e.id===active.id) || -1 
        const overIndex = containers.findIndex(e=> e.id===over.id) || -1 

        return arrayMove(containers, activeIndex, overIndex);
      });
    }
    if (over?.id) {
      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over?.id);
      if (overContainer && activeContainer) {
        // console.log(overContainer, activeContainer, items,items[activeContainer]);
        
        const activeIndex = items[activeContainer].findIndex(e=> e.id===active.id) || -1
        const overIndex = items[overContainer].findIndex(e=> e.id===over.id) || -1
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
        const overIndex = overItems.findIndex(e=>e.id === overId) || -1
        const activeIndex = activeItems.findIndex(e=>e.id === active.id) || -1

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
            (item) => item.id !== active.id
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
                  containerItems.findIndex(e=> e.id===container.id)
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
      active.node.style.opacity = ".5";
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
    <Container size={"xl"} mt={"xl"} style={{ cursor: cursor }}>
      <Title weight={100}>Organization One</Title>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      >
        {collections&&itemss&&items&&
        <>
          <SortableContext
            items={collections}
            strategy={verticalListSortingStrategy}
          >
            {collections?.map((collection,index)=>(
              <ContainerItem
                name={collection.name}
                id={collection.id}
                key={collection.id}
                globalMinifyContainers={globalMinifyContainers}
                setGlobalMinifyContainers={setGlobalMinifyContainers}
              >
                <SortableContext
                  items={items[collection.id]?.map(item=>item.id) || ['asdf']}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="items">
                    {items[collection.id]?.map((value, index) => (
                      <SortableItem
                        name={value.name}
                        id={value.id}
                        key={`${value.id}${value.name}`}
                      />
                    ))}
                  </div>
                </SortableContext>
              </ContainerItem>
            ))}
            {/* {collections?.map((collection, index) => (
              <ContainerItem
                name={collection.name}
                key={collection.id}
                globalMinifyContainers={globalMinifyContainers}
                setGlobalMinifyContainers={setGlobalMinifyContainers}
              >
                <SortableContext
                  items={items[collection.id]}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="items">
                    {items[collection.id].map((value, index) => (
                      <SortableItem
                        name={value}
                        id={index}
                        key={`${index}${value}`}
                      />
                    ))}
                  </div>
                </SortableContext>
              </ContainerItem>
            ))} */}
          </SortableContext>
          <DragOverlay adjustScale={true} dropAnimation={dropAnimationConfig}>
            {activeId ? (
              <>
                <Overlay currentlyContainer={currentlyContainer} />
              </>
            ) : null}
          </DragOverlay>
      </>
        }
        
      </DndContext>
    </Container>
  );
}

export default Organization;

interface OverlayProps {
  currentlyContainer: boolean;
}
const Overlay = ({ currentlyContainer }: OverlayProps) => {
  const style = {
  };
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
  id,
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
  } = useSortable({ id: id });
  const { classes, cx } = useStyles();
  const [edit, setEdit] = useState(false);
  const [minimize, setMinimize] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "90vw",
    overflow: "hidden",
    margin: "10px",
    border: isDragging
      ? "3px solid rgb(255 255 255 / 20%)"
      : "3px solid rgb(255 255 255 / 0%)",
    // height: isDragging ? "55px" : "auto",
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.3 : 1,
    borderRadius: 8,
  };
  useEffect(() => {
    setGlobalMinifyContainers(isDragging);
  }, [isDragging]);
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
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key == "Enter") setEdit(false);
                  }}
                  variant={edit ? "default" : "unstyled"}
                  radius="xs"
                  p={0}
                  size="xl"
                  style={{ fontWeight: 100, fontSize: "10px" }}
                  defaultValue={name}
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
                  {name}{" "}
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

const SortableItem = ({ name, id }: any) => {
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
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.5 : 1,
  };
  const [itemOpened, setItemOpened] = useState(false);
  const openModal = () => {
    setItemOpened((prev) => !prev);
    console.log("open modal");
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
            background: "rgb(255 255 255 / 60%)",
            borderRadius: 10,
            display: "inline-block",
            marginRight: 12,
          }}
        ></span>
        <Text style={{ display: "inline-block" }}>{name}</Text>
      </Box>
      {itemOpened && <ItemModal open={itemOpened} setOpen={setItemOpened} />}
    </>
  );
};
