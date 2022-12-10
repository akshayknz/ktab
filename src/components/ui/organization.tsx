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
  SegmentedControl,
  useMantineColorScheme,
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
  Suspense,
} from "react";
import {
  MdContentPaste,
  MdDragIndicator,
  MdOutlineAdd,
  MdOutlineStickyNote2,
} from "react-icons/md";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import {
  IoColorFilterOutline,
  IoFilterOutline,
  IoFilterSharp,
} from "react-icons/io5";
import { FiEdit3, FiFilter, FiMaximize2, FiMinimize2 } from "react-icons/fi";
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
  setFilterText,
  setFilterType,
  setOrganizationColor,
  setViewMargins,
  setViewWidth,
  toggleEditOrganizationModal,
  toggleOrganizationModal,
} from "../data/contexts/redux/states";
import {
  useClickOutside,
  useColorScheme,
  useDebouncedValue,
  useLocalStorage,
} from "@mantine/hooks";
import {
  minimizeCollections,
  softDeleteDocument,
  updateColor,
  updateOrder,
  setSyncing,
  updateContainerName,
  addNewItem,
  runKeyDown,
} from "../data/contexts/redux/actions";
import { RootState } from "../data/contexts/redux/configureStore";
import { ItemType, ViewMarginsType, ViewWidthType } from "../data/constants";
import { BsEye, BsFilterCircle } from "react-icons/bs";
import useViewport from "../data/useViewport";
const ItemModal = React.lazy(() => import("./ItemModal"));

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
  const theme = useMantineTheme();
  const vp = useViewport();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [cursor, setCursor] = useState("auto");
  const [currentlyContainer, setCurrentlyContainer] = useState(false);
  const [dragStarted, setDragStarted] = useState(true);
  const [trashPopover, setTrashPopover] = useState(false);
  const trashboxRef = useClickOutside(() => setTrashPopover(false));
  const [colorPopover, setColorPopover] = useState(false);
  const [filterPopover, setFilterPopover] = useState(false);
  const [viewPopover, setViewPopover] = useState(false);
  const [lodaingItems, setLodaingItems] = useState(true);
  // const [debouncedFilterText] = useDebouncedValue(filterText, 59);
  // const [debouncedFilterType] = useDebouncedValue(filterType, 59);
  const colorboxRef = useClickOutside(() => {
    setColorPopover(false);
    setFilterPopover(false);
    setViewPopover(false);
  });
  const dispatch = useDispatch();
  const { organizationColor, viewWidth, viewMargins, filterText, filterType } =
    useSelector((state: RootState) => state.states);
  const { userId } = useSelector((state: RootState) => state.actions);
  useEffect(() => {
    dispatch(setOrganizationColor(organization.color));
  }, [organization.color]);
  const [globalMinifyContainers, setGlobalMinifyContainers] = useState(false);
  /**
   * My states: collections,itemss
   * States from DnD kit: containers, items
   */
  const [collections, setCollections] = useLocalStorage<CollectionProps[]>({
    key: "collections",
    defaultValue: [{}] as CollectionProps[],
  });
  const [itemss, setItemss] = useLocalStorage<ItemProps[]>({
    key: "itemss",
    defaultValue: [],
  });
  const [allItems, setAllItems] = useLocalStorage<any>({
    key: "allItems",
    defaultValue: {},
  });
  const [items, setItems] = useLocalStorage<Items>({
    key: "items",
    defaultValue: {},
  });
  const [containers, setContainers] = useLocalStorage({
    key: "containers",
    defaultValue: Object.keys(items) as UniqueIdentifier[],
  });
  const minimized = useMemo(
    () => collections.filter((e) => e.minimized === true),
    [collections]
  );
  const onKeyDown = (e: KeyboardEvent) => {
    if (
      e.ctrlKey &&
      e.key == "v" &&
      document.querySelectorAll("input:focus").length === 0 && //make sure no input fields are in focus
      document.querySelectorAll("[contenteditable=true]").length === 0 //make sure no contenteditable is present (RTE)
    ) {
      dispatch(
        runKeyDown({
          orgparent: organization.id,
          parent: containers[0],
        })
      );
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
    if (userId == "") return;
    //Get collections and items of this organization
    const unsub1 = onSnapshot(
      query(
        collection(db, "ktab-manager", userId, "collections"),
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
        collection(db, "ktab-manager", userId, "items"),
        where("orgparent", "==", organization.id),
        where("isDeleted", "==", 0),
        where("archive", "==", 0)
      ),
      (itemSnapshot) => {
        const re2: ItemProps[] = itemSnapshot.docs.map((doc) => {
          return docsToItems(doc);
        });
        setItemss(re2);
        setTimeout(() => setLodaingItems(false), 500);
      }
    );
  }, [userId]);
  useEffect(() => {
    if (localStorage.getItem("allItems")) {
      setTimeout(() => setLodaingItems(false), 10);
    }
  }, []);
  useEffect(() => {
    //set collecitons and items for render
    const getItems = (key: UniqueIdentifier) => {
      let result = itemss?.filter((e) => e.parent == key);
      if (filterText) {
        let re = new RegExp(filterText.toLowerCase(), "g");
        result = result?.filter((s) => {
          if (s.name?.toLowerCase().match(re)) return true;
          if (s.content) {
            return JSON.stringify(s.content).toLowerCase().match(re);
          }
        });
      }
      if (filterType != "all") {
        result = result?.filter((s) => s.type?.toLowerCase() == filterType);
      }
      result = result
        ?.sort((a, b) => (a.order > b.order ? 1 : -1))
        .map((e) => e.id);
      return result;
    };
    if (collections && itemss) {
      let cont = collections
        ?.sort((a, b) => (a.order > b.order ? 1 : -1))
        .map((e) => e.id);
      if (itemss.length > 0) setContainers(cont);

      let ob = collections.reduce((prev, key) => {
        return Object.assign(prev, { [key.id]: getItems(key.id) });
      }, {});
      if (itemss.length > 0) setItems(ob);
      const itemsi = Object.assign(
        collections.reduce((prev, curr) => {
          return Object.assign(prev, { [curr.id]: curr });
        }, {}),
        itemss.reduce((prev, curr) => {
          return Object.assign(prev, { [curr.id]: curr });
        }, {})
      );
      if (itemss.length > 0) setAllItems(itemsi);
    }
  }, [collections, itemss, filterText, filterType]);
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
      archive: doc.data().archive,
      isShared: doc.data().isShared,
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
  function getContrastColor(rgba: string) {
    let arr = rgba.replace("rgba(", "").replace(")", "").split(",");
    return +arr[0] * 0.299 + +arr[1] * 0.587 + +arr[2] * 0.114 > 186
      ? "#000000"
      : "#FFFFFF";
  }
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
        <Grid sx={{ width: "100%" }}>
          <Grid.Col md={6} sm={12}>
            <Title color={getContrastColor(organizationColor)} weight={100}>
              {organization.name}
            </Title>
          </Grid.Col>
          <Grid.Col
            md={6}
            sm={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: vp.tab ? "wrap" : "nowrap",
              rowGap: "10px",
            }}
          >
            <Button
              variant="light"
              compact
              style={{
                color:
                  colorScheme === "light"
                    ? theme.colors["black-alpha"][7]
                    : getContrastColor(organizationColor),
              }}
              mx={4}
              leftIcon={<MdOutlineAdd />}
              onClick={() => dispatch(toggleOrganizationModal("collection"))}
            >
              Add New Collection
            </Button>

            <Popover
              closeOnClickOutside
              transition="skew-up"
              withArrow
              withRoles
              trapFocus
              position="right"
              opened={filterPopover}
            >
              <Popover.Target>
                <Button
                  variant="light"
                  compact
                  style={{
                    color:
                      colorScheme === "light"
                        ? theme.colors["black-alpha"][7]
                        : getContrastColor(organizationColor),
                  }}
                  mx={4}
                  onClick={() => setFilterPopover((prev) => !prev)}
                  leftIcon={<IoFilterSharp />}
                  className={
                    filterText.length > 0 || filterType != "all"
                      ? "filter-active"
                      : ""
                  }
                >
                  Filter
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Box ref={colorboxRef}>
                  <Input
                    variant="filled"
                    placeholder="Search items"
                    mb={10}
                    size="xs"
                    value={filterText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      dispatch(setFilterText(event.currentTarget.value))
                    }
                  />
                  <SegmentedControl
                    size="xs"
                    fullWidth
                    mb={10}
                    data={[
                      { label: "All", value: "all" },
                      { label: "Links", value: "link" },
                      { label: "Notes", value: "text" },
                    ]}
                    value={filterType}
                    onChange={(value) => dispatch(setFilterType(value))}
                  />
                  {(filterType != "all" || filterText) && (
                    <Button
                      variant="subtle"
                      size="xs"
                      compact
                      uppercase
                      fullWidth
                      onClick={() => {
                        dispatch(setFilterText(""));
                        dispatch(setFilterType("all"));
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </Box>
              </Popover.Dropdown>
            </Popover>
            {!vp.tab && (
              <>
                <Popover
                  closeOnClickOutside
                  transition="skew-up"
                  withArrow
                  withRoles
                  trapFocus
                  position="bottom"
                  opened={viewPopover}
                >
                  <Popover.Target>
                    <Button
                      variant="light"
                      style={{
                        color:
                          colorScheme === "light"
                            ? theme.colors["black-alpha"][7]
                            : getContrastColor(organizationColor),
                      }}
                      compact
                      mx={4}
                      onClick={() => setViewPopover((prev) => !prev)}
                      leftIcon={<AiOutlineEye />}
                    >
                      View
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Box ref={colorboxRef}>
                      <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                        Width
                      </Text>
                      <SegmentedControl
                        size="xs"
                        fullWidth
                        mb={10}
                        data={[
                          { label: "Default", value: ViewWidthType.DEFAULT },
                          { label: "Compact", value: ViewWidthType.COMPACT },
                          { label: "Flow", value: ViewWidthType.FLOW },
                        ]}
                        value={viewWidth}
                        onChange={(v) => dispatch(setViewWidth(v))}
                      />
                      <Text weight={500} sx={{ fontSize: 14 }} pb={5}>
                        Margins
                      </Text>
                      <SegmentedControl
                        size="xs"
                        fullWidth
                        mb={10}
                        data={[
                          { label: "Default", value: ViewMarginsType.DEFAULT },
                          { label: "Compact", value: ViewMarginsType.COMPACT },
                        ]}
                        value={viewMargins}
                        onChange={(v) => dispatch(setViewMargins(v))}
                      />
                    </Box>
                  </Popover.Dropdown>
                </Popover>
                {minimized.length === collections.length ? (
                  <Button
                    variant="light"
                    style={{
                      color:
                        colorScheme === "light"
                          ? theme.colors["black-alpha"][7]
                          : getContrastColor(organizationColor),
                    }}
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
                    style={{
                      color:
                        colorScheme === "light"
                          ? theme.colors["black-alpha"][7]
                          : getContrastColor(organizationColor),
                    }}
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
              </>
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
                  style={{
                    color:
                      colorScheme === "light"
                        ? theme.colors["black-alpha"][7]
                        : getContrastColor(organizationColor),
                  }}
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
              style={{
                color:
                  colorScheme === "light"
                    ? theme.colors["black-alpha"][7]
                    : getContrastColor(organizationColor),
              }}
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
                  style={{
                    color:
                      colorScheme === "light"
                        ? theme.colors["black-alpha"][7]
                        : getContrastColor(organizationColor),
                  }}
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
                animate={lodaingItems}
              >
                {lodaingItems ? (
                  <Text
                    size={"xs"}
                    style={{
                      zIndex: "9999",
                      position: "relative",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.colors.dark[2],
                    }}
                  >
                    Loading collections
                  </Text>
                ) : (
                  <Text
                    size={"xs"}
                    style={{
                      zIndex: "9999",
                      position: "relative",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.colors.dark[2],
                    }}
                  >
                    This organization has no data.
                  </Text>
                )}
              </Skeleton>
            )}
            {containers.map((containerId, index) => (
              <ContainerItem
                name={containerId}
                data={allItems && allItems[containerId]}
                classNames={
                  (filterText || filterType != "all") &&
                  items[containerId].length === 0
                    ? "empty-container"
                    : ""
                }
                key={containerId}
                globalMinifyContainers={globalMinifyContainers}
                setGlobalMinifyContainers={setGlobalMinifyContainers}
              >
                <SortableContext
                  items={items[containerId]}
                  strategy={
                    vp.tab
                      ? verticalListSortingStrategy
                      : horizontalListSortingStrategy
                  }
                >
                  <div
                    className="items"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      flexDirection: vp.tab ? "column" : "row",
                    }}
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
  classNames: string;
  globalMinifyContainers: boolean;
  setGlobalMinifyContainers: React.Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}
const ContainerItem = ({
  name,
  data,
  classNames,
  globalMinifyContainers,
  setGlobalMinifyContainers,
  children,
}: ContainerComponentProps) => {
  const vp = useViewport();
  const {
    setNodeRef,
    attributes,
    listeners,
    active,
    over,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: name, disabled: vp.mob ? true : false });
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
  const updateContainerNameFun = () => {
    setEdit(false);
    dispatch(
      updateContainerName({
        docId: data.id,
        name: inputRef.current?.value,
      })
    );
  };
  useEffect(() => {
    setMinimize(data.minimized);
  }, [data.minimized]);
  const handleMinimize = () => {
    dispatch(minimizeCollections({ ids: [data.id], state: !minimize }));
    setMinimize((prev) => !prev);
  };
  const addNewItemFun = () => {
    dispatch(addNewItem({ orgparent: data.parent, parent: data.id }));
  };
  return (
    <Box
      ref={setNodeRef}
      className={classNames}
      style={style}
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors["black-alpha"][3]
            : theme.colors["white-alpha"][3],
        padding: 4,
        paddingTop: 9,
        paddingInline: 30,
      })}
    >
      <Box sx={{ height: vp.tab ? "auto" : "50px" }}>
        <Grid>
          <Grid.Col md={6} xs={6}>
            {edit ? (
              <Group>
                <Input
                  ref={inputRef}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key == "Enter") updateContainerNameFun();
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
                  onClick={() => updateContainerNameFun()}
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
                {/* <Badge size="xs" radius="md">
                  Modern Javascript
                </Badge> */}
              </Group>
            )}
          </Grid.Col>
          <Grid.Col md={6} xs={6}>
            <Group position="right">
              <Group
                className={`${classes.buttonGroup} ${
                  isDragging && classes.buttonGroupDragging
                }`}
              >
                {!vp.tab && (
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
                )}
                <Tooltip label="Add new item">
                  <Button
                    variant="light"
                    color="dark"
                    radius="md"
                    size="xs"
                    onClick={() => addNewItemFun()}
                  >
                    <BiMessageAltAdd />
                  </Button>
                </Tooltip>
                <Tooltip label="Paste a link">
                  <Button
                    variant="light"
                    color="dark"
                    radius="md"
                    size="xs"
                    onClick={() => {
                      dispatch(
                        runKeyDown({
                          orgparent: data.parent,
                          parent: data.id,
                        })
                      );
                    }}
                  >
                    <MdContentPaste />
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
              {!vp.tab && (
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
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </Box>
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
  const vp = useViewport();
  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: name, disabled: vp.mob ? true : false });
  const theme = useMantineTheme();
  const { organizationColor, viewWidth, viewMargins } = useSelector(
    (state: RootState) => state.states
  );
  let width = vp.tab ? "100%" : "24.1%";
  let margin = "5px";
  switch (viewWidth) {
    case ViewWidthType.FLOW:
      width = "auto";
      break;
    case ViewWidthType.COMPACT:
      width = vp.tab ? "100%" : "19%";
      break;
    default:
      break;
  }
  switch (viewMargins) {
    case ViewMarginsType.COMPACT:
      margin = "3px";
      break;
    default:
      break;
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? "100" : "auto",
    opacity: isDragging ? 0.5 : 1,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[3]
        : theme.colors.dark[7],
    width: width,
    margin: margin,
    maxWidth: vp.tab ? "100%" : "24.1%",
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
            border:
              theme.colorScheme === "dark"
                ? "2px solid " + theme.colors["white-alpha"][1]
                : "2px solid " + theme.colors["black-alpha"][1],
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
                className="sort-item-link"
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingLeft: 20,
                }}
              >
                {data?.name}
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
            border:
              theme.colorScheme === "dark"
                ? "2px solid " + theme.colors["white-alpha"][1]
                : "2px solid " + theme.colors["black-alpha"][1],
            backgroundColor:
              theme.colorScheme === "dark" ? "#ffffff10" : "#00000010",
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
                    width: 10,
                    borderRadius: 10,
                    display: "inline-block",
                    paddingTop: "6px",
                  }}
                >
                  <MdOutlineStickyNote2 color={data?.color} height={10} />
                </span>
              </Box>
              <Text
                className="sort-item-text"
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
      {itemOpened && (
        <Suspense fallback={<></>}>
          <ItemModal open={itemOpened} setOpen={setItemOpened} data={data} />
        </Suspense>
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
  const { organizationColor, viewWidth, viewMargins } = useSelector(
    (state: RootState) => state.states
  );
  let width = "auto";
  let margin = "5px";
  switch (viewMargins) {
    case ViewMarginsType.COMPACT:
      margin = "3px";
      break;
    default:
      break;
  }
  const style = {
    color: theme.colors.gray[3],
    width: width,
    margin: margin,
    display: "block",
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
                className="sort-item-link"
                style={{
                  display: "inline-block",
                  padding: 5,
                  paddingLeft: 20,
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
                    height: 10,
                    width: 10,
                    background: data?.color,
                    borderRadius: 10,
                    display: "inline-block",
                  }}
                ></span>
              </Box>
              <Text
                className="sort-item-text"
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
