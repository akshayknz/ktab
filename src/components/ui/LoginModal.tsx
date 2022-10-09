import { useContext, useRef, useState } from 'react';
import { Modal, Button, Group, SimpleGrid } from '@mantine/core';
import { BsGoogle } from 'react-icons/bs';
import { ImFacebook } from 'react-icons/im';
import { HiOutlineMail } from 'react-icons/hi';
import { AuthContext } from '../data/contexts/AuthContext';
import { auth } from '../data/firebaseConfig';
import { GoogleAuthProvider } from 'firebase/auth';
interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function LoginModal({open, setOpen} : Props) {
  const user = useContext(AuthContext)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const createAccount =async () => {
    try {
      await auth.createUserWithEmailAndPassword(
        emailRef.current!.value,
        passwordRef.current!.value
      );
    } catch (error) {
      console.log(error);
    }
  }
  const signIn =async () => {
    try {
      await auth.signInWithEmailAndPassword(
        emailRef.current!.value,
        passwordRef.current!.value
      )
    } catch (error) {
      console.log(error);
    }
  }
  const signOut =async () => {
    await auth.signOut()
  }
  const signInWithGoogle =async () => {
    const provider = new GoogleAuthProvider();
    try {
      auth.signInWithPopup(provider)
      .then(result=>{
        console.log(result);
        
      })
    } catch (error) {
      
    }
  }
  return (
    <>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Login"
      >
        {JSON.stringify(auth.currentUser?.email)}
        <input ref={emailRef} type={"email"} placeholder={"email"}></input>
        <input ref={passwordRef} type={"password"} placeholder={"password"}></input>
        <button onClick={createAccount}>Create Account</button>
        <button onClick={signIn}>Sign in</button>
        <button onClick={signOut}>Sign out</button>
        <button onClick={signInWithGoogle}>Sign in with google</button>
        <SimpleGrid cols={1}>
            <Button leftIcon={<HiOutlineMail size={14} />} color="dark">
                Login using Email
            </Button>
            <Button leftIcon={<BsGoogle size={14} />} color="red 6">
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

