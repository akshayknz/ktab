import { useContext, useRef, useState } from "react";
import {
  Modal,
  Button,
  Group,
  SimpleGrid,
  Accordion,
  createStyles,
  Input,
  PasswordInput,
  Title,
} from "@mantine/core";
import { BsGoogle } from "react-icons/bs";
import { ImFacebook } from "react-icons/im";
import { HiOutlineMail } from "react-icons/hi";
import { AuthContext } from "../data/contexts/AuthContext";
import { auth } from "../data/firebaseConfig";
import { GoogleAuthProvider } from "firebase/auth";
import { AccordionControl } from "@mantine/core/lib/Accordion/AccordionControl/AccordionControl";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { toggleLoginModal } from "../data/contexts/redux/states";
import { useDispatch } from "react-redux";
interface Props {
  open: boolean;
}
export default function LoginModal({ open }: Props) {
  const user = useContext(AuthContext);
  const dispatch = useDispatch();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const createAccount = async () => {
    try {
      await auth.createUserWithEmailAndPassword(
        emailRef.current!.value,
        passwordRef.current!.value
      );
      dispatch(toggleLoginModal());
    } catch (error) {
      console.log(error);
    }
  };
  const signIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(
        emailRef.current!.value,
        passwordRef.current!.value
      );
      dispatch(toggleLoginModal());
    } catch (error) {
      console.log(error);
    }
  };
  const signOut = async () => {
    await auth.signOut();
  };
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      auth.signInWithPopup(provider).then((result) => {
        console.log(result);
        dispatch(toggleLoginModal());
      });
    } catch (error) {}
  };
  return (
    <>
      <Modal
        opened={open}
        onClose={() => dispatch(toggleLoginModal())}
        title={
          <Title weight={300} order={2}>
            Login
          </Title>
        }
      >
        <SimpleGrid cols={1} mx={10} my={20}>
          <Input.Wrapper id="input-demo" label="Email">
            <Input placeholder="Your email" ref={emailRef} />
          </Input.Wrapper>
          <PasswordInput
            ref={passwordRef}
            placeholder="Password"
            label="Password"
            description="Enter your password of existing or new account"
          />
          <Button
            leftIcon={<MdOutlineMarkEmailUnread size={14} />}
            color="dark"
            onClick={createAccount}
          >
            Signup using Email
          </Button>
          <Button
            leftIcon={<HiOutlineMail size={14} />}
            color="dark"
            onClick={signIn}
          >
            Login using Email
          </Button>
          <Button
            leftIcon={<BsGoogle size={14} />}
            color="red 6"
            onClick={signInWithGoogle}
          >
            Login using Google
          </Button>
          <Button leftIcon={<ImFacebook size={14} />} color="indigo">
            Login using Facebook
          </Button>
        </SimpleGrid>
        {/* Modal content */}
      </Modal>
    </>
  );
}
