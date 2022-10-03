import { Box, Container, createStyles, Header, Tabs, Text } from "@mantine/core";
import Organization from "../ui/organization";
import { MdDragIndicator } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BiMessageAltAdd } from "react-icons/bi";
import { useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";

const HEADER_HEIGHT = 28;
type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
const defaultInitializer = (index: number) => index;
export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}

function Home() {
  const { classes, cx } = useStyles();
  let itemCount = 3;
  const [items, setItems] = useState<Items>({
    A: createRange(itemCount, (index) => `A${index + 1}`),
    B: createRange(itemCount, (index) => `B${index + 1}`),
    C: createRange(itemCount, (index) => `C${index + 1}`),
    D: createRange(itemCount, (index) => `D${index + 1}`),
  });
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );
  console.log(items);
  console.log(containers);
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
      <Tabs radius="xs" defaultValue="gallery">
        <Header height={HEADER_HEIGHT}  sx={{overflow:"hidden", border:"none",paddingLeft:0}}>
          <Box className={classes.vmiddle} sx={{width:"100%"}}>
            <Tabs.List className={cx(classes.vmiddle, classes.lineHeightFix)} sx={{paddingInline:53}}>
              <Tabs.Tab value="gallery" icon={<MdDragIndicator size={14} />} sx={{height:28, fontSize:"12px"}}>Gallery</Tabs.Tab>
              <Tabs.Tab value="messages" icon={<AiOutlineDelete size={14} />} sx={{height:28, fontSize:"12px"}}>Messages</Tabs.Tab>
              <Tabs.Tab value="settings" icon={<BiMessageAltAdd size={14} />} sx={{height:28, fontSize:"12px"}}>Settings</Tabs.Tab>
            </Tabs.List>
          </Box>
        </Header>
        <Tabs.Panel value="gallery" pt="xs">
          <Container size={'xl'} mt={'xl'}>
            <Organization 
              items={items} 
              setItems={setItems} 
              containers={containers} 
              setContainers={setContainers} 
            />
          </Container>
        </Tabs.Panel>
        <Tabs.Panel value="messages" pt="xs">
          <Container size={'xl'} mt={'xl'}>
            <Organization  
              items={items} 
              setItems={setItems} 
              containers={containers} 
              setContainers={setContainers} 
            />
          </Container>
        </Tabs.Panel>
        <Tabs.Panel value="settings" pt="xs">
          <Container size={'xl'} mt={'xl'}>
            <Organization  
              items={items} 
              setItems={setItems} 
              containers={containers} 
              setContainers={setContainers} 
            />
          </Container>
        </Tabs.Panel>
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
    display: "flex"
  },
}));