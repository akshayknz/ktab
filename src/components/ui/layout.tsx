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
  Avatar,
  Anchor,
  Loader,
  useMantineTheme,
  Input,
} from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";
import { RiTableFill } from "react-icons/ri";
import { MdKeyboardArrowRight, MdPersonOutline } from "react-icons/md";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import LoginModal from "./LoginModal";
import { AuthContext } from "../data/contexts/AuthContext";
import { auth } from "../data/firebaseConfig";
import React from "react";
import OrganizationModal from "./OrganizationModal";
import AboutModal from "./AboutModal";
import SettingsModal from "./SettingsModal";
import { useSelector } from "react-redux";
import { RootState } from "../data/contexts/redux/configureStore";
import { useDispatch } from "react-redux";
import {
  setFilterText,
  toggleLoginModal,
  toggleOrganizationModal,
} from "../data/contexts/redux/states";
import TrashModal from "./TrashModal";
import ArchiveModal from "./ArchiveModal";
import { setUserId } from "../data/contexts/redux/actions";
import useViewport from "../data/useViewport";
export function Layout({ children }: DoubleHeaderProps) {
  const user = useContext(AuthContext);
  const theme = useMantineTheme();
  const vp = useViewport();
  const { classes, cx } = useStyles();
  const inputRef = useRef<any>(null);
  const [aboutModal, setAboutModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [trashModal, setTrashModal] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [personalizeModal, setPersonalizeModal] = useState(false);
  const { showOrganizationModal, showLoginModal } = useSelector(
    (state: RootState) => state.states
  );
  const { syncing } = useSelector((state: RootState) => state.actions);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setUserId(user?.uid ? user.uid : "guest"));
  }, [user]);
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
        px={vp.tab ? 10 : 57}
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
                      onClick={() => {
                        closeMenu();
                        dispatch(toggleOrganizationModal("item"));
                      }}
                    >
                      Tab
                    </Menu.Item>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={() => {
                        closeMenu();
                        dispatch(toggleOrganizationModal("item"));
                      }}
                    >
                      Link
                    </Menu.Item>
                    <Menu.Item
                      className={classes.submenuItem}
                      onClick={() => {
                        closeMenu();
                        dispatch(toggleOrganizationModal("item"));
                      }}
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
          {vp.tab ? null : (
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
                <Menu.Item
                  className={classes.submenuItem}
                  onClick={() => {
                    closeMenu();
                    setArchiveModal((prevState) => !prevState);
                  }}
                >
                  Archive
                </Menu.Item>
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
          )}
          {vp.tab ? null : (
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
          )}
          {vp.tab ? null : (
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
          )}
          
        </Box>
        
        <Box className={classes.vmiddle} style={{ float: "right"}}>
        <Input
            variant="filled"
            placeholder="Search"
            size="xs"
            sx={{ display: "inline-block", width: "200px", marginTop:"2px" }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(setFilterText(event.currentTarget.value))
            }
          />
          {vp.tab ? null : (
            <Button
              variant="default"
              radius="xs"
              size="xs"
              compact
              className={cx(classes.vmiddle, classes.menuitem)}
              onClick={() => {
                if (user) {
                  setSettingsModal((prevState) => !prevState);
                  setPersonalizeModal(false);
                } else {
                  dispatch(toggleLoginModal());
                }
              }}
            >
              <Avatar
                size="sm"
                color="green"
                radius="md"
                src={user?.photoURL}
                mr={user ? 10 : 0}
              >
                <MdPersonOutline size={15} />
              </Avatar>
              {user ? <>Welcome, {user?.displayName}</> : null}
            </Button>
          )}
          {vp.tab ? null : (
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
                          <Text weight={500}>
                            Item reminder for the next day
                          </Text>
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
                          since last visit, review them to select which one
                          should be added to your gallery
                        </Text>
                      )}
                    </Card>
                  ))}
                </ScrollArea>
              </Popover.Dropdown>
            </Popover>
          )}
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
                onClick={() => {
                  dispatch(toggleLoginModal());
                }}
              >
                Login
              </Button>
            </>
          )}
          <LoginModal open={showLoginModal} />
        </Box>
      </Header>
      <Box
        className={`syncing-popup ${syncing && "syncing-true"}`}
        sx={{
          background: theme.colors.dark,
        }}
      >
        <Loader color="white" size="xs" />
        <Text pl={9} size="xs">
          Syncing {syncing}
        </Text>
      </Box>
      <OrganizationModal open={showOrganizationModal} />
      <AboutModal open={aboutModal} setOpen={setAboutModal} />
      <SettingsModal
        open={settingsModal}
        setOpen={setSettingsModal}
        personalize={personalizeModal}
      />

      {trashModal && <TrashModal open={trashModal} setOpen={setTrashModal} />}
      {archiveModal && (
        <ArchiveModal open={archiveModal} setOpen={setArchiveModal} />
      )}

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
              Morpheus
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
