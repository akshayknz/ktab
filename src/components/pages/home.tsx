import {
  Box,
  Container,
  createStyles,
  Header,
  Tabs,
  Text,
} from "@mantine/core";
import Organization from "../ui/organization";
import { MdDragIndicator } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { useContext, useEffect, useState } from "react";
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

const HEADER_HEIGHT = 28;
type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
interface OrganizationProps {
  id?: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
}
const defaultInitializer = (index: number) => index;
export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}

function Home() {
  const user = useContext(AuthContext);
  const { classes, cx } = useStyles();
  let itemCount = 4;
  const [organizations, setOrganizations] = useState<OrganizationProps[]>();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [items, setItems] = useState<Items>({
    A: ["a1", "a2"],
    B: createRange(itemCount, (index) => `B${index + 1}`),
    C: createRange(itemCount, (index) => `C${index + 1}`),
    D: createRange(itemCount, (index) => `D${index + 1}`),
  });
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );

  useEffect(() => {
    //organizations live updates
    const unsub = onSnapshot(
      collection(
        db,
        "ktab-manager",
        user?.uid ? user.uid : "guest",
        "organizations"
      ),
      (organizationSnapshot) => {
        const re: OrganizationProps[] = organizationSnapshot.docs.map((doc) => {
          const unsub = onSnapshot(
            collection(
              db,
              "ktab-manager",
              user?.uid ? user.uid : "guest",
              "organizations",
              doc.id,
              "collections"
            ),
            (collectionSnapshot) => {
              collectionSnapshot.docs.map((doc) => {
                console.log("collections", doc.data().name);
              });
            }
          );
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
    if (organizations && organizations[0] && organizations[0].id) {
      setActiveTab(
        organizations
          ? organizations[0].id
            ? organizations[0].id
            : null
          : "guest"
      );
    }
  }, [organizations]);

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
      <Tabs radius="xs" value={activeTab} onTabChange={setActiveTab}>
        <Header
          height={HEADER_HEIGHT}
          sx={{ overflow: "hidden", border: "none", paddingLeft: 0 }}
        >
          <Box className={classes.vmiddle} sx={{ width: "100%" }}>
            <Tabs.List
              className={cx(classes.vmiddle, classes.lineHeightFix)}
              sx={{ paddingInline: 53 }}
            >
              {organizations?.map((organization) => (
                <Tabs.Tab
                  key={organization.id ? organization.id : ""}
                  value={organization.id ? organization.id : ""}
                  icon={organization.icon}
                  sx={{ height: 28, fontSize: "12px" }}
                >
                  {organization.name}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Box>
        </Header>
        {organizations?.map((organization) => (
          <Tabs.Panel
            key={organization.id ? organization.id : ""}
            value={organization.id ? organization.id : ""}
            pt="xs"
          >
            <Container size={"xl"} mt={"xl"}>
              <Organization
                items={items}
                setItems={setItems}
                containers={containers}
                setContainers={setContainers}
              />
            </Container>
          </Tabs.Panel>
        ))}
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
