import { createStyles, Header, Box, Text, Button, Menu } from "@mantine/core";
import { useRef } from "react";
import { RiTableFill } from "react-icons/ri";
import { MdKeyboardArrowRight } from "react-icons/md";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";

export function Layout({ children }: DoubleHeaderProps) {
  const { classes, cx } = useStyles();
  const inputRef = useRef<any>(null);

  function closeMenu() {
    inputRef.current!.click();
  }

  return (
    <>
      <Header height={HEADER_HEIGHT} px={57}>
        <Box pr={5} py={4} className={classes.vmiddle}>
          <RiTableFill size={"22"} className={classes.vmiddle} />
          <Text pl={7} pr={15} px={17} className={classes.vmiddle}>
            KTab
          </Text>
        </Box>

        <Box className={classes.vmiddle}>
          <Menu
            shadow="md"
            width={200}
            offset={0}
            position="bottom-start"
            closeOnClickOutside={true}
            clickOutsideEvents={["click"]}
            transitionDuration={65}
            transition={"rotate-right"}
          >
            <Menu.Target>
              <Button
                variant="default"
                radius="xs"
                size="xs"
                compact
                className={cx(classes.vmiddle, classes.menuitem)}
              >
                Actions
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                className={classes.submenuItem}
                closeMenuOnClick={false}
              >
                <Menu
                  shadow="md"
                  width={100}
                  position="right-start"
                  transitionDuration={65}
                  trigger={"hover"}
                  transition={"rotate-right"}
                  closeDelay={1200}
                >
                  <Menu.Target>
                    <Box className={classes.submenuParent}>
                      <Text className={classes.submenuItem}>Add</Text>
                      <MdKeyboardArrowRight
                        size={"16"}
                        className={classes.vmiddle}
                      />
                    </Box>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={closeMenu}
                    >
                      Tab
                    </Menu.Item>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={closeMenu}
                    >
                      Link
                    </Menu.Item>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={closeMenu}
                    >
                      Todo
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Menu.Item>
              <Menu.Item className={classes.submenuItem}>
                Sync with server
              </Menu.Item>
              <Menu.Item className={classes.submenuItem}>
                Delete selected
              </Menu.Item>
              <Menu.Item className={classes.submenuItem}>Refresh</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Menu
            shadow="md"
            width={200}
            offset={0}
            position="bottom-start"
            closeOnClickOutside={true}
            clickOutsideEvents={["click"]}
            transitionDuration={65}
            transition={"rotate-right"}
          >
            <Menu.Target>
              <Button
                variant="default"
                radius="xs"
                size="xs"
                compact
                className={cx(classes.vmiddle, classes.menuitem)}
              >
                Preferences
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item className={classes.submenuItem}>Settings</Menu.Item>
              <Menu.Item className={classes.submenuItem}>About</Menu.Item>
              <Menu.Item className={classes.submenuItem}>Log out</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Button
            variant="default"
            radius="xs"
            size="xs"
            compact
            className={cx(classes.vmiddle, classes.menuitem)}
          >
            Personalize
          </Button>
          <SpotlightProvider
            actions={actions}
            searchIcon={<MdKeyboardArrowRight size={18} />}
            searchPlaceholder="Search..."
            shortcut="mod + shift + 1"
            nothingFoundMessage="Nothing found..."
            limit={5}
          >
            <Button
              variant="default"
              radius="xs"
              size="xs"
              compact
              className={cx(classes.vmiddle, classes.menuitem)}
              onClick={() => openSpotlight()}
            >
              Spotlight
            </Button>
          </SpotlightProvider>
        </Box>
        <Box className={classes.vmiddle} style={{ float: "right" }}>
          <Text
            size={"xs"}
            className={cx(classes.vmiddle, classes.lineHeightFix)}
          >
            Created by <a href="#">Akshay K Nair</a>
          </Text>
        </Box>
      </Header>
      
      <div ref={inputRef}></div>
      {children}
    </>
  );
}

const HEADER_HEIGHT = 35;

interface DoubleHeaderProps {
  children: React.ReactNode;
}

const data = [
  { link: "#", label: "Notifications", icon: RiTableFill },
  { link: "#", label: "Billing", icon: RiTableFill },
];

const actions: SpotlightAction[] = [
  {
    title: "Home",
    description: "Get to home page",
    onTrigger: () => console.log("Home"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Organizations",
    description: "Get full information about current system status",
    onTrigger: () => console.log("Dashboard"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Documentation",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Preferences",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "About",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Logout",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Sync with server",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
  {
    title: "Refresh",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <MdKeyboardArrowRight size={18} />,
  },
];

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
  },
}));
