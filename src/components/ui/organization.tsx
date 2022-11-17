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
  Skeleton,
  ColorInput,
  Popover,
  SimpleGrid,
  ColorPicker,
  useMantineTheme,
  ThemeIcon,
} from "@mantine/core";
import React, {
  SetStateAction,
  useCallback,
  useRef,
  useState,
  useEffect,
  useContext,
  MutableRefObject,
  useMemo,
} from "react";
import { MdDragIndicator, MdOutlineAdd } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { IoColorFilterOutline } from "react-icons/io5";
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
  addDoc,
} from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrganizationColor,
  toggleEditOrganizationModal,
  toggleOrganizationModal,
} from "../data/contexts/redux/states";
import { useClickOutside } from "@mantine/hooks";
import {
  minimizeCollections,
  softDeleteDocument,
  updateColor,
  updateOrder,
  setSyncing,
} from "../data/contexts/redux/actions";
import { RootState } from "../data/contexts/redux/configureStore";
import { ItemType } from "../data/constants";

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
    zIndex: 5,
  },
  buttonGroupDragging: {
    opacity: 0,
    transform: "translatex(100px)",
  },
}));
// const defaultInitializer = (index: number) => index;
// export function createRange<T = number>(
//   length: number,
//   initializer: (index: number) => any = defaultInitializer
// ): T[] {
//   return [...new Array(length)].map((_, index) => initializer(index));
// }

function Organization({ organization }: OrganizationComponentProps) {
  const user = useContext(AuthContext);
  const [cursor, setCursor] = useState("auto");
  const [currentlyContainer, setCurrentlyContainer] = useState(false);
  const [dragStarted, setDragStarted] = useState(true);
  const [trashPopover, setTrashPopover] = useState(false);
  const trashboxRef = useClickOutside(() => setTrashPopover(false));
  const [colorPopover, setColorPopover] = useState(false);
  const colorboxRef = useClickOutside(() => setColorPopover(false));
  const dispatch = useDispatch();
  const { organizationColor } = useSelector((state: RootState) => state.states);
  useEffect(() => {
    dispatch(setOrganizationColor(organization.color));
  }, [organization.color]);
  const [globalMinifyContainers, setGlobalMinifyContainers] = useState(false);
  /**
   * My states: collections,itemss
   * States from DnD kit: containers, items
   */
  const [collections, setCollections] = useState<CollectionProps[]>([
    {},
  ] as CollectionProps[]);
  const [itemss, setItemss] = useState<ItemProps[]>();
  const [allItems, setAllItems] = useState<any>();
  const [items, setItems] = useState<Items>({
    // Loading: createRange(0, (index) => `Loading...${index + 1}`),
  });
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );
  const minimized = useMemo(
    () => collections.filter((e) => e.minimized === true),
    [collections]
  );
  const onKeyDown = (e: KeyboardEvent) => {
    const isValidHttpUrl = async (string: string) => {
      let url;
      try {
        url = new URL(string);
      } catch (_) {
        return false;
      }
      return url.protocol === "http:" || url.protocol === "https:";
    };
    const runKeyDown = async () => {
      const clipboardText = await navigator.clipboard.readText();
      const isUrl = await isValidHttpUrl(clipboardText);
      const fetchMeth = await fetch(
        `https://textance.herokuapp.com/title/${clipboardText}`,
        {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,PATCH,POST,PUT,DELETE",
          },
        }
      );
      const response = await fetchMeth.text();
      console.log("Creating new document from clipboard", clipboardText);
      const upload = async () => {
        await addDoc(
          collection(
            db,
            "ktab-manager",
            user?.uid ? user.uid : "guest",
            "items"
          ),
          {
            orgparent: organization.id,
            parent: containers[0],
            name: response,
            color: "rgba(255,255,255,1)",
            type: ItemType.LINK,
            link: clipboardText,
            icon: "",
            order: 0,
            archive: false,
            isDeleted: 0,
            updatedAt: +new Date(),
            createdAt: +new Date(),
          }
        );
      };
      if (isUrl) upload();
    };
    if (
      e.ctrlKey &&
      e.key == "v" &&
      document.querySelectorAll("input:focus").length === 0 && //make sure no input fields are in focus
      document.querySelectorAll("[contenteditable=true]") //make sure no contenteditable is present (RTE)
    ) {
      runKeyDown();
    }
  };
  useEffect(() => {
    //Listening to keydown for ctrl+V
    document?.addEventListener("keydown", onKeyDown);

    return () => {
      document?.removeEventListener("keydown", onKeyDown);
    };
  });
  useEffect(() => {
    //Saving collection and item order
    if (!dragStarted) {
      dispatch(setSyncing({ state: true }));
      dispatch(
        updateOrder({
          containers: containers,
          items: items,
        })
      );
      document.addEventListener(
        "commit",
        (e) => dispatch(setSyncing({ state: false })),
        false
      );
      return () => {
        document?.removeEventListener("commit", () => {});
      };
    }
  }, [dragStarted]);
  useEffect(() => {
    //Get collections and items of this organization
    const unsub1 = onSnapshot(
      query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "collections"
        ),
        where("parent", "==", organization.id),
        where("isDeleted", "==", 0)
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
        where("isDeleted", "==", 0)
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
    //set collecitons and items for render
    const getItems = (key: UniqueIdentifier) => {
      return itemss
        ?.filter((e) => e.parent == key)
        ?.sort((a, b) => (a.order > b.order ? 1 : -1))
        .map((e) => e.id);
    };
    if (collections && itemss) {
      let cont = collections
        ?.sort((a, b) => (a.order > b.order ? 1 : -1))
        .map((e) => e.id);
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
      minimized: doc.data().minimized,
      order: doc.data().order,
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
      type: doc.data().type,
      link: doc.data().link,
      icon: doc.data().icon,
      order: doc.data().order,
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
    setDragStarted(false);
  };
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    setDragStarted(true);
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
    easing: "cubic-bezier(.84,.57,.05,.94)",
    duration: 300,
    sideEffects({ active, dragOverlay, draggableNodes, droppableContainers }) {
      // active.node.style.opacity = ".5";
      dragOverlay.node.animate([{ opacity: "1" }, { opacity: "0.7" }], {
        duration: 50,
        easing: "cubic-bezier(.84,.57,.05,.94)",
        fill: "forwards",
      });
      active.node.animate([{ opacity: ".3" }, { opacity: "1" }], {
        duration: 50,
        easing: "cubic-bezier(.84,.57,.05,.94)",
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
        background: `linear-gradient(${organizationColor} 0px,transparent 400px)`,
        minHeight: "84vh",
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
        <Grid>
          <Grid.Col span={6}>
            <Title weight={100}>{organization.name}</Title>
          </Grid.Col>
          <Grid.Col
            span={6}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              variant="light"
              compact
              mx={4}
              leftIcon={<MdOutlineAdd />}
              onClick={() => dispatch(toggleOrganizationModal("collection"))}
            >
              Add New Collection
            </Button>
            {minimized.length === collections.length ? (
              <Button
                variant="light"
                compact
                mx={4}
                leftIcon={<FiMaximize2 />}
                onClick={() => {
                  dispatch(
                    minimizeCollections({
                      ids: collections.map((e) => e.id),
                      state: false,
                    })
                  );
                }}
              >
                Maximize
              </Button>
            ) : (
              <Button
                variant="light"
                compact
                mx={4}
                leftIcon={<FiMinimize2 />}
                onClick={() => {
                  dispatch(
                    minimizeCollections({
                      ids: collections.map((e) => e.id),
                      state: true,
                    })
                  );
                }}
              >
                Minimize
              </Button>
            )}
            <Popover
              closeOnClickOutside
              transition="pop"
              withArrow
              withRoles
              trapFocus
              position="bottom-end"
              opened={colorPopover}
            >
              <Popover.Target>
                <Button
                  variant="light"
                  compact
                  mx={4}
                  onClick={() => setColorPopover((prev) => !prev)}
                  leftIcon={<IoColorFilterOutline />}
                >
                  Color
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Box ref={colorboxRef}>
                  <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                    Organization Color
                  </Text>
                  <ColorPicker
                    format="rgba"
                    defaultValue={organizationColor}
                    pb={20}
                    onChange={(color) => dispatch(setOrganizationColor(color))}
                  />
                  <Box>
                    <Button
                      size={"sm"}
                      compact
                      mr={8}
                      variant="light"
                      onClick={() => {
                        dispatch(
                          updateColor({
                            type: "organizations",
                            docId: organization.id,
                            color: organizationColor,
                          })
                        );
                        setColorPopover((prev) => !prev);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size={"sm"}
                      compact
                      mr={8}
                      variant="subtle"
                      onClick={() => setColorPopover((prev) => !prev)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Popover.Dropdown>
            </Popover>
            <Button
              variant="light"
              compact
              mx={4}
              leftIcon={<FiEdit3 />}
              onClick={() =>
                dispatch(
                  toggleEditOrganizationModal({
                    type: "organization",
                    data: organization,
                  })
                )
              }
            >
              Edit
            </Button>
            <Popover
              closeOnClickOutside
              transition="pop"
              withArrow
              withRoles
              trapFocus
              position="bottom-end"
              opened={trashPopover}
            >
              <Popover.Target>
                <Button
                  variant="light"
                  compact
                  mx={4}
                  leftIcon={<AiOutlineDelete />}
                  onClick={() => setTrashPopover((prev) => !prev)}
                >
                  Delete
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Box ref={trashboxRef}>
                  <Text size={"sm"} mb={10}>
                    Delete this organization?
                  </Text>
                  <Box>
                    <Button
                      size={"sm"}
                      compact
                      mr={8}
                      variant="light"
                      color="red"
                      onClick={() => {
                        dispatch(
                          softDeleteDocument({
                            type: "organizations",
                            docId: organization.id,
                          })
                        );
                        setTrashPopover((prev) => !prev);
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      size={"sm"}
                      compact
                      mr={8}
                      variant="subtle"
                      onClick={() => setTrashPopover((prev) => !prev)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Popover.Dropdown>
            </Popover>
          </Grid.Col>
        </Grid>
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
            {containers.length > 0 ? null : (
              <Skeleton
                height={110}
                mt={10}
                style={{ borderRadius: "10px" }}
                mb="xl"
              />
            )}
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
                  <div
                    className="items"
                    style={{ display: "flex", flexWrap: "wrap" }}
                  >
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
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId ? (
              <>
                <SortableItemOverlay
                  name={activeId}
                  data={allItems[activeId]}
                  currentlyContainer={currentlyContainer}
                />
              </>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Container>
    </Box>
  );
}

export default Organization;

interface ContainerComponentProps {
  name: UniqueIdentifier;
  data: CollectionProps;
  globalMinifyContainers: boolean;
  setGlobalMinifyContainers: React.Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}
const ContainerItem = ({
  name,
  data,
  globalMinifyContainers,
  setGlobalMinifyContainers,
  children,
}: ContainerComponentProps) => {
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
  const dispatch = useDispatch();
  const { classes, cx } = useStyles();
  const [edit, setEdit] = useState(false);
  const [minimize, setMinimize] = useState(data.minimized);
  const [trashPopover, setTrashPopover] = useState(false);
  const trashboxRef = useClickOutside(() => setTrashPopover(false));

  const inputRef = useRef<HTMLInputElement | null>(null);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
    marginBlock: "10px",
    border: isDragging
      ? "3px solid rgb(255 255 255 / 20%)"
      : "3px solid rgb(255 255 255 / 0%)",
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.3 : 1,
    borderRadius: 8,
  };
  useEffect(() => {
    setGlobalMinifyContainers(isDragging);
  }, [isDragging]);
  useEffect(() => {
    if (edit) inputRef.current?.select();
  }, [edit]);
  useEffect(() => {
    setMinimize(data.minimized);
  }, [data.minimized]);
  const handleMinimize = () => {
    dispatch(minimizeCollections({ ids: [data.id], state: !minimize }));
    setMinimize((prev) => !prev);
  };
  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors["black-alpha"][3]
            : theme.colors["white-alpha"][3],
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
                  {data?.name} {data.id}
                </Text>
                {/* <Badge size="xs" radius="md">
                  Modern Javascript
                </Badge> */}
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
                    variant="light"
                    color="dark"
                    radius="md"
                    size="xs"
                    onClick={() => setEdit(true)}
                  >
                    <FiEdit3 />
                  </Button>
                </Tooltip>
                <Tooltip label="Add new item">
                  <Button variant="light" color="dark" radius="md" size="xs">
                    <BiMessageAltAdd />
                  </Button>
                </Tooltip>
                <Popover
                  closeOnClickOutside
                  transition="pop"
                  withArrow
                  withRoles
                  trapFocus
                  position="left-start"
                  opened={trashPopover}
                >
                  <Popover.Target>
                    <Tooltip label="Delete this collection">
                      <Button
                        variant="light"
                        color="dark"
                        radius="md"
                        size="xs"
                        onClick={() => setTrashPopover((prev) => !prev)}
                      >
                        <AiOutlineDelete />
                      </Button>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Box ref={trashboxRef}>
                      <Text size={"sm"} mb={10}>
                        Delete this collection?
                      </Text>
                      <Box>
                        <Button
                          size={"sm"}
                          compact
                          mr={8}
                          variant="light"
                          color="red"
                          onClick={() => {
                            dispatch(
                              softDeleteDocument({
                                type: "collections",
                                docId: name,
                              })
                            );
                            setTrashPopover((prev) => !prev);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          size={"sm"}
                          compact
                          mr={8}
                          variant="subtle"
                          onClick={() => setTrashPopover((prev) => !prev)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </Popover.Dropdown>
                </Popover>

                <Tooltip label="Minimize/Maximize this collection">
                  <Button
                    variant="light"
                    color="dark"
                    radius="md"
                    size="xs"
                    onClick={handleMinimize}
                  >
                    {data.minimized ? <FiMaximize2 /> : <FiMinimize2 />}
                  </Button>
                </Tooltip>
              </Group>
              <Tooltip label="Reorder collections">
                <Button
                  style={{ cursor: "grab" }}
                  variant="light"
                  color="dark"
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
      {!data.minimized && !globalMinifyContainers && (
        <div
          style={{
            maxHeight: isDragging ? "0px" : "100%",
            transition: "all .2s",
          }}
        >
          {children}
        </div>
      )}
    </Box>
  );
};

const SortableItem = ({ name, id, data }: SortableItemProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: name });
  const theme = useMantineTheme();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.5 : 1,
    color: theme.colors.gray[3],
  };
  const [itemOpened, setItemOpened] = useState(false);
  const openModal = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setItemOpened((prev) => !prev);
  };
  return (
    <>
      {data.type == ItemType.LINK && (
        <Box
          component="a"
          href={data.link ? data.link : "#"}
          target="_blank"
          ref={setNodeRef}
          className={itemOpened ? "sort-item item-opened" : "sort-item"}
          style={style}
          {...listeners}
          {...attributes}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors["black-alpha"][3]
                : theme.colors["white-alpha"][3],
          })}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  padding: "10px 0px 0 10px",
                  paddingBlock: "0px",
                }}
              >
                <span
                  style={{
                    height: 15,
                    width: 15,
                    backgroundImage: `url(https://s2.googleusercontent.com/s2/favicons?domain=${data.link})`,
                    borderRadius: 10,
                    display: "inline-block",
                    backgroundSize: "cover",
                  }}
                ></span>
              </Box>
              <Text
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingLeft: 20,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {data?.name} {data.id}
              </Text>
            </Box>
            <Box
              className="item-edit-button"
              style={{
                display: "flex",
              }}
            >
              <ThemeIcon
                color="dark"
                size="lg"
                radius={0}
                onClick={openModal}
                style={{
                  width: "40px",
                  height: "35px",
                  position: "absolute",
                  right: "0",
                  top: "-17px",
                }}
              >
                <FiEdit3 />
              </ThemeIcon>
            </Box>
          </Box>
        </Box>
      )}
      {data.type != ItemType.LINK && (
        <Box
          ref={setNodeRef}
          className={itemOpened ? "sort-item item-opened" : "sort-item"}
          style={style}
          {...listeners}
          {...attributes}
          onClick={openModal}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors["black-alpha"][3]
                : theme.colors["white-alpha"][3],
          })}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  padding: "10px 0px 0 10px",
                  paddingBlock: "0px",
                }}
              >
                <span
                  style={{
                    height: 10,
                    width: 10,
                    background: data?.color,
                    borderRadius: 10,
                    display: "inline-block",
                  }}
                ></span>
              </Box>
              <Text
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingInline: 20,
                }}
              >
                {data?.name} {data.order} {data.id}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
      {itemOpened && (
        <ItemModal open={itemOpened} setOpen={setItemOpened} data={data} />
      )}
    </>
  );
};

const SortableItemOverlay = ({
  name,
  data,
  currentlyContainer,
}: SortableItemProps) => {
  const theme = useMantineTheme();
  const style = {
    color: theme.colors.gray[3],
  };
  const [itemOpened, setItemOpened] = useState(false);
  const openModal = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setItemOpened((prev) => !prev);
  };
  return (
    <>
      {!currentlyContainer && data.type == ItemType.LINK && (
        <Box
          component="a"
          href={data.link ? data.link : "#"}
          target="_blank"
          className={itemOpened ? "sort-item item-opened" : "sort-item"}
          style={style}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors["black-alpha"][3]
                : theme.colors["white-alpha"][3],
          })}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  padding: "10px 0px 0 10px",
                  paddingBlock: "0px",
                }}
              >
                <span
                  style={{
                    height: 15,
                    width: 15,
                    backgroundImage: `url(https://s2.googleusercontent.com/s2/favicons?domain=${data.link})`,
                    borderRadius: 10,
                    display: "inline-block",
                    backgroundSize: "cover",
                  }}
                ></span>
              </Box>
              <Text
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingLeft: 20,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {data?.name}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
      {!currentlyContainer && data.type != ItemType.LINK && (
        <Box
          className={itemOpened ? "sort-item item-opened" : "sort-item"}
          style={style}
          onClick={openModal}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors["black-alpha"][3]
                : theme.colors["white-alpha"][3],
          })}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  padding: "10px 0px 0 10px",
                  paddingBlock: "0px",
                }}
              >
                <span
                  style={{
                    height: 10,
                    width: 10,
                    background: data?.color,
                    borderRadius: 10,
                    display: "inline-block",
                  }}
                ></span>
              </Box>
              <Text
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingInline: 20,
                }}
              >
                {data?.name}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
