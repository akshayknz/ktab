import {
  Box,
  Button,
  Container,
  createStyles,
  Header,
  Skeleton,
  Tabs,
  Text,
  useMantineTheme,
  Kbd,
  useMantineColorScheme,
  SegmentedControl,
  Center,
} from "@mantine/core";
import Organization from "../ui/organization";
import { MdDragIndicator, MdOutlineAdd } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import {
  SetStateAction,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  collection,
  collectionGroup,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveOrganization,
  toggleOrganizationModal,
} from "../data/contexts/redux/states";
import { RootState } from "../data/contexts/redux/configureStore";
import { useLocalStorage } from "@mantine/hooks";
import { TimeInput } from "@mantine/dates";
import useViewport from "../data/useViewport";
import { useParams } from "react-router-dom";
import ItemModal from "../ui/ItemModal";
import { IoSunnyOutline } from "react-icons/io5";
import { BsMoon } from "react-icons/bs";
import { setUserId } from "../data/contexts/redux/actions";

const HEADER_HEIGHT = 28;
type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
interface OrganizationProps {
  id?: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
}
interface CollectionProps {
  id?: string;
  parent: string;
  name: string;
  color: string;
}
interface ItemProps {
  id?: string;
  orgparent: string;
  parent: string;
  name: string;
  color: string;
}

function Home() {
  const user = useContext(AuthContext);
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const vp = useViewport();
  const { classes, cx } = useStyles();
  const { activeOrganization } = useSelector(
    (state: RootState) => state.states
  );
  const [organizations, setOrganizations] = useLocalStorage<
    OrganizationProps[]
  >({
    key: "organizations",
    defaultValue: [
      {
        id: activeOrganization || "",
        name: "",
        icon: "",
        color: "",
        accent: "",
      },
    ],
  });
  const [activeTab, setActiveTab] = useState<string | null>("skeleton");
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.actions);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUserId(user.uid));
      } else {
        dispatch(setUserId("guest"));
      }
    });
    //organizations live updates
    if (userId != "") {
      const unsub = onSnapshot(
        query(
          collection(db, "ktab-manager", userId, "organizations"),
          where("isDeleted", "==", 0)
        ),
        (organizationSnapshot) => {
          const re: OrganizationProps[] = organizationSnapshot.docs.map(
            (doc) => {
              return docsToOrganizations(doc);
            }
          );
          setOrganizations(re);
        }
      );
    }
  }, [userId]);
  //function to map doc data to OrganizationProps[]
  const docsToOrganizations = (doc: DocumentData) => {
    return {
      id: doc.id,
      name: doc.data().name,
      icon: doc.data().icon,
      color: doc.data().color,
      accent: doc.data().accent,
      //...doc.data(),
    };
  };

  useEffect(() => {
    let temp = organizations.map((e) => e.id);
    if (
      (!activeOrganization || !temp.includes(activeOrganization)) &&
      organizations.length > 0
    ) {
      dispatch(
        setActiveOrganization(
          organizations
            ? organizations[0].id
              ? organizations[0].id
              : null
            : "guest"
        )
      );
    }
  }, [organizations?.length]);
  const { userid, id } = useParams();
  const [itemOpened, setItemOpened] = useState(false);
  const [itemData, setItemData] = useState<any>();
  useEffect(() => {
    if (id && userid) {
      const q = doc(db, "ktab-manager", userid, "items", id);
      const querySnapshot = getDoc(q).then((r) => {
        setItemData(docsToItems(r));
        setItemOpened(true);
      });
    }
    /**
     * [START] DELETE THIS SHIT
     * DO SOMETHING TO ALL DATA PRESENT IN THE DB
     */
    //  const run = async () => {
    //   const querySnapshot = await getDocs(collection(db, "ktab-manager", "guest", "items"));
    //   const batch = writeBatch(db);
    //   querySnapshot.forEach((docc) => {batch.update(doc(db, "ktab-manager", "guest", "items", docc.id), { archive: 0 });});
    //   batch.commit().then(() => {console.log("commited");});
    // };run();
    /**
     * [END] DELETE THIS SHIT
     */
  }, []);
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
  return (
    <>
      {itemOpened && (
        <ItemModal open={itemOpened} setOpen={setItemOpened} data={itemData} />
      )}
      <Tabs
        radius="xs"
        color="gray"
        value={activeOrganization}
        onTabChange={(value) => dispatch(setActiveOrganization(value))}
        keepMounted={false}
      >
        <Header
          height={vp.tab ? "auto" : HEADER_HEIGHT}
          sx={{ overflow: "visible", border: "none", paddingLeft: 0 }}
          style={{
            position: "sticky",
            top: "35px",
            backgroundColor:
              colorScheme === "light"
                ? theme.colors["white-alpha"][4]
                : theme.colors["black-alpha"][4],
            backdropFilter: "blur(7px)",
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            zIndex: 12,
          }}
        >
          <Box className={classes.vmiddle} sx={{ width: "100%" }}>
            <Tabs.List
              className={cx(classes.vmiddle, classes.lineHeightFix)}
              sx={{ paddingInline: vp.tab ? 5 : 53 }}
              style={{ borderBottom: "none" }}
            >
              {organizations
                ? organizations?.map((organization) => (
                    <Tabs.Tab
                      key={organization.id ? organization.id : "undefined"}
                      value={organization.id ? organization.id : "undefined"}
                      icon={organization.icon}
                      sx={{
                        height: 28,
                        fontSize: "12px",
                        background: `linear-gradient(transparent,${organization.color} 170%)`,
                      }}
                    >
                      {organization.name}
                    </Tabs.Tab>
                  ))
                : null}
              <Button
                onClick={() =>
                  dispatch(toggleOrganizationModal("organization"))
                }
                variant="subtle"
                compact
                sx={{
                  height: 28,
                  fontSize: "12px",
                }}
              >
                <MdOutlineAdd />
              </Button>
            </Tabs.List>
          </Box>
          {!vp.tab && (
            <Box style={{ width: "235px" }}>
              <Text size="xs" mr={16} style={{ display: "inline-block" }}>
                <Kbd style={{ fontSize: 9, fontWeight: 100 }}>⌘</Kbd> +{" "}
                <Kbd style={{ fontSize: 9 }}>V</Kbd> to paste links
              </Text>
            </Box>
          )}
        </Header>
        {organizations
          ? organizations?.map((organization) => (
              <Tabs.Panel
                key={organization.id ? organization.id : "undefined"}
                value={organization.id ? organization.id : "undefined"}
              >
                <Organization organization={organization} />
              </Tabs.Panel>
            ))
          : null}
      </Tabs>
      {organizations
        ? organizations?.map((organization) => (
            <>
              {organization.id === "" && (
                <Skeleton height={100}>
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
                    Loading organizations
                  </Text>
                </Skeleton>
              )}
            </>
          ))
        : null}
    </>
  );
}

export default Home;

const useStyles = createStyles((theme) => ({
  vmiddle: {
    display: "inline-block",
    verticalAlign: "middle",
    height: "100%",
  },
  lineHeightFix: {
    lineHeight: HEADER_HEIGHT - 2 + "px",
    display: "flex",
  },
}));
