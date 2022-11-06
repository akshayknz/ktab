import {
  Box,
  Button,
  Container,
  createStyles,
  Header,
  Skeleton,
  Tabs,
  Text,
} from "@mantine/core";
import Organization from "../ui/organization";
import { MdDragIndicator, MdOutlineAdd } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  collection,
  collectionGroup,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../data/firebaseConfig";
import { AuthContext } from "../data/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setActiveOrganization, toggleOrganizationModal } from "../data/contexts/redux/states";
import { RootState } from "../data/contexts/redux/configureStore";

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
  const { classes, cx } = useStyles();
  const [organizations, setOrganizations] = useState<OrganizationProps[]>();
  const [activeTab, setActiveTab] = useState<string | null>("skeleton");
  const dispatch = useDispatch()
  const { activeOrganization } = useSelector((state: RootState) => state.states);
  useEffect(() => {
    //organizations live updates
    const unsub = onSnapshot(
      query(
        collection(
          db,
          "ktab-manager",
          user?.uid ? user.uid : "guest",
          "organizations"
        ),
        where("isDeleted", "==", 0)
      ),
      (organizationSnapshot) => {
        const re: OrganizationProps[] = organizationSnapshot.docs.map((doc) => {
          return docsToOrganizations(doc);
        });
        setOrganizations(re);
      }
    );

    // const items = query(collectionGroup(db, 'items'));
    // const unsubii = onSnapshot(items, querySnapshot => {
    //     querySnapshot.forEach((doc) => {
    //       console.log(doc.id, ' => ', doc.data());
    //   });
    // })
  }, [user?.uid]);

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
    //update active tab on organization change (happens when user logs in from guest mode)
    if (organizations && organizations[0] && organizations[0].id && !activeOrganization) {
      dispatch(setActiveOrganization(organizations
        ? organizations[0].id
          ? organizations[0].id
          : null
        : "guest"))
      
    }
  }, [organizations]);

  function handleNewOrganization(event: SyntheticEvent) {
    console.log(event);
    //TODO: open organization modal with organization/collection preselected, ready to add.
  }

  /*
  Organization Firestore collection
  Each entry is a new organization
  Each organization has:
  ```
  "Container": [
    "A1", //array  of objects
    "A3"
  ],
  "Container": [
    "B3"
  ]
  ```
  Each item within the container is an object:
  ```
  {
    id: UniqueIdentifier,
    name: "Name of the item",
    type: link|todo|note|reminder|countdown|calender
    link: "http://link.com",
    content: "String content/RTE content",
    color: Color Code,
    tags: important|password|etc
    created_on: timestamp,
    is_deleted: boolean //Shows up in trash
  }
  ```
  name, content, link is used in Search.
  Hierarchy is like:
  ```
  {
    Organization: {
      "Container": [
          "A1",
          "A3"
      ],
      "Container": [
          "B3"
      ]
    },
    Organization: {
      "Container": [
          "A3"
      ]
    }
  }
  ```
  TODO:
  * Notifications in header
  * Firestore sync
  * Trash drag
  * Login using socials
  * Settings
  * Search
  * Theme color swachtes
  * Checklists
  * 
  */
  return (
    <>
      <Tabs
        radius="xs"
        value={activeOrganization}
        onTabChange={(value=>dispatch(setActiveOrganization(value)))}
        keepMounted={false}
      >
        <Header
          height={HEADER_HEIGHT}
          sx={{ overflow: "hidden", border: "none", paddingLeft: 0 }}
        >
          <Box className={classes.vmiddle} sx={{ width: "100%" }}>
            <Tabs.List
              className={cx(classes.vmiddle, classes.lineHeightFix)}
              sx={{ paddingInline: 53 }}
            >
              {organizations ? (
                organizations?.map((organization) => (
                  <Tabs.Tab
                    key={organization.id ? organization.id : ""}
                    value={organization.id ? organization.id : ""}
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
              ) : (
                <>
                  <Tabs.Tab value="skeleton">
                    <Skeleton height={8} mt={6} radius="xl" />
                  </Tabs.Tab>
                  <Skeleton height={8} mt={6} radius="xl" />
                </>
              )}
              <Button
                onClick={()=>dispatch(toggleOrganizationModal('organization'))}
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
        </Header>
        {organizations ? (
          organizations?.map((organization) => (
            <Tabs.Panel
              key={organization.id ? organization.id : ""}
              value={organization.id ? organization.id : ""}
            >
              <Organization organization={organization} />
            </Tabs.Panel>
          ))
        ) : (
          <Tabs.Panel value="skeleton">
            <Skeleton height={50} circle mb="xl" />
            <Skeleton height={8} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} width="70%" radius="xl" />
          </Tabs.Panel>
        )}
      </Tabs>
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
  menuitem: {
    lineHeight: HEADER_HEIGHT - 2 + "px",
    paddingInline: theme.spacing.sm,
    border: "none",
  },
  submenuItem: {
    height: "28px",
    fontSize: theme.fontSizes.xs,
  },
  submenuParent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ".mantine-Text-root": {
      height: "100%",
      verticalAlign: "middle",
    },
  },
  lineHeightFix: {
    lineHeight: HEADER_HEIGHT - 2 + "px",
    display: "flex",
  },
}));
