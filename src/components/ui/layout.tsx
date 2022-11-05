import {
  createStyles,
  Header,
  Box,
  Text,
  Button,
  Menu,
  Footer,
  Popover,
  ScrollArea,
  ActionIcon,
  Card,
  Group,
  Transition,
  Anchor,
  Switch,
} from "@mantine/core";
import { Suspense, useContext, useRef, useState } from "react";
import { RiTableFill } from "react-icons/ri";
import { MdKeyboardArrowRight } from "react-icons/md";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import LoginModal from "./LoginModal";
import { AuthContext } from "../data/contexts/AuthContext";
import { auth } from "../data/firebaseConfig";
import React from "react";
// const OrganizationModal = React.lazy(() => import("./OrganizationModal"));
// const AboutModal = React.lazy(() => import("./AboutModal"));
// const SettingsModal = React.lazy(() => import("./SettingsModal"));
import OrganizationModal from "./OrganizationModal";
import AboutModal from "./AboutModal";
import SettingsModal from "./SettingsModal";
import { useSelector } from "react-redux";
import { RootState } from "../data/contexts/redux/configureStore";
import { useDispatch } from "react-redux";
import { toggleOrganizationModal } from "../data/contexts/redux/states";
import TrashModal from "./TrashModal";
export function Layout({ children }: DoubleHeaderProps) {
  const user = useContext(AuthContext);
  const { classes, cx } = useStyles();
  const inputRef = useRef<any>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [trashModal, setTrashModal] = useState(false);
  const [personalizeModal, setPersonalizeModal] = useState(false);
  const { showOrganizationModal } = useSelector(
    (state: RootState) => state.states
  );
  const dispatch = useDispatch();

  function closeMenu() {
    inputRef.current!.click();
  }

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <>
      <Header
        height={HEADER_HEIGHT}
        px={57}
        style={{
          position: "sticky",
          backgroundColor: "#1a1b1eba",
          backdropFilter: "blur(7px)",
        }}
      >
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
                  closeDelay={1000}
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
                      onClick={() => {
                        closeMenu();
                        dispatch(toggleOrganizationModal("organization"));
                      }}
                    >
                      Organization
                    </Menu.Item>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={() => {
                        closeMenu();
                        dispatch(toggleOrganizationModal("collection"));
                      }}
                    >
                      Collection
                    </Menu.Item>
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
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={closeMenu}
                    >
                      Reminder
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
              <Menu.Item
                className={classes.submenuItem}
                onClick={() => {
                  closeMenu();
                  setSettingsModal((prevState) => !prevState);
                  setPersonalizeModal(false);
                }}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                className={classes.submenuItem}
                onClick={() => {
                  closeMenu();
                  setAboutModal((prevState) => !prevState);
                }}
              >
                About
              </Menu.Item>
              <Menu.Item className={classes.submenuItem}>Archive</Menu.Item>
              <Menu.Item
                className={classes.submenuItem}
                onClick={() => {
                  closeMenu();
                  setTrashModal((prevState) => !prevState);
                }}
              >
                Trash
              </Menu.Item>
              <Menu.Item className={classes.submenuItem} onClick={signOut}>
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Button
            variant="default"
            radius="xs"
            size="xs"
            compact
            onClick={() => {
              setSettingsModal((prevState) => !prevState);
              setPersonalizeModal(true);
            }}
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
          <Popover
            transition="pop"
            width={400}
            position="bottom-end"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <Button
                variant="default"
                radius="xs"
                size="xs"
                compact
                className={cx(classes.vmiddle, classes.menuitem)}
              >
                Notifications
              </Button>
            </Popover.Target>
            <Popover.Dropdown pr={6}>
              <ScrollArea
                style={{ height: "80vh" }}
                offsetScrollbars
                scrollbarSize={12}
              >
                {[1, 2].map((e) => (
                  <Card key={e} my={10} withBorder shadow="sm" radius="md">
                    <Card.Section withBorder inheritPadding py="xs">
                      <Group position="apart">
                        <Text weight={500}>Item reminder for the next day</Text>
                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon>
                              <MdKeyboardArrowRight size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              icon={<MdKeyboardArrowRight size={14} />}
                            >
                              Show Item
                            </Menu.Item>
                            <Menu.Item
                              icon={<MdKeyboardArrowRight size={14} />}
                              color="red"
                            >
                              Remove
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Card.Section>
                    {e < 2 && (
                      <Text mt="sm" color="dimmed" size="sm">
                        <Text component="span" inherit color="blue">
                          200+ images uploaded
                        </Text>{" "}
                        since last visit, review them to select which one should
                        be added to your gallery
                      </Text>
                    )}
                  </Card>
                ))}
              </ScrollArea>
            </Popover.Dropdown>
          </Popover>
          {user ? (
            <Button
              variant="default"
              radius="xs"
              size="xs"
              compact
              className={cx(classes.vmiddle, classes.menuitem)}
              onClick={signOut}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                radius="xs"
                size="xs"
                compact
                className={cx(classes.vmiddle, classes.menuitem)}
                onClick={() => setLoginModal((prevState) => !prevState)}
              >
                Login
              </Button>
            </>
          )}
          <LoginModal open={loginModal} setOpen={setLoginModal} />
        </Box>
      </Header>
      {/* {organizationModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <OrganizationModal
            open={organizationModal}
            setOpen={setOrganizationModal}
            organizationOrCollection={organizationOrCollection}
          />
        </Suspense>
      )}
      {aboutModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <AboutModal open={aboutModal} setOpen={setAboutModal} />
        </Suspense>
      )}
      {settingsModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsModal
            open={settingsModal}
            setOpen={setSettingsModal}
            personalize={personalizeModal}
          />
        </Suspense>
      )} */}
      <OrganizationModal open={showOrganizationModal} />
      <AboutModal open={aboutModal} setOpen={setAboutModal} />
      <SettingsModal
        open={settingsModal}
        setOpen={setSettingsModal}
        personalize={personalizeModal}
      />

      {trashModal && <TrashModal open={trashModal} setOpen={setTrashModal} />}

      <div ref={inputRef}></div>
      {children}
      <Footer height={HEADER_HEIGHT} px={57}>
        <Box className={classes.vmiddle}>
          <Text
            size={"xs"}
            style={{ textAlign: "center" }}
            className={cx(classes.vmiddle, classes.lineHeightFix)}
          >
            Created by&nbsp;
            <Anchor href="https://akshaykn.vercel.app/" target="_blank">
              Akshay K Nair
            </Anchor>
            ⚽, help me at&nbsp;
            <Anchor href="https://github.com/akshayknz/ktab" target="_blank">
              GitHub
            </Anchor>
            ✏
          </Text>
        </Box>
      </Footer>
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
    backgroundColor: "transparent",
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
function useForm(arg0: {
  initialValues: { email: string; termsOfService: boolean };
  validate: { email: (value: any) => "Invalid email" | null };
}) {
  throw new Error("Function not implemented.");
}
