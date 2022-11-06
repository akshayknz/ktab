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
import {
  setActiveOrganization,
  toggleOrganizationModal,
} from "../data/contexts/redux/states";
import { RootState } from "../data/contexts/redux/configureStore";
import { useLocalStorage } from "@mantine/hooks";
import { TimeInput } from "@mantine/dates";

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
  const { activeOrganization } = useSelector(
    (state: RootState) => state.states
  );
  const [organizations, setOrganizations] = useLocalStorage<
    OrganizationProps[]
  >({
    key: "organizations",
    defaultValue: [
      {
        id: activeOrganization||"",
        name: "string",
        icon: "string",
        color: "string",
        accent: "string",
      },
    ],
  });
  const [activeTab, setActiveTab] = useState<string | null>("skeleton");
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.actions);
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
    let temp = organizations.map(e=>e.id)
    
    if(!activeOrganization || !temp.includes(activeOrganization)){
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

  return (
    <>
      <Tabs
        radius="xs"
        value={activeOrganization}
        onTabChange={(value) => dispatch(setActiveOrganization(value))}
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
              {organizations
                ? organizations?.map((organization) => (
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
        </Header>
        {organizations
          ? organizations?.map((organization) => (
              <Tabs.Panel
                key={organization.id ? organization.id : ""}
                value={organization.id ? organization.id : ""}
              >
                <Organization organization={organization} />
              </Tabs.Panel>
            ))
          : null}
      </Tabs>
      {organizations === undefined && <Skeleton height={100}></Skeleton>}
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
