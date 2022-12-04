import { useContext, useEffect, useRef, useState } from "react";
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
import { useForm } from "@mantine/form";
import { auth } from "../data/firebaseConfig";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  personalize?: boolean;
}
export default function LoginModal({ open, setOpen, personalize }: Props) {
  const user = useContext(AuthContext);
  const {} = useSelector((state: RootState) => state.states);
  const dispatch = useDispatch();
  const profileForm = useForm({
    initialValues: {
      displayName: "",
      email: "",
    },
    validate: {
      displayName: (value) => (value ? null : "Please enter a username"),
    },
  });
  useEffect(() => {
    profileForm.setFieldValue("displayName", user?.displayName || "");
    profileForm.setFieldValue("email", user?.email || "");
  }, [open]);
  const handleProfileSubmit = async (values: {
    displayName: string;
    email: string;
  }) => {
    user
      ?.updateProfile({
        displayName: values.displayName,
        // photoURL: "https://example.com/jane-q-user/profile.jpg",
      })
      .then(
        function () {
          setOpen(false);
        },
        function (error) {
          console.log(error);
        }
      );
  };
  const signOut = async () => {
    await auth.signOut();
  };
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
                <form
                  onSubmit={profileForm.onSubmit((values) =>
                    handleProfileSubmit(values)
                  )}
                >
                  <Avatar
                    variant="outline"
                    size="xl"
                    color="green"
                    src={user.photoURL}
                    mb={20}
                  />
                  <TextInput
                    label="Name"
                    placeholder="Name"
                    pb={20}
                    {...profileForm.getInputProps("displayName")}
                  />
                  <TextInput
                    label="Email"
                    placeholder="Email"
                    pb={20}
                    disabled
                    {...profileForm.getInputProps("email")}
                  />
                  <Button type="submit" mr={7}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    mr={7}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    mr={7}
                    onClick={signOut}
                  >
                    Logout
                  </Button>
                </form>
              </Box>
            ) : (
              <LoginToUse open={open} setOpen={setOpen} />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="personalize" pt="xs">
            {user ? (
              <Box px={20} pt={10} pb={20} mx="auto">
                <FileInput
                  placeholder="Pick file"
                  label="Your resume"
                  mb={20}
                />
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
            ) : (
              <LoginToUse open={open} setOpen={setOpen} />
            )}
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </>
  );
}

function LoginToUse({ setOpen }: Props) {
  const dispatch = useDispatch();

  return (
    <Box px={20} pt={30} mb={30} mx="auto" style={{ textAlign: "center" }}>
      <Text mb={10} size="xs">
        Login to use this section
      </Text>
      <Button
        onClick={() => {
          dispatch(toggleLoginModal());
          setOpen(false);
        }}
        size={"xs"}
      >
        Login
      </Button>
    </Box>
  );
}
