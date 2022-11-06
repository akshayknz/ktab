import { useContext, useRef, useState } from "react";
import {
  Modal,
  Text,
  Image,
  Tabs,
  Box,
  FileInput,
  AlphaSlider,
  Slider,
  Title,
  Button,
  TextInput,
  Avatar,
} from "@mantine/core";
import { AuthContext } from "../data/contexts/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../data/contexts/redux/configureStore";
import { toggleLoginModal } from "../data/contexts/redux/states";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  personalize?: boolean;
}
export default function LoginModal({ open, setOpen, personalize }: Props) {
  const user = useContext(AuthContext);
  const {} = useSelector((state: RootState) => state.states);
  const dispatch = useDispatch();
  return (
    <>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={
          <Title weight={300} order={2}>
            Settings
          </Title>
        }
      >
        <Tabs defaultValue={personalize ? "personalize" : "profile"}>
          <Tabs.List grow>
            <Tabs.Tab value="profile">Profile</Tabs.Tab>
            <Tabs.Tab value="personalize">Personalize</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" pt="xs">
            {user ? (
              <Box px={20} pt={10} mb={20} mx="auto">
                <Avatar
                  variant="outline"
                  size="xl"
                  color="green"
                  src={user.photoURL}
                  mb={20}
                />
                <TextInput label="Name" placeholder="Name" pb={20} value={user.displayName||""} />
                <TextInput label="Email" placeholder="Email" pb={20} disabled value={user.email||""} />
                <Button
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={"https://akshaykn.vercel.app/contact"}
                >
                  Save
                </Button>
              </Box>
            ) : (
              <Box
                px={20}
                pt={30}
                mb={30}
                mx="auto"
                style={{ textAlign: "center" }}
              >
                <Text mb={10} size="xs">
                  Login to use this section
                </Text>
                <Button
                  onClick={() => dispatch(toggleLoginModal())}
                  size={"xs"}
                >
                  Login
                </Button>
              </Box>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="personalize" pt="xs">
            <Box px={20} pt={10} pb={20} mx="auto">
              <FileInput placeholder="Pick file" label="Your resume" mb={20} />
              <Image
                width={"100%"}
                height={120}
                src={undefined}
                alt="With default placeholder"
                withPlaceholder
                mb={20}
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={7}>
                Opacity{" "}
              </Text>
              <AlphaSlider
                color="#1c7ed6"
                onChange={() => {}}
                onChangeEnd={() => {}}
                value={0}
                mb={20}
              />
              <Text weight={500} sx={{ fontSize: 14 }} pb={7}>
                Blur{" "}
              </Text>
              <Slider
                size="lg"
                radius="xl"
                showLabelOnHover={false}
                mb={20}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </>
  );
}
